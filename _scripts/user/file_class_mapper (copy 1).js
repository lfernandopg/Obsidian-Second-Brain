class FileClassMapper {

    constructor() {
        //this.FOLDERS_MAP = FileClassMapper.FOLDERS_MAP;
        //this.CAPITALIZE_NAMES_MAP = FileClassMapper.CAPITALIZE_NAMES_MAP;
        //this.ARCHIVED_FOLDERS_MAP = FileClassMapper.ARCHIVED_FOLDERS_MAP;
        //this.TEMPLATE_FILE_PATH_MAP = FileClassMapper.TEMPLATE_FILE_PATH_MAP;
        //this.RELATIONS_MAP = FileClassMapper.RELATIONS_MAP;
        //this.RELATION_TO_SHOW_MAP = FileClassMapper.RELATION_TO_SHOW_MAP;
        //this.FILE_CLASS_LIST = FileClassMapper.FILE_CLASS_LIST;
        //this.TEMPLATES_FOLDER = FileClassMapper.TEMPLATES_FOLDER;
        //this.ARCHIVES_FOLDER = FileClassMapper.ARCHIVES_FOLDER;

        this.SETTINGS_PATH = '_config/settings.md';
        const file = app.vault.getAbstractFileByPath(this.SETTINGS_PATH);
        if (!file) throw new Error(`Not found file: ${this.SETTINGS_PATH}`);
        const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
        
        this.FILE_CLASS_LIST = metadata?.fileClassList;
        this.TEMPLATES_FOLDER = metadata?.templatesFolder;
        this.PROJECTS_FOLDER = metadata?.projectsFolder;
        this.AREAS_FOLDER = metadata?.areasFolder;
        this.RESOURCES_FOLDER = metadata?.resourcesFolder;
        this.ARCHIVES_FOLDER = metadata?.archivesFolder;
        this.AUTHORS_FOLDER = metadata?.authorsFolder;
        this.SOURCES_FOLDER = metadata?.sourcesFolder;
        this.TASKS_FOLDER = metadata?.tasksFolder;
        this.DAILIES_FOLDER = metadata?.dailiesFolder;

        this.AREA_TEMPLATE_FILENAME = metadata?.areaTemplateFileName;
        this.PROJECT_TEMPLATE_FILENAME = metadata?.projectTemplateFileName;
        this.RESOURCE_TEMPLATE_FILENAME = metadata?.resourceTemplateFileName;
        this.TASK_TEMPLATE_FILENAME = metadata?.taskTemplateFileName;
        this.AUTHOR_TEMPLATE_FILENAME = metadata?.authorTemplateFileName;
        this.SOURCE_TEMPLATE_FILENAME = metadata?.sourceTemplateFileName;
        this.DAILY_TEMPLATE_FILENAME = metadata?.dailyTemplateFileName;

        this.FOLDERS_MAP = {
            'area': `${this.AREAS_FOLDER}`,
            'project': `${this.PROJECTS_FOLDER}`,
            'resource': `${this.RESOURCES_FOLDER}`,
            'task': `${this.TASKS_FOLDER}`,
            'author': `${this.AUTHORS_FOLDER}`,
            'source' : `${this.SOURCES_FOLDER}`,
            'daily' : `${this.DAILIES_FOLDER}`,
        };

        this.CAPITALIZE_NAMES_MAP = {
            "area" : "Area",
            "project" : "Project",
            "resource" : "Resource",
            "task" : "Task",
            "author" : "Author",
            "source" : "Source",
            "daily" : "Daily Note",
        };

        this.ARCHIVED_FOLDERS_MAP = {
            'area': `${this.ARCHIVES_FOLDER}/${this.AREAS_FOLDER}`,
            'project': `${this.ARCHIVES_FOLDER}/${this.PROJECTS_FOLDER}`,
            'resource': `${this.ARCHIVES_FOLDER}/${this.RESOURCES_FOLDER}`,
            'task': `${this.ARCHIVES_FOLDER}/${this.TASKS_FOLDER}`,
            'author': `${this.ARCHIVES_FOLDER}/${this.AUTHORS_FOLDER}`,
            'source': `${this.ARCHIVES_FOLDER}/${this.SOURCES_FOLDER}`,
            'daily': `${this.ARCHIVES_FOLDER}/${this.DAILIES_FOLDER}`,
        };

        this.TEMPLATE_FILE_PATH_MAP = {
            'area': `${this.TEMPLATES_FOLDER}/${this.AREA_TEMPLATE_FILENAME}`,
            'project': `${this.TEMPLATES_FOLDER}/${this.PROJECT_TEMPLATE_FILENAME}`,
            'resource': `${this.TEMPLATES_FOLDER}/${this.RESOURCE_TEMPLATE_FILENAME}`,
            'task': `${this.TEMPLATES_FOLDER}/${this.TASK_TEMPLATE_FILENAME}`,
            'author': `${this.TEMPLATES_FOLDER}/${this.AUTHOR_TEMPLATE_FILENAME}`,
            'source': `${this.TEMPLATES_FOLDER}/${this.SOURCE_TEMPLATE_FILENAME}`,
            'daily': `${this.TEMPLATES_FOLDER}/${this.DAILY_TEMPLATE_FILENAME}`,
        };

        this.RELATIONS_MAP = {
            'area': [
                { fileClassRelation: 'project', relationToShow: 'project', propertyToUpdate: 'area', linkDirection: 'inward' },
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'areas', linkDirection: 'inward' },
                { fileClassRelation: 'task', relationToShow: 'task', propertyToUpdate: 'area', linkDirection: 'inward' }
            ],
            'project': [
                { fileClassRelation: 'task', relationToShow: 'task', propertyToUpdate: 'project', linkDirection: 'inward' },
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'projects', linkDirection: 'inward' },
                { fileClassRelation: 'area', relationToShow: 'area', propertyToUpdate: 'area', linkDirection: 'outward' } // Nuevo: enlazar un área desde un proyecto.
            ],
            'resource': [
                { fileClassRelation: 'task', relationToShow: 'task', propertyToUpdate: 'tasks', linkDirection: 'outward'},
                { fileClassRelation: 'author', relationToShow: 'author', propertyToUpdate: 'author', linkDirection: 'outward' },
                { fileClassRelation: 'source', relationToShow: 'source', propertyToUpdate: 'source', linkDirection: 'outward' },
                { fileClassRelation: 'project', relationToShow: 'project', propertyToUpdate: 'projects', linkDirection: 'outward' }, // Nuevo: enlazar un proyecto desde un recurso.
                { fileClassRelation: 'area', relationToShow: 'area', propertyToUpdate: 'areas', linkDirection: 'outward' }, // Nuevo: enlazar un área desde un recurso.
                { fileClassRelation: 'resource', relationToShow: 'resource_in', propertyToUpdate: 'resources', linkDirection: 'inward' },
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'resources', linkDirection: 'outward' },
            ],
            'task': [
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'tasks', linkDirection: 'inward' },
                { fileClassRelation: 'project', relationToShow: 'project', propertyToUpdate: 'project', linkDirection: 'outward' },
                { fileClassRelation: 'area', relationToShow: 'area', propertyToUpdate: 'area', linkDirection: 'outward' },
                { fileClassRelation: 'task', relationToShow: 'subtask', propertyToUpdate: 'parentTask', linkDirection: 'inward' }, // Crea una Sub-Task.
                { fileClassRelation: 'task', relationToShow: 'parentTask', propertyToUpdate: 'parentTask', linkDirection: 'outward' }, // Crea una Sub-Task.
                { fileClassRelation: 'task', relationToShow: 'nextTask', propertyToUpdate: 'nextTask', linkDirection: 'outward' } // Crea una Next-Task.
            ],
            'author': [
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'author', linkDirection: 'inward' } // Nuevo: crear un recurso desde un autor.
            ],
            'source': [
                { fileClassRelation: 'resource', relationToShow: 'resource', propertyToUpdate: 'source', linkDirection: 'inward' } // Nuevo: crear un recurso desde una fuente.
            ],
            'daily': [
                { fileClassRelation: 'daily', relationToShow: 'nextDaily', propertyToUpdate: 'previusDaily', linkDirection: 'inward' } // Nuevo: crear un recurso desde una fuente.
            ]
        };

        this.RELATION_TO_SHOW_MAP = {
            "area" : "Area",
            "project" : "Project",
            "resource" : "Resource",
            "task" : "Task",
            "author" : "Author",
            "source" : "Source",
            "projects" : "Projects",
            "areas" : "Areas",
            "tasks" : "Tasks",
            "nextTask" : "Next Task",
            "parentTask" : "Parent Task",
            "subtask" : "Subtask",
            "nextDaily" : "Next Daily",
            "resource_in": "Child Resource",
        };
    }

    getFolder = (fileClass) => {
        return this.FOLDERS_MAP[fileClass];
    };

    getCapitalizeName = (fileClass) => {
        return this.CAPITALIZE_NAMES_MAP[fileClass];
    };

    getArchivedFolder = (fileClass) => {
        return this.ARCHIVED_FOLDERS_MAP[fileClass];
    };

    getTemplateFilePathMap = (fileClass) => {
        return this.TEMPLATE_FILE_PATH_MAP[fileClass];
    };

    getRelations = (fileClass) => {
        return this.RELATIONS_MAP[fileClass];
    };

    getRelationToShow = (fileClass) => {
        return this.RELATION_TO_SHOW_MAP[fileClass];
    };
}

class Utils {
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    createArchiveButton(dv, page) {
        // Crea un elemento de botón HTML
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const button = f(dv, page, "archived")

        // Añade un evento de clic al botón
        button.onclick = async () => {

            await this.sleep(500);
            const quickAddApi = app.plugins.plugins.quickadd.api;
            const filePath = page.file.path;
            await quickAddApi.executeChoice("Move By Archived", {value: filePath});       
        };
        return button;
    }
}