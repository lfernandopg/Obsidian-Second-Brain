// =========================================================================
// 🧠 CLASE: PROJECT EVALUATOR
// Dominio puro: evalúa el mapa de proyectos en memoria.
// NO lee ni escribe en el vault.
//
// Recibe Settings y FileClassMapper como dependencias inyectadas.
// =========================================================================
class ProjectEvaluator {

    constructor() {
        // Constructor vacío — requerimiento CustomJS
        this.isInitialized = false;
        this._settings     = null;
        this._mapper       = null;
        this.urgencyMotor  = null;
    }

    // =========================================================================
    // CLASE ANIDADA — Motor de Urgencia de Proyectos
    // =========================================================================

    static UrgencyMotor = class {
        /**
         * @param {Settings} settings
         */
        constructor(settings) {
            this._settings = settings;
        }

        getPriorityWeight(priority) {
            const p = this._settings.PRIORITY_MAP;
            const weights = {
                [p.critical]: 4,
                [p.high]:     3,
                [p.medium]:   2,
                [p.low]:      1,
            };
            return weights[priority] ?? 0;
        }

        getSizeGroup(size) {
            const ps = this._settings.PROJECT_SIZE_MAP;
            if ([ps.half_year, ps.year].includes(size))    return 3;
            if ([ps.month,     ps.quarter].includes(size)) return 2;
            return 1;
        }

        calculateTarget(daysLeft, sizeGroup) {
            const p  = this._settings.PRIORITY_MAP;
            const th = this._settings.PROJECT_URGENCY_THRESHOLDS;

            if (daysLeft < 0) return p.critical;

            const g = th[`group${sizeGroup}`];

            if (g.critical !== null && daysLeft <= g.critical) return p.critical;
            if (g.high     !== null && daysLeft <= g.high)     return p.high;
            if (g.medium   !== null && daysLeft <= g.medium)   return p.medium;
            return p.low;
        }

        evaluate(currentPriority, size, deadline) {
            if (!deadline) return currentPriority;

            const targetDate = window.moment(
                deadline,
                [this._settings.DATE_FORMAT_DATE],
                true
            ).startOf('day');

            if (!targetDate.isValid()) {
                console.warn(`[ProjectEvaluator.UrgencyMotor] Fecha inválida: "${deadline}"`);
                return currentPriority;
            }

            const today    = window.moment().startOf('day');
            const daysLeft = targetDate.diff(today, 'days');
            const sizeGroup = this.getSizeGroup(size);
            const targetPriority = this.calculateTarget(daysLeft, sizeGroup);

            return this.getPriorityWeight(targetPriority) > this.getPriorityWeight(currentPriority)
                ? targetPriority
                : currentPriority;
        }
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
            throw new Error("[ProjectEvaluator] Se requiere una instancia de Settings inicializada.");
        }
        if (!mapper?.isInitialized) {
            throw new Error("[ProjectEvaluator] Se requiere una instancia de FileClassMapper inicializada.");
        }

        this._settings    = settings;
        this._mapper      = mapper;
        this.urgencyMotor = new ProjectEvaluator.UrgencyMotor(settings);
        this.isInitialized = true;
    }

    _checkInit() {
        if (!this.isInitialized) {
            throw new Error("[ProjectEvaluator] No inicializado. Llama a SystemBootstrap.boot() primero.");
        }
    }

    // =========================================================================
    // EVALUATE — Lógica pura sobre el mapa de proyectos en memoria
    // =========================================================================

    /**
     * Evalúa el mapa de proyectos y escribe los cambios calculados
     * en los campos `new*` de cada nodo. No toca el vault.
     *
     * @param {Object} projects - Mapa basename → nodo de proyecto
     */
    evaluate(projects) {
        this._checkInit();

        const statusMap    = this._settings.STATUS_MAP;
        const nowFormatted = window.moment().format(this._settings.DATE_FORMAT_DATE);

        for (const node of Object.values(projects)) {
            if (node.archived) continue;

            const currentStatus    = node.newStatus   !== null      ? node.newStatus   : node.status;
            let   evaluatedStatus  = currentStatus;

            const currentEndDate   = node.newEndDate  !== undefined ? node.newEndDate  : node.endDate;
            let   evaluatedEndDate = currentEndDate;

            const currentArchived   = node.newArchived !== null      ? node.newArchived : node.archived;
            let   evaluatedArchived = currentArchived;

            // ── REGLA A: Evaluación por Tareas (Bottom-Up) ───────────────
            if (node.tasks?.length > 0 && evaluatedStatus !== statusMap.canceled) {
                const validTasks = node.tasks.filter(tStatus => tStatus !== statusMap.canceled);

                if (validTasks.length === 0 && node.tasks.length > 0) {
                    // Todas las tareas canceladas → proyecto cancelado
                    evaluatedStatus   = statusMap.canceled;
                    evaluatedArchived = true;
                } else if (validTasks.length > 0) {
                    const allDone       = validTasks.every(t  => t === statusMap.done);
                    const anyActive     = validTasks.some(t   => t === statusMap.in_progress || t === statusMap.done);
                    const anyIncomplete = validTasks.some(t   => t !== statusMap.done);

                    if (allDone) {
                        evaluatedStatus = statusMap.done;
                        if (!evaluatedEndDate) evaluatedEndDate = nowFormatted;
                    } else {
                        if (currentStatus === statusMap.done && anyIncomplete) {
                            evaluatedStatus  = statusMap.in_progress;
                            evaluatedEndDate = null;
                        } else if (anyActive && (evaluatedStatus === statusMap.inbox || evaluatedStatus === statusMap.planned)) {
                            evaluatedStatus = statusMap.in_progress;
                        }
                    }
                }
            }

            // ── REGLA B: Motor de Urgencia ────────────────────────────────
            if (evaluatedStatus !== statusMap.done && evaluatedStatus !== statusMap.canceled) {
                const currentPriority   = node.newPriority !== null ? node.newPriority : node.priority;
                const evaluatedPriority = this.urgencyMotor.evaluate(currentPriority, node.size, node.deadlineDate);

                if (evaluatedPriority !== currentPriority) {
                    node.newPriority = evaluatedPriority;
                }
            }

            // ── Registro de Cambios ───────────────────────────────────────
            if (evaluatedStatus !== currentStatus) node.newStatus = evaluatedStatus;

            if (evaluatedEndDate !== currentEndDate && !(evaluatedEndDate === null && !currentEndDate)) {
                node.newEndDate = evaluatedEndDate;
            }
            if (evaluatedArchived !== currentArchived) node.newArchived = evaluatedArchived;
        }
    }
}