class Table {

    // Función "traductora" dinámica para construir filas según el YAML
    _buildRow(dv, p, fields, Utils, f) {
        return fields.map(field => {
            switch(field) {
                case 'fileLink': 
                    return p.file.link;
                case 'progress': 
                    return `60%<progress style="max-width: 65px" value="6" max="10"></progress>`;
                case 'archiveButton': 
                    return Utils.createArchiveButton(dv, p);
                case 'startDate': 
                    return p.startDate || "-";
                case 'endDate': 
                    return p.endDate || "-";
                case 'deadlineDate': 
                    return p.deadlineDate || "-";
                default:
                    // Si no es ninguno de los anteriores, asumimos que es un campo de Metadata Menu (status, priority, size, etc.)
                    return f(dv, p, field);
            }
        });
    }

    showActiveProjectsByArea(dv, area, projectFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const config = customJS.FileClassMapper;
        const statusMap = config.STATUS_MAP;
        const tableConfig = config.TABLES_CONFIG.activeProjects;

        const projects = dv.pages(`"${projectFolder}"`)
            .where(p => p.fileClass === "project" && p.area && p.area.path === area.file.path &&
                p.status !== statusMap.done && p.status !== statusMap.canceled && p.archived !== true 
            );

        if (projects.length > 0) {
            dv.header(3, `⏳ Active Projects`);
            dv.table(tableConfig.headers, projects.map(p => this._buildRow(dv, p, tableConfig.fields, Utils, f)));
        }
    }

    showDoneProjectsByArea(dv, area, projectFolder, archivedProjectFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const config = customJS.FileClassMapper;
        const statusMap = config.STATUS_MAP;
        const tableConfig = config.TABLES_CONFIG.doneProjects;

        const projects = dv.pages(`"${projectFolder}" or "${archivedProjectFolder}"`)
            .where(p => p.fileClass === "project" && p.area && p.area.path === area.file.path && p.status === statusMap.done);

        if (projects.length > 0) {
            dv.header(3, `✅ Completed Projects`);
            dv.table(tableConfig.headers, projects.map(p => this._buildRow(dv, p, tableConfig.fields, Utils, f)));
        }
    }

    showActiveTasksByArea(dv, area, taskFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const config = customJS.FileClassMapper;
        const statusMap = config.STATUS_MAP;
        const tableConfig = config.TABLES_CONFIG.activeTasks;

        const tasks = dv.pages(`"${taskFolder}"`)
            .where(p => p.fileClass === "task" && p.area && p.area.path === area.file.path &&
                p.status !== statusMap.done && p.status !== statusMap.canceled && p.archived !== true 
            );

        if (tasks.length > 0) {
            dv.header(3, `⏳ Active Tasks`);
            dv.table(tableConfig.headers, tasks.map(p => this._buildRow(dv, p, tableConfig.fields, Utils, f)));
        }
    }

    showDoneTasksByArea(dv, area, taskFolder, archivedTaskFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const config = customJS.FileClassMapper;
        const statusMap = config.STATUS_MAP;
        const tableConfig = config.TABLES_CONFIG.doneTasks;

        const tasks = dv.pages(`"${taskFolder}" or "${archivedTaskFolder}"`)
            .where(p => p.fileClass === "task" && p.area && p.area.path === area.file.path && p.status === statusMap.done);

        if (tasks.length > 0) {
            dv.header(3, `✅ Completed Task`);
            dv.table(tableConfig.headers, tasks.map(p => this._buildRow(dv, p, tableConfig.fields, Utils, f)));
        }
    }

    showResourcesByArea(dv, area, resourceFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const config = customJS.FileClassMapper;
        const tableConfig = config.TABLES_CONFIG.areaResources;

        //areaResources:
        //headers: ["📚 Resource", "🏷️ Type", "📍 Status", "👤 Author", "🗃"]
        //fields: ["fileLink", "type", "referenceStatus", "author", "archiveButton"]

        const resources = dv.pages(`"${resourceFolder}"`)
            .where(p => p.fileClass === "resource" && p.area && p.area.path === area.file.path);
        
        if (resources.length > 0) {
            dv.header(3, `📚 Resources`);
            dv.table(tableConfig.headers, resources.map(p => this._buildRow(dv, p, tableConfig.fields, Utils, f)));
        }
    }    
}