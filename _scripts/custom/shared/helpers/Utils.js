// =========================================================================
// 🔧 CLASE: UTILS
// Utilidades transversales del sistema.
// No contiene lógica de dominio. No depende de evaluadores.
//
// Nota: Utils NO tiene init() porque sus métodos son mayormente estáticos
// en naturaleza y no necesitan Settings para operar (trabajan con los
// parámetros que les pasa el caller). Los callers que necesitan formatos
// de fecha los obtienen de Settings directamente.
// =========================================================================
class Utils {

    constructor() {
        // Constructor vacío — requerimiento CustomJS
    }

    // ─────────────────────────────────────────────
    // TIEMPO Y FECHAS
    // ─────────────────────────────────────────────

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** Fecha+hora actual en el formato estándar del vault. */
    getNowFormatted(format) {
        return window.moment().format(format ?? "MMM DD, YY - HH:mm");
    }

    /** Fecha actual (sin hora) en el formato estándar del vault. */
    getTodayFormatted(format) {
        return window.moment().format(format ?? "MMM DD, YY");
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
     * @param {App}    app
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
     * @param {App}    app
     * @param {TFile}  file
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
     * @param {App}    app
     * @param {TFile}  file
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
    // VAULT — QUERIES
    // ─────────────────────────────────────────────

    /**
     * Devuelve todos los archivos Markdown del vault con el fileClass indicado.
     * Acepta un caché opcional para evitar re-iterar el vault en la misma ejecución.
     *
     * @param {App}    app
     * @param {string} fileClass
     * @param {Map}   [cache] - Map<string, TFile[]> compartido por la ejecución
     * @returns {TFile[]}
     */
    getFilesByClass(app, fileClass, cache) {
        if (cache?.has(fileClass)) return cache.get(fileClass);

        const result = app.vault.getMarkdownFiles().filter(file => {
            const fm = app.metadataCache.getFileCache(file)?.frontmatter;
            return fm?.fileClass === fileClass;
        });

        if (cache) cache.set(fileClass, result);
        return result;
    }

    /**
     * Obtiene el frontmatter de un archivo.
     * @param {App}   app
     * @param {TFile} file
     * @returns {Object|null}
     */
    getFrontmatter(app, file) {
        return app.metadataCache.getFileCache(file)?.frontmatter ?? null;
    }

    // ─────────────────────────────────────────────
    // UI — BOTONES Y COMPONENTES
    // ─────────────────────────────────────────────

    /**
     * Crea el botón de archivar/desarchivar para una fila de tabla Dataview.
     *
     * @param {DataviewAPI}  dv
     * @param {DataviewPage} page
     * @param {Function}     [f] - fieldModifier de Metadata Menu
     * @param {number}       [sleepMs] - ms de espera antes de ejecutar la macro
     * @returns {HTMLElement}
     */
    createArchiveButton(dv, page, f, sleepMs = 500) {
        if (!f) {
            const plugin = app.plugins?.plugins?.['metadata-menu'];
            if (!plugin?.api?.fieldModifier) {
                console.warn(
                    "[Utils.createArchiveButton] Metadata Menu no disponible y no se recibió fieldModifier."
                );
                return dv.el('span', '⚠️');
            }
            f = plugin.api.fieldModifier;
        }

        const button = f(dv, page, "archived");
        button.onclick = async () => {
            await this.sleep(sleepMs);
            const quickAddApi = app.plugins.plugins.quickadd.api;
            await quickAddApi.executeChoice("Move By Archived", { value: page.file.path });
        };
        return button;
    }
}