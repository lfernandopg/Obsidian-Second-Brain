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
    // [FIX #1] GUARD CLAUSE PARA METADATA MENU
    // Centralizado aquí para no repetirlo en cada método público.
    // Devuelve la función `fieldModifier` o null si el plugin no está listo.
    // ─────────────────────────────────────────────

    /**
     * Obtiene el fieldModifier de Metadata Menu de forma segura.
     * @returns {Function|null} La función fieldModifier, o null si el plugin no está disponible.
     */
    _getFieldModifier() {
        const plugin = app.plugins?.plugins?.['metadata-menu'];
        if (!plugin?.api?.fieldModifier) {
            return null;
        }
        return plugin.api.fieldModifier;
    }

    // ─────────────────────────────────────────────
    // CORE – CONSTRUCCIÓN DE FILAS
    // ─────────────────────────────────────────────

    _buildRow(dv, p, fields, Utils, f) {
        return fields.map(field => {
            switch (field) {
                case 'fileLink':      return p.file.link;
                case 'archiveButton': return f ? Utils.createArchiveButton(dv, p, f) : "⚠️ MM";
                case 'progress':      return this._progressBar(p, dv, this.statusMap);
                case 'startDate':     return p.startDate    || "-";
                case 'endDate':       return p.endDate      || "-";
                case 'deadlineDate':  return p.deadlineDate || "-";
                // [FIX ADICIONAL] Campo genérico: si f es null, muestra el valor raw o "-"
                default:
                    if (!f) return p[field] ?? "-";
                    return f(dv, p, field);
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
    // HELPER INTERNO – renderizado con guard de Metadata Menu
    // Evita duplicar el mismo bloque try/warn en cada método público.
    // ─────────────────────────────────────────────

    /**
     * Renderiza una tabla con protección ante fallo de Metadata Menu.
     * Si el plugin no está disponible, muestra un aviso en texto plano
     * en lugar de crashear toda la vista.
     *
     * @param {DataviewAPI} dv
     * @param {string}      headerText    - Título de la sección (ej. "⏳ Active Projects")
     * @param {Function}    queryFn       - () => DataArray — páginas a mostrar
     * @param {Object}      tableConfig   - Configuración de headers/fields
     * @param {Utils}       Utils
     */
    _renderSafe(dv, headerText, queryFn, tableConfig, Utils) {
        // [FIX #1] Guard clause centralizado
        const f = this._getFieldModifier();
        if (!f) {
            dv.paragraph(
                `⚠️ **Metadata Menu no disponible.** La tabla "${headerText}" no puede renderizarse ` +
                `hasta que el plugin termine de cargar. Recarga la nota o espera unos segundos.`
            );
            return;
        }

        let pages;
        try {
            pages = queryFn();
        } catch (err) {
            console.error(`[Table._renderSafe] Error al consultar páginas para "${headerText}":`, err);
            dv.paragraph(`❌ Error al cargar datos para "${headerText}". Revisa la consola.`);
            return;
        }

        this._renderTable(dv, pages, headerText, tableConfig, Utils, f);
    }

    // ─────────────────────────────────────────────
    // API PÚBLICA – VISTAS POR ÁREA
    // ─────────────────────────────────────────────

    showActiveProjectsByArea(dv, area, projectFolder, Utils) {
        this._checkInit();
        this._renderSafe(
            dv,
            "⏳ Active Projects",
            () => dv.pages(`"${projectFolder}"`)
                .where(p =>
                    p.fileClass === "project" &&
                    p.area?.path === area.file.path &&
                    p.status !== this.statusMap.done &&
                    p.status !== this.statusMap.canceled &&
                    p.archived !== true
                ),
            this.config.activeProjects,
            Utils
        );
    }

    showDoneProjectsByArea(dv, area, projectFolder, archivedProjectFolder, Utils) {
        this._checkInit();
        this._renderSafe(
            dv,
            "✅ Completed Projects",
            () => dv.pages(`"${projectFolder}" or "${archivedProjectFolder}"`)
                .where(p =>
                    p.fileClass === "project" &&
                    p.area?.path === area.file.path &&
                    p.status === this.statusMap.done
                ),
            this.config.doneProjects,
            Utils
        );
    }

    showActiveTasksByArea(dv, area, taskFolder, Utils) {
        this._checkInit();
        this._renderSafe(
            dv,
            "⏳ Active Tasks",
            () => dv.pages(`"${taskFolder}"`)
                .where(p =>
                    p.fileClass === "task" &&
                    p.area?.path === area.file.path &&
                    p.status !== this.statusMap.done &&
                    p.status !== this.statusMap.canceled &&
                    p.archived !== true
                ),
            this.config.activeTasks,
            Utils
        );
    }

    showDoneTasksByArea(dv, area, taskFolder, archivedTaskFolder, Utils) {
        this._checkInit();
        this._renderSafe(
            dv,
            "✅ Completed Tasks",
            () => dv.pages(`"${taskFolder}" or "${archivedTaskFolder}"`)
                .where(p =>
                    p.fileClass === "task" &&
                    p.area?.path === area.file.path &&
                    p.status === this.statusMap.done
                ),
            this.config.doneTasks,
            Utils
        );
    }

    showResourcesByArea(dv, area, resourceFolder, Utils) {
        this._checkInit();
        this._renderSafe(
            dv,
            "📚 Resources",
            () => dv.pages(`"${resourceFolder}"`)
                .where(p => {
                    if (p.fileClass !== "resource") return false;
                    if (!p.areas) return false;
                    const areasArr = Array.isArray(p.areas) ? p.areas : [p.areas];
                    return areasArr.some(a => a?.path === area.file.path);
                }),
            this.config.areaResources,
            Utils
        );
    }
}