// =========================================================================
// 🗂️ CLASE: FILE CLASS MAPPER
// Responsabilidad única: mapear fileClass keys → rutas, nombres, relaciones.
//
// NO lee el vault. NO accede a app.metadataCache.
// Recibe la instancia de Settings como dependencia inyectada en init().
// =========================================================================
class FileClassMapper {

    constructor() {
        // Constructor vacío — requerimiento CustomJS
        this.isInitialized = false;

        // Pobladas en init()
        this._settings        = null;
        this.FOLDERS_MAP      = null;
        this.ARCHIVED_FOLDERS_MAP = null;
        this.TEMPLATE_PATH_MAP    = null;
        this.CAPITALIZE_NAMES_MAP = null;
        this.RELATIONS_MAP        = null;
        this.RELATION_TO_SHOW_MAP = null;
    }

    // =========================================================================
    // INIT — Recibe Settings inyectado
    // =========================================================================

    /**
     * Inicializa el mapper con la instancia de Settings ya populizada.
     *
     * @param {Settings} settings - Instancia inicializada de Settings
     * @throws {Error} Si settings no está inicializado
     */
    init(settings) {
        if (!settings?.isInitialized) {
            throw new Error("[FileClassMapper] Se requiere una instancia de Settings inicializada.");
        }

        this._settings = settings;

        this._buildFolderMaps();
        this._buildTemplatePaths();
        this._buildCapitalizeNames();
        this._buildRelationMaps();

        this.isInitialized = true;
    }

    _checkInit() {
        if (!this.isInitialized) {
            throw new Error("[FileClassMapper] No inicializado. Llama a init(settings) primero.");
        }
    }

    // ─────────────────────────────────────────────
    // PRIVADOS — Construcción de mapas
    // ─────────────────────────────────────────────

    _buildFolderMaps() {
        const s = this._settings;

        this.FOLDERS_MAP = {
            area     : s.AREAS_FOLDER,
            project  : s.PROJECTS_FOLDER,
            resource : s.RESOURCES_FOLDER,
            task     : s.TASKS_FOLDER,
            author   : s.AUTHORS_FOLDER,
            source   : s.SOURCES_FOLDER,
            daily    : s.DAILIES_FOLDER,
        };

        this.ARCHIVED_FOLDERS_MAP = Object.fromEntries(
            Object.entries(this.FOLDERS_MAP).map(([k, v]) => [k, `${s.ARCHIVES_FOLDER}/${v}`])
        );
    }

    _buildTemplatePaths() {
        const s = this._settings;
        this.TEMPLATE_PATH_MAP = Object.fromEntries(
            Object.entries(s.TEMPLATE_FILE_NAMES).map(([k, v]) => [
                k, `${s.TEMPLATES_FOLDER}/${v}`
            ])
        );
    }

    _buildCapitalizeNames() {
        this.CAPITALIZE_NAMES_MAP = {
            area     : "Area",
            project  : "Project",
            resource : "Resource",
            task     : "Task",
            author   : "Author",
            source   : "Source",
            daily    : "Daily Note",
        };
    }

    _buildRelationMaps() {
        this.RELATIONS_MAP = {
            area: [
                { fileClassRelation: 'project',  relationToShow: 'project',  propertyToUpdate: 'area',  linkDirection: 'inward'  },
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'areas', linkDirection: 'inward'  },
                { fileClassRelation: 'task',     relationToShow: 'task',     propertyToUpdate: 'area',  linkDirection: 'inward'  },
            ],
            project: [
                { fileClassRelation: 'task',     relationToShow: 'task',     propertyToUpdate: 'project',  linkDirection: 'inward'  },
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'projects', linkDirection: 'inward'  },
                { fileClassRelation: 'area',     relationToShow: 'area',     propertyToUpdate: 'area',     linkDirection: 'outward' },
            ],
            resource: [
                { fileClassRelation: 'task',     relationToShow: 'task',        propertyToUpdate: 'tasks',     linkDirection: 'outward' },
                { fileClassRelation: 'author',   relationToShow: 'author',      propertyToUpdate: 'author',    linkDirection: 'outward' },
                { fileClassRelation: 'source',   relationToShow: 'source',      propertyToUpdate: 'source',    linkDirection: 'outward' },
                { fileClassRelation: 'project',  relationToShow: 'project',     propertyToUpdate: 'projects',  linkDirection: 'outward' },
                { fileClassRelation: 'area',     relationToShow: 'area',        propertyToUpdate: 'areas',     linkDirection: 'outward' },
                { fileClassRelation: 'resource', relationToShow: 'resource_in', propertyToUpdate: 'resources', linkDirection: 'inward'  },
                { fileClassRelation: 'resource', relationToShow: 'resource',    propertyToUpdate: 'resources', linkDirection: 'outward' },
            ],
            task: [
                { fileClassRelation: 'resource', relationToShow: 'resource',   propertyToUpdate: 'tasks',      linkDirection: 'inward'  },
                { fileClassRelation: 'project',  relationToShow: 'project',    propertyToUpdate: 'project',    linkDirection: 'outward' },
                { fileClassRelation: 'area',     relationToShow: 'area',       propertyToUpdate: 'area',       linkDirection: 'outward' },
                { fileClassRelation: 'task',     relationToShow: 'subtask',    propertyToUpdate: 'parentTask', linkDirection: 'inward'  },
                { fileClassRelation: 'task',     relationToShow: 'parentTask', propertyToUpdate: 'parentTask', linkDirection: 'outward' },
                { fileClassRelation: 'task',     relationToShow: 'nextTask',   propertyToUpdate: 'nextTask',   linkDirection: 'outward' },
            ],
            author: [
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'author', linkDirection: 'inward' },
            ],
            source: [
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'source', linkDirection: 'inward' },
            ],
            daily: [
                { fileClassRelation: 'daily', relationToShow: 'nextDaily', propertyToUpdate: 'previusDaily', linkDirection: 'inward' },
            ],
        };

        this.RELATION_TO_SHOW_MAP = {
            area        : "Area",
            project     : "Project",
            resource    : "Resource",
            task        : "Task",
            author      : "Author",
            source      : "Source",
            projects    : "Projects",
            areas       : "Areas",
            tasks       : "Tasks",
            nextTask    : "Next Task",
            parentTask  : "Parent Task",
            subtask     : "Subtask",
            nextDaily   : "Next Daily",
            resource_in : "Child Resource",
        };
    }

    // =========================================================================
    // API PÚBLICA
    // =========================================================================

    getFolder(fileClass)           { this._checkInit(); return this.FOLDERS_MAP[fileClass]; }
    getArchivedFolder(fileClass)   { this._checkInit(); return this.ARCHIVED_FOLDERS_MAP[fileClass]; }
    getTemplatePath(fileClass)     { this._checkInit(); return this.TEMPLATE_PATH_MAP[fileClass]; }
    getCapitalizeName(fileClass)   { this._checkInit(); return this.CAPITALIZE_NAMES_MAP[fileClass]; }
    getRelations(fileClass)        { this._checkInit(); return this.RELATIONS_MAP[fileClass]; }
    getRelationToShow(key)         { this._checkInit(); return this.RELATION_TO_SHOW_MAP[key]; }

    // Acceso de conveniencia a los mapas de valores (provienen de Settings)
    get FILE_CLASS_LIST() { this._checkInit(); return this._settings.FILE_CLASS_LIST; }
    get STATUS_MAP()      { this._checkInit(); return this._settings.STATUS_MAP; }
    get PRIORITY_MAP()    { this._checkInit(); return this._settings.PRIORITY_MAP; }
    get SIZE_MAP()        { this._checkInit(); return this._settings.TASK_SIZE_MAP; }
    get ALL_VALUES()      { this._checkInit(); return this._settings.ALL_VALUES; }
    get TABLES_CONFIG()   { this._checkInit(); return this._settings.TABLES_CONFIG; }

    // Mantiene compatibilidad con el método antiguo (alias)
    getTemplateFilePathMap(fileClass) { return this.getTemplatePath(fileClass); }
}