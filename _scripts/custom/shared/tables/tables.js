// =========================================================================
// 📊 CLASE: TABLE
// Renderiza tablas Dataview en las plantillas del vault.
// Recibe Settings y FileClassMapper como dependencias inyectadas.
// =========================================================================
class Table {

    constructor() {
        // Constructor vacío — requerimiento CustomJS
        this.isInitialized = false;
        this._settings     = null;
        this._mapper       = null;
    }

    // =========================================================================
    // INIT — Recibe Settings + FileClassMapper
    // =========================================================================

    /**
     * @param {Settings}        settings
     * @param {FileClassMapper} mapper
     */
    init(settings, mapper) {
        if (!settings?.isInitialized) {
            throw new Error("[Table] Se requiere una instancia de Settings inicializada.");
        }
        if (!mapper?.isInitialized) {
            throw new Error("[Table] Se requiere una instancia de FileClassMapper inicializada.");
        }
        this._settings = settings;
        this._mapper   = mapper;
        this.isInitialized = true;
    }

    _checkInit() {
        if (!this.isInitialized) {
            throw new Error("[Table] No inicializado. Llama a customJS.SystemBootstrap.boot() primero.");
        }
    }

    // ─────────────────────────────────────────────
    // Metadata Menu — Guard centralizado
    // ─────────────────────────────────────────────

    /**
     * Obtiene el fieldModifier de Metadata Menu de forma segura.
     * @returns {Function|null}
     */
    _getFieldModifier() {
        const plugin = app.plugins?.plugins?.['metadata-menu'];
        return plugin?.api?.fieldModifier ?? null;
    }

    // ─────────────────────────────────────────────
    // CORE — Construcción de filas
    // ─────────────────────────────────────────────

    _buildRow(dv, p, fields, Utils, f) {
        return fields.map(field => {
            switch (field) {
                case 'fileLink':      return p.file.link;
                case 'archiveButton': return f ? Utils.createArchiveButton(dv, p, f) : "⚠️ MM";
                case 'progress':      return this._progressBar(p, dv);
                case 'startDate':     return p.startDate    || "-";
                case 'endDate':       return p.endDate      || "-";
                case 'deadlineDate':  return p.deadlineDate || "-";
                default:
                    if (!f) return p[field] ?? "-";
                    return f(dv, p, field);
            }
        });
    }

    _progressBar(p, dv) {
        if (p.fileClass !== 'project') return "-";

        const statusMap = this._settings.STATUS_MAP;
        const tasks     = dv.pages().where(t => t.fileClass === 'task' && t.project?.path === p.file.path);

        if (tasks.length === 0) {
            return `0% <progress style="max-width: 65px" value="0" max="100"></progress>`;
        }

        const doneTasks = tasks.filter(t => t.status === statusMap.done || t.status === statusMap.canceled);
        const percent   = Math.round((doneTasks.length / tasks.length) * 100);

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

    /**
     * Renderiza una tabla con protección ante fallo de Metadata Menu.
     * En caso de error, usa Messages para el texto de degradación elegante.
     */
    _renderSafe(dv, headerText, queryFn, tableConfig, Utils) {
        const f = this._getFieldModifier();
        if (!f) {
            // Degradación elegante: texto plano en lugar de crash
            const msg = customJS?.Messages?.isInitialized
                ? customJS.Messages.get("TABLE_METADATA_MENU_UNAVAILABLE", headerText)
                : `⚠️ Metadata Menu no disponible para "${headerText}".`;
            dv.paragraph(msg);
            return;
        }

        let pages;
        try {
            pages = queryFn();
        } catch (err) {
            console.error(`[Table._renderSafe] Error al consultar páginas para "${headerText}":`, err);
            const msg = customJS?.Messages?.isInitialized
                ? customJS.Messages.get("TABLE_QUERY_ERROR", headerText)
                : `❌ Error al cargar datos para "${headerText}". Revisa la consola.`;
            dv.paragraph(msg);
            return;
        }

        this._renderTable(dv, pages, headerText, tableConfig, Utils, f);
    }

    // =========================================================================
    // API PÚBLICA — Vistas por Área
    // =========================================================================

    showActiveProjectsByArea(dv, area, projectFolder, Utils) {
        this._checkInit();
        const statusMap = this._settings.STATUS_MAP;
        this._renderSafe(
            dv,
            "⏳ Active Projects",
            () => dv.pages(`"${projectFolder}"`)
                .where(p =>
                    p.fileClass === "project" &&
                    p.area?.path === area.file.path &&
                    p.status !== statusMap.done &&
                    p.status !== statusMap.canceled &&
                    p.archived !== true
                ),
            this._settings.TABLES_CONFIG.activeProjects,
            Utils
        );
    }

    showDoneProjectsByArea(dv, area, projectFolder, archivedProjectFolder, Utils) {
        this._checkInit();
        const statusMap = this._settings.STATUS_MAP;
        this._renderSafe(
            dv,
            "✅ Completed Projects",
            () => dv.pages(`"${projectFolder}" or "${archivedProjectFolder}"`)
                .where(p =>
                    p.fileClass === "project" &&
                    p.area?.path === area.file.path &&
                    p.status === statusMap.done
                ),
            this._settings.TABLES_CONFIG.doneProjects,
            Utils
        );
    }

    showActiveTasksByArea(dv, area, taskFolder, Utils) {
        this._checkInit();
        const statusMap = this._settings.STATUS_MAP;
        this._renderSafe(
            dv,
            "⏳ Active Tasks",
            () => dv.pages(`"${taskFolder}"`)
                .where(p =>
                    p.fileClass === "task" &&
                    p.area?.path === area.file.path &&
                    p.status !== statusMap.done &&
                    p.status !== statusMap.canceled &&
                    p.archived !== true
                ),
            this._settings.TABLES_CONFIG.activeTasks,
            Utils
        );
    }

    showDoneTasksByArea(dv, area, taskFolder, archivedTaskFolder, Utils) {
        this._checkInit();
        const statusMap = this._settings.STATUS_MAP;
        this._renderSafe(
            dv,
            "✅ Completed Tasks",
            () => dv.pages(`"${taskFolder}" or "${archivedTaskFolder}"`)
                .where(p =>
                    p.fileClass === "task" &&
                    p.area?.path === area.file.path &&
                    p.status === statusMap.done
                ),
            this._settings.TABLES_CONFIG.doneTasks,
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
            this._settings.TABLES_CONFIG.areaResources,
            Utils
        );
    }
}