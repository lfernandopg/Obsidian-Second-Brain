class Table {
    constructor() {
        this.isInitialized = false;
        this.config = null;
        this.statusMap = null;
    }

    /**
     * Inyecta las dependencias necesarias.
     * Llamado por SystemBootstrap.boot().
     */
    init(tablesConfig, statusMap) {
        this.config = tablesConfig;
        this.statusMap = statusMap;
        this.isInitialized = true;
    }

    _checkInit() {
        if (!this.isInitialized) {
            throw new Error("Table no ha sido inicializado. Llama a customJS.SystemBootstrap.boot() primero.");
        }
    }

    // ─────────────────────────────────────────────
    // CORE – CONSTRUCCIÓN DE FILAS
    // ─────────────────────────────────────────────

    _buildRow(dv, p, fields, Utils, f) {
        return fields.map(field => {
            switch (field) {
                case 'fileLink':      return p.file.link;
                case 'archiveButton': return Utils.createArchiveButton(dv, p);
                case 'progress':      return this._progressBar(p, dv, this.statusMap); // ✅ ¡BUG CORREGIDO!
                case 'startDate':     return p.startDate    || "-";
                case 'endDate':       return p.endDate      || "-";
                case 'deadlineDate':  return p.deadlineDate || "-";
                default:              return f(dv, p, field);
            }
        });
    }

    _progressBar(p, dv, s) {
        if (p.fileClass !== 'project') return "-";
        
        const tasks = dv.pages().where(t => t.fileClass === 'task' && t.project?.path === p.file.path);
        
        if (tasks.length === 0) return `0% <progress style="max-width: 65px" value="0" max="100"></progress>`;
        
        const doneTasks = tasks.filter(t => t.status === s.done || t.status === s.canceled);
        const percent = Math.round((doneTasks.length / tasks.length) * 100);
        
        return `${percent}% <progress style="max-width: 65px" value="${percent}" max="100"></progress>`;
    }

    _renderTable(dv, pages, header, tableConfig, Utils, f) {
        if (!pages || pages.length === 0) return;
        dv.header(3, header);
        dv.table(
            tableConfig.headers,
            pages.map(p => this._buildRow(dv, p, tableConfig.fields, Utils, f))
        );
    }

    // ─────────────────────────────────────────────
    // API PÚBLICA – VISTAS POR ÁREA
    // ─────────────────────────────────────────────

    showActiveProjectsByArea(dv, area, projectFolder, Utils) {
        this._checkInit();
        const f = app.plugins.plugins['metadata-menu'].api.fieldModifier;
        const pages = dv.pages(`"${projectFolder}"`)
            .where(p =>
                p.fileClass === "project" &&
                p.area?.path === area.file.path &&
                p.status !== this.statusMap.done &&
                p.status !== this.statusMap.canceled &&
                p.archived !== true
            );
        this._renderTable(dv, pages, "⏳ Active Projects", this.config.activeProjects, Utils, f);
    }

    showDoneProjectsByArea(dv, area, projectFolder, archivedProjectFolder, Utils) {
        this._checkInit();
        const f = app.plugins.plugins['metadata-menu'].api.fieldModifier;
        const pages = dv.pages(`"${projectFolder}" or "${archivedProjectFolder}"`)
            .where(p =>
                p.fileClass === "project" &&
                p.area?.path === area.file.path &&
                p.status === this.statusMap.done
            );
        this._renderTable(dv, pages, "✅ Completed Projects", this.config.doneProjects, Utils, f);
    }

    showActiveTasksByArea(dv, area, taskFolder, Utils) {
        this._checkInit();
        const f = app.plugins.plugins['metadata-menu'].api.fieldModifier;
        const pages = dv.pages(`"${taskFolder}"`)
            .where(p =>
                p.fileClass === "task" &&
                p.area?.path === area.file.path &&
                p.status !== this.statusMap.done &&
                p.status !== this.statusMap.canceled &&
                p.archived !== true
            );
        this._renderTable(dv, pages, "⏳ Active Tasks", this.config.activeTasks, Utils, f);
    }

    showDoneTasksByArea(dv, area, taskFolder, archivedTaskFolder, Utils) {
        this._checkInit();
        const f = app.plugins.plugins['metadata-menu'].api.fieldModifier;
        const pages = dv.pages(`"${taskFolder}" or "${archivedTaskFolder}"`)
            .where(p =>
                p.fileClass === "task" &&
                p.area?.path === area.file.path &&
                p.status === this.statusMap.done
            );
        this._renderTable(dv, pages, "✅ Completed Tasks", this.config.doneTasks, Utils, f);
    }

    showResourcesByArea(dv, area, resourceFolder, Utils) {
        this._checkInit();
        const f = app.plugins.plugins['metadata-menu'].api.fieldModifier;
        const pages = dv.pages(`"${resourceFolder}"`)
            .where(p => {
                if (p.fileClass !== "resource") return false;
                if (!p.areas) return false;
                const areasArr = Array.isArray(p.areas) ? p.areas : [p.areas];
                return areasArr.some(a => a?.path === area.file.path);
            });
        this._renderTable(dv, pages, "📚 Resources", this.config.areaResources, Utils, f);
    }
}