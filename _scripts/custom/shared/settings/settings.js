// =========================================================================
// ⚙️ CLASE: SETTINGS
// Responsabilidad única: leer el vault UNA sola vez y exponer toda la
// configuración del sistema (rutas, formatos, constantes de dominio).
//
// Es la ÚNICA clase autorizada a leer app.metadataCache en construcción,
// ya que es la fuente de verdad de la que todos los demás módulos dependen.
// Ningún otro módulo debe leer _config/*.md directamente.
// =========================================================================
class Settings {

    constructor() {
        // ── Rutas de archivos de configuración ────────────────────────────
        this.SETTINGS_PATH = '_config/settings.md';
        this.VALUES_PATH   = '_config/values.md';
        this.TABLES_PATH   = '_config/tables.md';

        // ── Inicializado al llamar init() ─────────────────────────────────
        this.isInitialized = false;

        // ── Carpetas del vault ────────────────────────────────────────────
        this.TEMPLATES_FOLDER  = null;
        this.PROJECTS_FOLDER   = null;
        this.AREAS_FOLDER      = null;
        this.RESOURCES_FOLDER  = null;
        this.ARCHIVES_FOLDER   = null;
        this.AUTHORS_FOLDER    = null;
        this.SOURCES_FOLDER    = null;
        this.TASKS_FOLDER      = null;
        this.DAILIES_FOLDER    = null;
        this.FILE_CLASS_LIST   = null;

        // ── Nombres de plantillas ─────────────────────────────────────────
        this.TEMPLATE_FILE_NAMES = null;

        // ── Mapas de valores (statusMap, priorityMap, etc.) ───────────────
        this.STATUS_MAP         = null;
        this.PRIORITY_MAP       = null;
        this.TASK_SIZE_MAP      = null;
        this.PROJECT_SIZE_MAP   = null;
        this.ALL_VALUES         = null;

        // ── Configuración de tablas Dataview ──────────────────────────────
        this.TABLES_CONFIG      = null;

        // ── Logger ────────────────────────────────────────────────────────
        this.LOG_FOLDER         = "_logs";
        this.LOG_PREFIX         = "syslog_";
        this.LOG_EXTENSION      = ".txt";
        this.LOG_ROTATION       = "monthly"; // "daily" | "weekly" | "monthly"
        this.LOG_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

        // ── Constantes de dominio: Evaluación de Tareas ───────────────────
        this.TASK_MAX_LOOPS = 30;

        // Umbrales de urgencia por días restantes y grupo de tamaño (tarea)
        // grupo 1 = very_small/small | grupo 2 = medium/large | grupo 3 = very_large/huge/epic
        this.TASK_URGENCY_THRESHOLDS = {
            overdue: -1,   // < 0 días → critical siempre
            group1: { critical: null, high: 2, medium: 6, low: 13 },
            group2: { critical: 2,   high: 6, medium: 13, low: null },
            group3: { critical: 6,   high: 13, medium: null, low: null },
        };

        // Umbrales de urgencia para proyectos
        this.PROJECT_URGENCY_THRESHOLDS = {
            overdue: -1,
            group1: { critical: 3,  high: 7,  medium: 10, low: null },
            group2: { critical: 7,  high: 15, medium: 30, low: null },
            group3: { critical: 15, high: 30, medium: 60, low: null },
        };

        // Pesos fibonacci para los tamaños de tarea
        this.TASK_SIZE_WEIGHTS = {
            very_small: 1,
            small:      2,
            medium:     3,
            large:      5,
            very_large: 8,
            huge:       13,
            epic:       21,
        };

        // Umbrales de peso para asignar tamaño desde subtareas
        this.TASK_SIZE_THRESHOLDS = [
            { limit: 1,        key: 'very_small' },
            { limit: 2,        key: 'small'      },
            { limit: 3,        key: 'medium'     },
            { limit: 5,        key: 'large'      },
            { limit: 8,        key: 'very_large' },
            { limit: 13,       key: 'huge'       },
            { limit: Infinity, key: 'epic'       },
        ];

        // ── Formatos de fecha ─────────────────────────────────────────────
        this.DATE_FORMAT_DATETIME  = "MMM DD, yy - HH:mm";
        this.DATE_FORMAT_DATE      = "MMM DD, yy";
        this.DATE_FORMAT_ISO       = "YYYY-MM-DD";

        // Regex para quitar el sufijo de fecha en nombres de tareas recurrentes
        // Ej: "Mi Tarea - 2026-03-05" → "Mi Tarea"
        this.DATE_SUFFIX_REGEX = /\s*-\s*\d{4}-\d{2}-\d{2}$/;

        // ── Tiempos de espera (ms) ────────────────────────────────────────
        this.SLEEP_AFTER_FILE_OP  = 500;  // Tras crear/abrir archivos
        this.SLEEP_AFTER_SYNC     = 800;  // Tras sincronizar jerarquía
    }

    // =========================================================================
    // INIT — Lee el vault y populiza todas las propiedades
    // =========================================================================

    /**
     * Lee los tres archivos de configuración del vault y populiza
     * todas las propiedades de esta clase.
     *
     * Debe llamarse UNA sola vez desde SystemBootstrap, antes de
     * inicializar cualquier otro módulo.
     *
     * @throws {Error} Si algún archivo de configuración no existe o está vacío.
     */
    init() {
        this._loadSettings();
        this._loadValues();
        this._loadTables();
        this.isInitialized = true;
    }

    // ─────────────────────────────────────────────
    // PRIVADOS — Lectura del vault
    // ─────────────────────────────────────────────

    _readFrontmatter(path) {
        const file = app.vault.getAbstractFileByPath(path);
        if (!file) throw new Error(`[Settings] Archivo de configuración no encontrado: "${path}"`);
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        if (!fm)   throw new Error(`[Settings] Frontmatter vacío en: "${path}"`);
        return fm;
    }

    _loadSettings() {
        const fm = this._readFrontmatter(this.SETTINGS_PATH);

        this.FILE_CLASS_LIST  = fm.fileClassList  ?? [];
        this.TEMPLATES_FOLDER = fm.templatesFolder ?? "_templates";
        this.PROJECTS_FOLDER  = fm.projectsFolder  ?? "10 - Projects";
        this.AREAS_FOLDER     = fm.areasFolder     ?? "20 - Areas";
        this.RESOURCES_FOLDER = fm.resourcesFolder ?? "30 - Resources";
        this.ARCHIVES_FOLDER  = fm.archivesFolder  ?? "40 - Archives";
        this.AUTHORS_FOLDER   = fm.authorsFolder   ?? "30 - Resources/Authors";
        this.SOURCES_FOLDER   = fm.sourcesFolder   ?? "30 - Resources/Sources";
        this.TASKS_FOLDER     = fm.tasksFolder     ?? "50 - Tasks";
        this.DAILIES_FOLDER   = fm.dailiesFolder   ?? "60 - Daily Notes";

        this.TEMPLATE_FILE_NAMES = {
            area     : fm.areaTemplateFileName     ?? "Area - Template.md",
            project  : fm.projectTemplateFileName  ?? "Project - Template.md",
            resource : fm.resourceTemplateFileName ?? "Resource - Template.md",
            task     : fm.taskTemplateFileName     ?? "Task - Template.md",
            author   : fm.authorTemplateFileName   ?? "Author - Template.md",
            source   : fm.sourceTemplateFileName   ?? "Source - Template.md",
            daily    : fm.dailyTemplateFileName    ?? "Daily Note - Template.md",
        };
    }

    _loadValues() {
        const fm = this._readFrontmatter(this.VALUES_PATH);

        this.STATUS_MAP       = fm.statusMap       ?? {};
        this.PRIORITY_MAP     = fm.priorityMap     ?? {};
        this.TASK_SIZE_MAP    = fm.taskSizeMap      ?? {};
        this.PROJECT_SIZE_MAP = fm.projectSizeMap  ?? {};
        this.ALL_VALUES       = fm;

        // Validaciones críticas
        if (Object.keys(this.STATUS_MAP).length === 0) {
            throw new Error("[Settings] statusMap está vacío. Verifica '_config/values.md'.");
        }
        if (Object.keys(this.PRIORITY_MAP).length === 0) {
            throw new Error("[Settings] priorityMap está vacío. Verifica '_config/values.md'.");
        }
    }

    _loadTables() {
        const fm = this._readFrontmatter(this.TABLES_PATH);
        this.TABLES_CONFIG = fm;
    }

    // =========================================================================
    // GETTERS PÚBLICOS DE CONVENIENCIA
    // =========================================================================

    /** Ruta a la plantilla de un fileClass dado. */
    getTemplatePath(fileClass) {
        return `${this.TEMPLATES_FOLDER}/${this.TEMPLATE_FILE_NAMES[fileClass]}`;
    }

    /** Carpeta activa de un fileClass dado. */
    getFolder(fileClass) {
        return this._getFoldersMap()[fileClass];
    }

    /** Carpeta de archivo (archived) de un fileClass dado. */
    getArchivedFolder(fileClass) {
        return `${this.ARCHIVES_FOLDER}/${this._getFoldersMap()[fileClass]}`;
    }

    _getFoldersMap() {
        return {
            area     : this.AREAS_FOLDER,
            project  : this.PROJECTS_FOLDER,
            resource : this.RESOURCES_FOLDER,
            task     : this.TASKS_FOLDER,
            author   : this.AUTHORS_FOLDER,
            source   : this.SOURCES_FOLDER,
            daily    : this.DAILIES_FOLDER,
        };
    }

    /**
     * Resuelve el valor display de un tamaño de tarea dado su key interno.
     * Ej: 'very_small' → '📌 Very Small'
     */
    resolveTaskSizeValue(key) {
        return this.TASK_SIZE_MAP[key] ?? null;
    }

    resolveProjectSizeValue(key) {
        return this.PROJECT_SIZE_MAP[key] ?? null;
    }
}