// =========================================================================
// 📢 CLASE: MESSAGES
// Centraliza TODOS los textos visibles al usuario.
// No tiene dependencias externas — es pura data.
//
// Uso:
//   customJS.Messages.get("SYNC_TASK_COMPLETE", { updated: 5, archived: 1 })
// =========================================================================
class Messages {

    constructor() {
        // Constructor vacío — requerimiento CustomJS
        this.isInitialized = false;
        this._catalog      = null;
    }

    /**
     * Inicializa el catálogo de mensajes.
     * Llamado por SystemBootstrap.boot().
     */
    init() {
        this._catalog = {

            // ── Bootstrap ─────────────────────────────────────────────────
            BOOTSTRAP_MISSING_MODULES:
                "❌ SystemBootstrap: Faltan módulos en customJS. Verifica la consola.",
            BOOTSTRAP_BOOT_ERROR:
                (msg) => `❌ Error crítico al iniciar el sistema: ${msg}`,

            // ── Módulos no cargados ────────────────────────────────────────
            MODULES_NOT_LOADED:
                "❌ Error: customJS o sus módulos no están cargados.",

            // ── Sync Task Hierarchy ────────────────────────────────────────
            SYNC_TASK_START:
                "⏳ Sincronizando jerarquía de tareas...",
            SYNC_TASK_UP_TO_DATE:
                "👍 Todo el sistema está perfectamente sincronizado y al día.",
            SYNC_TASK_COMPLETE:
                (d) => {
                    let msg = `✅ Sincronización completa:`;
                    if (d.updated)        msg += `\n🔄 ${d.updated} tareas actualizadas.`;
                    if (d.archived)       msg += `\n📦 ${d.archived} tareas archivadas.`;
                    if (d.priorityScaled) msg += `\n🔥 ${d.priorityScaled} escalaron su prioridad.`;
                    if (d.recurrences)    msg += `\n♻️ ${d.recurrences} tareas recurrentes creadas.`;
                    if (d.sizeScaled)     msg += `\n📐 ${d.sizeScaled} recalcularon su tamaño.`;
                    return msg;
                },
            SYNC_TASK_ERROR:
                "❌ Error en 'Sync Task Hierarchy'. Revisa la consola.",

            // ── Sync Project Hierarchy ─────────────────────────────────────
            SYNC_PROJECT_START:
                "⏳ Sincronizando jerarquía de proyectos...",
            SYNC_PROJECT_UP_TO_DATE:
                "👍 Los proyectos están perfectamente sincronizados.",
            SYNC_PROJECT_COMPLETE:
                (d) => `✅ ${d.updated} proyectos sincronizados. (${d.archived} archivados).\n` +
                    `🔥 ${d.priorityScaled} proyectos escalaron su prioridad.`,

            // ── Frontmatter ────────────────────────────────────────────────
            FRONTMATTER_MISSING_VARS:
                "❌ Faltan variables (filePath o properties) para actualizar el frontmatter.",
            FRONTMATTER_FILE_NOT_FOUND:
                (path) => `❌ Archivo no encontrado: ${path}`,
            FRONTMATTER_NOT_MARKDOWN:
                (name) => `❌ '${name}' no es un archivo Markdown.`,
            FRONTMATTER_UPDATE_SUCCESS:
                (name) => `✅ Frontmatter de '${name}' actualizado.`,
            FRONTMATTER_UPDATE_ERROR:
                (name) => `❌ Error al actualizar '${name}'. Revisa la consola.`,

            // ── Create By Template ─────────────────────────────────────────
            CREATE_INVALID_NAME:
                "❌ El nombre contiene caracteres inválidos o está vacío.",
            CREATE_TEMPLATE_NOT_FOUND:
                (path) => `❌ Plantilla no encontrada: ${path}`,
            CREATE_FILE_EXISTS:
                (name) => `⚠️ Ya existe: ${name}.md`,
            CREATE_SUCCESS:
                (type, folder) => `✅ ${type} creado en ${folder}/`,
            CREATE_ERROR:
                (msg) => `❌ No se pudo crear la nota: ${msg}`,

            // ── Link To Active File ────────────────────────────────────────
            LINK_NO_ACTIVE_FILE:
                "❌ No hay ningún archivo activo.",
            LINK_NO_FILECLASS:
                (name) => `❌ '${name}' no tiene un 'fileClass' definido.`,
            LINK_NO_RELATIONS:
                (fc) => `🤷‍♂️ No hay relaciones definidas para '${fc}'.`,
            LINK_NO_FILES_AVAILABLE:
                (fc) => `⚠️ No hay archivos de tipo '${fc}' disponibles.`,
            LINK_SUCCESS:
                (from, to) => `🔗 Enlazado: ${from} ➡️ ${to}`,

            // ── Move By Archived ───────────────────────────────────────────
            MOVE_CASCADE_ARCHIVED:
                (count) => `📦 Cascada completada: ${count} archivo(s) movido(s) al archivo.`,
            MOVE_CASCADE_RESTORED:
                (count) => `📤 Cascada completada: ${count} archivo(s) recuperado(s) a la bóveda principal.`,

            // ── Dataview / Table ───────────────────────────────────────────
            TABLE_METADATA_MENU_UNAVAILABLE:
                (header) =>
                    `⚠️ **Metadata Menu no disponible.** La tabla "${header}" no puede renderizarse ` +
                    `hasta que el plugin termine de cargar. Recarga la nota o espera unos segundos.`,
            TABLE_QUERY_ERROR:
                (header) => `❌ Error al cargar datos para "${header}". Revisa la consola.`,

            // ── Utils / Botones ────────────────────────────────────────────
            ARCHIVE_BUTTON_UNAVAILABLE:
                "⚠️ MM no disponible",
        };

        this.isInitialized = true;
    }

    /**
     * Obtiene un mensaje del catálogo.
     * Si el mensaje es una función, la invoca con `data`.
     *
     * @param {string} key   - Clave del catálogo
     * @param {any}   [data] - Argumento para mensajes dinámicos
     * @returns {string}
     */
    get(key, data) {
        if (!this.isInitialized) {
            console.warn(`[Messages] Catálogo no inicializado. Clave: "${key}"`);
            return `[MSG:${key}]`;
        }

        const entry = this._catalog[key];

        if (entry === undefined) {
            console.warn(`[Messages] Clave desconocida: "${key}"`);
            return `[MSG:${key}]`;
        }

        return typeof entry === "function" ? entry(data) : entry;
    }
}