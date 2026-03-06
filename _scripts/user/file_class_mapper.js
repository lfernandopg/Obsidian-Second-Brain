class FileClassMapper {

    constructor() {
        this._loadSettings();
        this._buildFolderMaps();
        this._buildRelationMaps();
        this._loadValues();
        this._loadTables();
    }

    // ─────────────────────────────────────────────
    // INIT – CARGA DE CONFIGURACIÓN
    // ─────────────────────────────────────────────

    _loadSettings() {
        const SETTINGS_PATH = '_config/settings.md';
        const settingsFile = app.vault.getAbstractFileByPath(SETTINGS_PATH);
        if (!settingsFile) throw new Error(`No se encontró el archivo de configuración: ${SETTINGS_PATH}`);
        const fm = app.metadataCache.getFileCache(settingsFile)?.frontmatter;

        this.FILE_CLASS_LIST    = fm?.fileClassList;
        this.TEMPLATES_FOLDER   = fm?.templatesFolder;
        this.PROJECTS_FOLDER    = fm?.projectsFolder;
        this.AREAS_FOLDER       = fm?.areasFolder;
        this.RESOURCES_FOLDER   = fm?.resourcesFolder;
        this.ARCHIVES_FOLDER    = fm?.archivesFolder;
        this.AUTHORS_FOLDER     = fm?.authorsFolder;
        this.SOURCES_FOLDER     = fm?.sourcesFolder;
        this.TASKS_FOLDER       = fm?.tasksFolder;
        this.DAILIES_FOLDER     = fm?.dailiesFolder;

        // Nombres de archivo de plantillas
        this._templateFileNames = {
            area     : fm?.areaTemplateFileName,
            project  : fm?.projectTemplateFileName,
            resource : fm?.resourceTemplateFileName,
            task     : fm?.taskTemplateFileName,
            author   : fm?.authorTemplateFileName,
            source   : fm?.sourceTemplateFileName,
            daily    : fm?.dailyTemplateFileName,
        };
    }

    _buildFolderMaps() {
        const A = this.ARCHIVES_FOLDER;

        this.FOLDERS_MAP = {
            area     : this.AREAS_FOLDER,
            project  : this.PROJECTS_FOLDER,
            resource : this.RESOURCES_FOLDER,
            task     : this.TASKS_FOLDER,
            author   : this.AUTHORS_FOLDER,
            source   : this.SOURCES_FOLDER,
            daily    : this.DAILIES_FOLDER,
        };

        this.ARCHIVED_FOLDERS_MAP = Object.fromEntries(
            Object.entries(this.FOLDERS_MAP).map(([k, v]) => [k, `${A}/${v}`])
        );

        this.TEMPLATE_FILE_PATH_MAP = Object.fromEntries(
            Object.entries(this._templateFileNames).map(([k, v]) => [
                k, `${this.TEMPLATES_FOLDER}/${v}`
            ])
        );

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

    _loadValues() {
        const VALUES_PATH = '_config/values.md';
        const valuesFile = app.vault.getAbstractFileByPath(VALUES_PATH);
        if (!valuesFile) throw new Error(`No se encontró: ${VALUES_PATH}`);
        const fm = app.metadataCache.getFileCache(valuesFile)?.frontmatter ?? {};

        this.STATUS_MAP   = fm.statusMap   ?? {};
        this.PRIORITY_MAP = fm.priorityMap ?? {};
        this.SIZE_MAP     = fm.sizeMap     ?? {};
        this.ALL_VALUES   = fm;
    }

    _loadTables() {
        const TABLES_PATH = '_config/tables.md';
        const tablesFile = app.vault.getAbstractFileByPath(TABLES_PATH);
        if (!tablesFile) throw new Error(`No se encontró: ${TABLES_PATH}`);
        this.TABLES_CONFIG = app.metadataCache.getFileCache(tablesFile)?.frontmatter ?? {};
    }

    // ─────────────────────────────────────────────
    // GETTERS PÚBLICOS
    // ─────────────────────────────────────────────

    getFolder(fileClass)           { return this.FOLDERS_MAP[fileClass]; }
    getCapitalizeName(fileClass)   { return this.CAPITALIZE_NAMES_MAP[fileClass]; }
    getArchivedFolder(fileClass)   { return this.ARCHIVED_FOLDERS_MAP[fileClass]; }
    getTemplateFilePathMap(fileClass) { return this.TEMPLATE_FILE_PATH_MAP[fileClass]; }
    getRelations(fileClass)        { return this.RELATIONS_MAP[fileClass]; }
    getRelationToShow(key)         { return this.RELATION_TO_SHOW_MAP[key]; }
}