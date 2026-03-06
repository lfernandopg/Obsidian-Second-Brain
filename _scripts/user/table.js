class Table {

    // ─────────────────────────────────────────────
    // CORE – CONSTRUCCIÓN DE FILAS
    // ─────────────────────────────────────────────

    /**
     * Construye una fila de tabla mapeando los nombres de campo a sus valores.
     * Los campos especiales (fileLink, progress, archiveButton, fechas) tienen
     * su propio caso; el resto se delega a Metadata Menu fieldModifier.
     *
     * @param {DataviewAPI} dv
     * @param {DataviewPage} p
     * @param {string[]} fields  - Lista de nombres de campo de la config YAML
     * @param {Utils} Utils
     * @param {Function} f       - fieldModifier de Metadata Menu
     * @returns {any[]}
     */
    _buildRow(dv, p, fields, Utils, f) {
        return fields.map(field => {
            switch (field) {
                case 'fileLink':      return p.file.link;
                case 'archiveButton': return Utils.createArchiveButton(dv, p);
                case 'progress':      return this._progressBar(p);
                case 'startDate':     return p.startDate    || "-";
                case 'endDate':       return p.endDate      || "-";
                case 'deadlineDate':  return p.deadlineDate || "-";
                default:              return f(dv, p, field);
            }
        });
    }

    /** Genera un fragmento HTML de barra de progreso. */
    _progressBar(p, dv, s) {
        if (p.fileClass !== 'project') return "-";
        
        // Buscar todas las tareas que apuntan a este proyecto
        const tasks = dv.pages().where(t => t.fileClass === 'task' && t.project?.path === p.file.path);
        
        if (tasks.length === 0) return `0% <progress style="max-width: 65px" value="0" max="100"></progress>`;
        
        const doneTasks = tasks.filter(t => t.status === s.done || t.status === s.canceled);
        const percent = Math.round((doneTasks.length / tasks.length) * 100);
        
        return `${percent}% <progress style="max-width: 65px" value="${percent}" max="100"></progress>`;
    }

    // ─────────────────────────────────────────────
    // HELPER INTERNO – RENDERIZADO GENÉRICO
    // ─────────────────────────────────────────────

    /**
     * Renderiza una tabla Dataview a partir de un conjunto de páginas filtradas.
     * Si no hay resultados, no dibuja nada (sin encabezados vacíos).
     *
     * @param {DataviewAPI} dv
     * @param {DataviewPage[]} pages
     * @param {string} header        - Texto del encabezado (e.g. "⏳ Active Projects")
     * @param {Object} tableConfig   - { headers, fields } del YAML de tables.md
     * @param {Utils} Utils
     * @param {Function} f           - fieldModifier de Metadata Menu
     */
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
        const { f, config, s } = this._getContext();
        const pages = dv.pages(`"${projectFolder}"`)
            .where(p =>
                p.fileClass === "project" &&
                p.area?.path === area.file.path &&
                p.status !== s.done &&
                p.status !== s.canceled &&
                p.archived !== true
            );
        this._renderTable(dv, pages, "⏳ Active Projects", config.activeProjects, Utils, f);
    }

    showDoneProjectsByArea(dv, area, projectFolder, archivedProjectFolder, Utils) {
        const { f, config, s } = this._getContext();
        const pages = dv.pages(`"${projectFolder}" or "${archivedProjectFolder}"`)
            .where(p =>
                p.fileClass === "project" &&
                p.area?.path === area.file.path &&
                p.status === s.done
            );
        this._renderTable(dv, pages, "✅ Completed Projects", config.doneProjects, Utils, f);
    }

    showActiveTasksByArea(dv, area, taskFolder, Utils) {
        const { f, config, s } = this._getContext();
        const pages = dv.pages(`"${taskFolder}"`)
            .where(p =>
                p.fileClass === "task" &&
                p.area?.path === area.file.path &&
                p.status !== s.done &&
                p.status !== s.canceled &&
                p.archived !== true
            );
        this._renderTable(dv, pages, "⏳ Active Tasks", config.activeTasks, Utils, f);
    }

    showDoneTasksByArea(dv, area, taskFolder, archivedTaskFolder, Utils) {
        const { f, config, s } = this._getContext();
        const pages = dv.pages(`"${taskFolder}" or "${archivedTaskFolder}"`)
            .where(p =>
                p.fileClass === "task" &&
                p.area?.path === area.file.path &&
                p.status === s.done
            );
        this._renderTable(dv, pages, "✅ Completed Tasks", config.doneTasks, Utils, f);
    }

    /**
     * BUG FIX: el fileClass "resource" usa la propiedad `areas` (MultiFile, array),
     * no `area` (File, singular). La comparación anterior con `p.area.path` nunca
     * coincidía y la sección de recursos nunca mostraba resultados.
     *
     * Ahora se itera sobre el array `areas` para buscar el path del área activa.
     */
    showResourcesByArea(dv, area, resourceFolder, Utils) {
        const { f, config } = this._getContext();
        const pages = dv.pages(`"${resourceFolder}"`)
            .where(p => {
                if (p.fileClass !== "resource") return false;
                if (!p.areas) return false;
                // `areas` puede ser un único link o un array de links
                const areasArr = Array.isArray(p.areas) ? p.areas : [p.areas];
                return areasArr.some(a => a?.path === area.file.path);
            });
        this._renderTable(dv, pages, "📚 Resources", config.areaResources, Utils, f);
    }

    // ─────────────────────────────────────────────
    // HELPER PRIVADO
    // ─────────────────────────────────────────────

    /** Obtiene los objetos comunes necesarios para renderizar tablas. */
    _getContext() {
        return {
            f      : app.plugins.plugins['metadata-menu'].api.fieldModifier,
            config : customJS.FileClassMapper.TABLES_CONFIG,
            s      : customJS.FileClassMapper.STATUS_MAP,
        };
    }
}