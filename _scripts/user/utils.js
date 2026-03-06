class Utils {

    // ─────────────────────────────────────────────
    // TIEMPO Y FECHAS
    // ─────────────────────────────────────────────

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** Devuelve la fecha+hora actual en el formato estándar del vault. */
    getNowFormatted() {
        return window.moment().format("MMM DD, YY - HH:mm");
    }

    /** Devuelve la fecha actual (sin hora) en el formato estándar del vault. */
    getTodayFormatted() {
        return window.moment().format("MMM DD, YY");
    }

    /** Normaliza cualquier fecha string a un objeto Date a medianoche. */
    toMidnight(dateStr) {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    /** Fecha de hoy normalizada a medianoche. */
    today() {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // ─────────────────────────────────────────────
    // MANEJO DE LINKS (Obsidian wikilinks)
    // ─────────────────────────────────────────────

    /**
     * Extrae los basenames desde una propiedad de frontmatter que puede ser
     * un string wikilink, un array de wikilinks, o nula/indefinida.
     *
     * Entradas aceptadas:
     *   "[[Mi Tarea]]"  |  ["[[Tarea A]]", "[[Tarea B]]"]  |  null
     *
     * @param {string|string[]|null} prop
     * @returns {string[]}
     */
    getLinks(prop) {
        if (!prop) return [];
        const arr = Array.isArray(prop) ? prop : [prop];
        return arr.map(item => {
            if (typeof item === 'string') {
                const match = item.match(/\[\[(.*?)(?:\|.*)?\]\]/);
                return match ? match[1] : item;
            }
            return String(item);
        });
    }

    // ─────────────────────────────────────────────
    // SISTEMA DE ARCHIVOS (Vault)
    // ─────────────────────────────────────────────

    /**
     * Crea recursivamente las carpetas de una ruta si no existen.
     * @param {App} app
     * @param {string} folderPath
     */
    async ensureFolderExists(app, folderPath) {
        const parts = folderPath.split('/');
        let currentPath = '';
        for (const part of parts) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            if (!app.vault.getAbstractFileByPath(currentPath)) {
                await app.vault.createFolder(currentPath);
            }
        }
    }

    /**
     * Mueve un archivo a destFolder de forma segura, creando la carpeta si no existe.
     * @param {App} app
     * @param {TFile} file
     * @param {string} destFolder
     * @returns {boolean} true si el archivo fue efectivamente movido.
     */
    async moveFileSafe(app, file, destFolder) {
        await this.ensureFolderExists(app, destFolder);
        const newPath = `${destFolder}/${file.basename}.${file.extension}`;
        if (file.path !== newPath) {
            await app.vault.rename(file, newPath);
            return true;
        }
        return false;
    }

    // ─────────────────────────────────────────────
    // FRONTMATTER
    // ─────────────────────────────────────────────

    /**
     * Actualiza propiedades del frontmatter de un archivo.
     * Si la propiedad existente es un array, añade el valor sin duplicar.
     * @param {App} app
     * @param {TFile} file
     * @param {Object} properties
     */
    async updateFrontmatter(app, file, properties) {
        await app.fileManager.processFrontMatter(file, (fm) => {
            for (const [key, value] of Object.entries(properties)) {
                if (Array.isArray(fm[key])) {
                    const incoming = Array.isArray(value) ? value : [value];
                    for (const item of incoming) {
                        if (!fm[key].includes(item)) fm[key].push(item);
                    }
                } else {
                    fm[key] = value;
                }
            }
        });
    }

    // ─────────────────────────────────────────────
    // VAULT – QUERIES
    // ─────────────────────────────────────────────

    /**
     * Devuelve todos los archivos Markdown del vault cuyo frontmatter
     * tenga el fileClass indicado.
     *
     * [FIX V-10] Acepta un parámetro `cache` (Map) opcional.
     * Si se pasa, devuelve el resultado desde caché en lugar de re-iterar
     * el vault completo. Úsalo así dentro de una misma ejecución de macro:
     *
     *   const cache = new Map();
     *   const tasks    = Utils.getFilesByClass(app, 'task', cache);
     *   const projects = Utils.getFilesByClass(app, 'project', cache);
     *   // La segunda llamada con 'project' itera el vault; 'task' ya está en caché.
     *
     * @param {App}    app
     * @param {string} fileClass
     * @param {Map}    [cache]   - Map<string, TFile[]> compartido por la ejecución
     * @returns {TFile[]}
     */
    getFilesByClass(app, fileClass, cache) {
        if (cache) {
            if (cache.has(fileClass)) return cache.get(fileClass);
        }

        const result = app.vault.getMarkdownFiles().filter(file => {
            const fm = app.metadataCache.getFileCache(file)?.frontmatter;
            return fm?.fileClass === fileClass;
        });

        if (cache) cache.set(fileClass, result);
        return result;
    }

    /**
     * Obtiene el frontmatter de un archivo.
     * @param {App} app
     * @param {TFile} file
     * @returns {Object|null}
     */
    getFrontmatter(app, file) {
        return app.metadataCache.getFileCache(file)?.frontmatter ?? null;
    }

    // ─────────────────────────────────────────────
    // UI – BOTONES Y COMPONENTES
    // ─────────────────────────────────────────────

    /**
     * Crea el botón de archivar/desarchivar para una fila de tabla Dataview.
     * Al hacer clic dispara la macro "Move By Archived" de QuickAdd.
     *
     * [FIX V-7] El `fieldModifier` de Metadata Menu se recibe como argumento
     * en lugar de accederse directamente al plugin desde aquí.
     * Esto elimina el acceso redundante al plugin (que podría no estar listo)
     * y desacopla Utils de Metadata Menu. El caller (Table._getFieldModifier)
     * ya valida que el plugin esté disponible antes de llegar aquí.
     *
     * Si por alguna razón `f` no llega (llamada legacy desde fuera de Table),
     * se intenta un fallback defensivo con una advertencia.
     *
     * @param {DataviewAPI} dv
     * @param {DataviewPage} page
     * @param {Function} [f] - fieldModifier de Metadata Menu (preferido)
     * @returns {HTMLElement}
     */
    createArchiveButton(dv, page, f) {
        // [FIX V-7] Fallback defensivo si se llama sin pasar `f` (compatibilidad)
        if (!f) {
            const plugin = app.plugins?.plugins?.['metadata-menu'];
            if (!plugin?.api?.fieldModifier) {
                console.warn(
                    "[Utils.createArchiveButton] Metadata Menu no disponible y no se recibió " +
                    "fieldModifier. El botón de archivo no puede renderizarse."
                );
                // Retorna un elemento vacío inofensivo en lugar de crashear
                return dv.el('span', '⚠️');
            }
            f = plugin.api.fieldModifier;
        }

        const button = f(dv, page, "archived");
        button.onclick = async () => {
            await this.sleep(500);
            const quickAddApi = app.plugins.plugins.quickadd.api;
            await quickAddApi.executeChoice("Move By Archived", { value: page.file.path });
        };
        return button;
    }
}