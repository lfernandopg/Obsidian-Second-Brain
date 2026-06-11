// =========================================================================
// 🧠 CLASE: TASK EVALUATOR
// Dominio puro: evalúa el grafo de tareas en memoria.
// NO lee ni escribe en el vault.
//
// Recibe Settings y FileClassMapper como dependencias inyectadas.
// Todas las constantes (MAX_LOOPS, thresholds, etc.) provienen de Settings.
// =========================================================================
class TaskEvaluator {

    constructor() {
        // Constructor vacío — requerimiento CustomJS
        this.isInitialized   = false;
        this._settings       = null;
        this._mapper         = null;
        this.urgencyMotor    = null;
        this.sizeMotor       = null;
        this.recurrenceMotor = null;
    }

    // =========================================================================
    // CLASES ANIDADAS — Motores de dominio
    // =========================================================================

    // ── Motor de Tamaño ───────────────────────────────────────────────────────
    static SizeMotor = class {
        /**
         * @param {Settings} settings
         */
        constructor(settings) {
            const s = settings;

            // Construye weightMap desde los keys del TASK_SIZE_MAP y los pesos en Settings
            this.weightMap = {};
            for (const [key, label] of Object.entries(s.TASK_SIZE_MAP)) {
                this.weightMap[label] = s.TASK_SIZE_WEIGHTS[key] ?? 1;
            }

            // Construye thresholds usando los valores display (labels) del mapa
            this.thresholds = s.TASK_SIZE_THRESHOLDS.map(t => ({
                limit: t.limit,
                size:  s.TASK_SIZE_MAP[t.key],
            }));
        }

        getWeight(size) { return this.weightMap[size] ?? 1; }

        getSizeFromWeight(weight) {
            for (const t of this.thresholds) {
                if (weight <= t.limit) return t.size;
            }
            return this.thresholds[this.thresholds.length - 1].size; // epic
        }

        evaluate(currentParentSize, childrenSizes) {
            if (!childrenSizes || childrenSizes.length === 0) return currentParentSize;
            let totalWeight = 0;
            for (const childSize of childrenSizes) totalWeight += this.getWeight(childSize);
            const targetSize   = this.getSizeFromWeight(totalWeight);
            const currentWeight = this.getWeight(currentParentSize);
            const targetWeight  = this.getWeight(targetSize);
            return (targetWeight > currentWeight) ? targetSize : currentParentSize;
        }
    }

    // ── Motor de Recurrencia ──────────────────────────────────────────────────
    static RecurrenceMotor = class {
        /**
         * @param {Settings} settings
         */
        constructor(settings) {
            this._settings = settings;
        }

        getSizeGroup(size) {
            const s = this._settings.TASK_SIZE_MAP;
            if ([s.epic, s.huge, s.very_large].includes(size)) return 3;
            if ([s.large, s.medium].includes(size))            return 2;
            return 1;
        }

        getAnticipationDays(recurrence, sizeGroup) {
            if (!recurrence || recurrence.includes("Diario")) return 0;
            if (recurrence.includes("Semanal")) return sizeGroup === 3 ? 4 : (sizeGroup === 2 ? 2 : 1);
            if (recurrence.includes("Mensual")) return sizeGroup === 3 ? 15 : (sizeGroup === 2 ? 7 : 3);
            if (recurrence.includes("Anual"))   return sizeGroup === 3 ? 30 : (sizeGroup === 2 ? 15 : 7);
            return 0;
        }

        _getUnit(recurrence) {
            if (recurrence.includes("Semanal")) return 'weeks';
            if (recurrence.includes("Mensual")) return 'months';
            if (recurrence.includes("Anual"))   return 'years';
            return 'days';
        }

        shouldSpawnNext(status, deadlineDate, recurrence, size, statusDone) {
            if (status === statusDone) return true;
            if (!deadlineDate || !recurrence) return false;

            const d1 = window.moment(deadlineDate, [this._settings.DATE_FORMAT_DATETIME], false);
            if (!d1.isValid()) return false;

            const today   = window.moment().startOf('day');
            d1.startOf('day');

            const unit        = this._getUnit(recurrence);
            const d2          = d1.clone().add(1, unit);
            const anticipation = this.getAnticipationDays(recurrence, this.getSizeGroup(size));
            const spawnDate   = d2.clone().subtract(anticipation, 'days');

            return today.isSameOrAfter(spawnDate, 'day');
        }

        calculateNextDates(deadlineDate, startDate, recurrence) {
            const fmt  = this._settings.DATE_FORMAT_DATETIME;
            const unit = this._getUnit(recurrence);
            const today = window.moment();

            const d1          = deadlineDate ? window.moment(deadlineDate, [fmt], false) : null;
            const baseDeadline = (d1 && d1.isValid()) ? d1 : today.clone();
            const newDeadline  = baseDeadline.clone().add(1, unit).format(fmt);

            let newStart = "";
            if (startDate) {
                const d2 = window.moment(startDate, [fmt], false);
                if (d2.isValid()) newStart = d2.clone().add(1, unit).format(fmt);
            }
            return { newDeadline, newStart };
        }
    }

    // ── Motor de Urgencia ─────────────────────────────────────────────────────
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
            const s = this._settings.TASK_SIZE_MAP;
            if ([s.epic, s.huge, s.very_large].includes(size)) return 3;
            if ([s.large, s.medium].includes(size))            return 2;
            return 1;
        }

        calculateTarget(daysLeft, sizeGroup) {
            const p  = this._settings.PRIORITY_MAP;
            const th = this._settings.TASK_URGENCY_THRESHOLDS;

            if (daysLeft < 0) return p.critical;

            const g = th[`group${sizeGroup}`];

            // Escalado descendente: critical → high → medium → low
            if (g.critical !== null && daysLeft <= g.critical) return p.critical;
            if (g.high     !== null && daysLeft <= g.high)     return p.high;
            if (g.medium   !== null && daysLeft <= g.medium)   return p.medium;
            return p.low;
        }

        evaluate(currentPriority, size, deadline) {
            if (!deadline) return currentPriority;

            const targetDate = window.moment(
                deadline,
                [this._settings.DATE_FORMAT_DATETIME],
                false
            ).startOf('day');

            if (!targetDate.isValid()) {
                console.warn(`[TaskEvaluator.UrgencyMotor] Fecha inválida: "${deadline}"`);
                return currentPriority;
            }

            const daysLeft       = targetDate.diff(window.moment().startOf('day'), 'days');
            const targetPriority = this.calculateTarget(daysLeft, this.getSizeGroup(size));

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
            throw new Error("[TaskEvaluator] Se requiere una instancia de Settings inicializada.");
        }
        if (!mapper?.isInitialized) {
            throw new Error("[TaskEvaluator] Se requiere una instancia de FileClassMapper inicializada.");
        }

        this._settings = settings;
        this._mapper   = mapper;

        // Instanciar motores con Settings completo
        this.urgencyMotor    = new TaskEvaluator.UrgencyMotor(settings);
        this.sizeMotor       = new TaskEvaluator.SizeMotor(settings);
        this.recurrenceMotor = new TaskEvaluator.RecurrenceMotor(settings);

        this.isInitialized = true;
    }

    _checkInit() {
        if (!this.isInitialized) {
            throw new Error("[TaskEvaluator] No inicializado. Llama a SystemBootstrap.boot() primero.");
        }
    }

    // =========================================================================
    // EVALUATE — Lógica pura sobre el grafo en memoria
    // =========================================================================

    /**
     * Evalúa el grafo completo de tareas y escribe los cambios calculados
     * en los campos `new*` de cada nodo. No toca el vault.
     *
     * @param {Object} graph              - Mapa basename → nodo de tarea
     * @param {Object} projectPriorities  - Mapa basename → prioridad evaluada de proyecto
     */
    evaluate(graph, projectPriorities = {}) {
        this._checkInit();

        const s           = this._settings;
        const statusMap   = s.STATUS_MAP;
        const MAX_LOOPS   = s.TASK_MAX_LOOPS;
        const nowFormatted = window.moment().format(s.DATE_FORMAT_DATETIME);

        let anyChanges = false;
        let loopCount  = 0;

        do {
            anyChanges = false;
            loopCount++;

            for (const node of Object.values(graph)) {
                if (node.archived) continue;

                const currentStatus   = node.newStatus   !== null      ? node.newStatus   : node.status;
                let   evaluatedStatus = currentStatus;

                const currentEndDate   = node.newEndDate  !== undefined ? node.newEndDate  : node.endDate;
                let   evaluatedEndDate = currentEndDate;

                const currentArchived   = node.newArchived !== null      ? node.newArchived : node.archived;
                let   evaluatedArchived = currentArchived;

                // ── REGLA A: Cancelación en Cascada ──────────────────────
                const hasCanceledParent = node.parentTasks.some(pName => {
                    const pNode = graph[pName];
                    return pNode && (pNode.newStatus !== null ? pNode.newStatus : pNode.status) === statusMap.canceled;
                });

                if (hasCanceledParent || evaluatedStatus === statusMap.canceled) {
                    evaluatedStatus   = statusMap.canceled;
                    evaluatedArchived = true;
                } else {
                    // ── REGLA B: Bloqueos Secuenciales ───────────────────
                    const hasIncompletePrev = node.previousTasks.some(prevName => {
                        const prevNode = graph[prevName];
                        if (!prevNode) return false;
                        const prevStat = prevNode.newStatus !== null ? prevNode.newStatus : prevNode.status;
                        return prevStat !== statusMap.done && prevStat !== statusMap.canceled;
                    });

                    if (hasIncompletePrev) {
                        evaluatedStatus = statusMap.blocked;
                    } else if (currentStatus === statusMap.blocked) {
                        evaluatedStatus = statusMap.planned;
                    }

                    // ── REGLA C: Evaluación por Hijos (Subtareas) ────────
                    const isLeaf = node.children.length === 0;
                    if (!isLeaf) {
                        const validChildren = node.children.filter(childName => {
                            const cNode = graph[childName];
                            return cNode && (cNode.newStatus !== null ? cNode.newStatus : cNode.status) !== statusMap.canceled;
                        });

                        if (validChildren.length === 0 && node.children.length > 0) {
                            evaluatedStatus   = statusMap.canceled;
                            evaluatedArchived = true;
                        } else if (validChildren.length > 0) {
                            const allDone = validChildren.every(c =>
                                (graph[c].newStatus !== null ? graph[c].newStatus : graph[c].status) === statusMap.done
                            );
                            const anyActive = validChildren.some(c => {
                                const stat = graph[c].newStatus !== null ? graph[c].newStatus : graph[c].status;
                                return stat === statusMap.in_progress || stat === statusMap.done;
                            });
                            const anyIncomplete = validChildren.some(c =>
                                (graph[c].newStatus !== null ? graph[c].newStatus : graph[c].status) !== statusMap.done
                            );

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
                }

                // ── REGLA D: Cierre de Tareas Hoja ───────────────────────
                const isLeafFinal = node.children.length === 0;
                if (isLeafFinal && evaluatedStatus !== statusMap.canceled) {
                    if (evaluatedEndDate && evaluatedStatus !== statusMap.done) {
                        evaluatedStatus = statusMap.done;
                    }
                    if (evaluatedStatus === statusMap.done && !evaluatedEndDate) {
                        evaluatedEndDate = nowFormatted;
                    }
                }

                // ── REGLA E: Motor de Urgencia ────────────────────────────
                if (evaluatedStatus !== statusMap.done && evaluatedStatus !== statusMap.canceled) {
                    const currentPriority   = node.newPriority !== null ? node.newPriority : node.priority;
                    const currentSize       = node.newSize     !== null ? node.newSize     : node.size;
                    const evaluatedPriority = this.urgencyMotor.evaluate(currentPriority, currentSize, node.deadlineDate);

                    if (evaluatedPriority !== currentPriority) {
                        node.newPriority = evaluatedPriority;
                        anyChanges = true;
                    }
                }

                // ── REGLA F: Herencia de Prioridad (Bidireccional) ────────
                if (evaluatedStatus !== statusMap.done && evaluatedStatus !== statusMap.canceled) {
                    const currentPriority   = node.newPriority !== null ? node.newPriority : node.priority;
                    let highestPriority     = currentPriority;
                    let highestWeight       = this.urgencyMotor.getPriorityWeight(currentPriority);

                    // Desde Proyectos
                    for (const pName of (node.projects ?? [])) {
                        const pPriority = projectPriorities[pName];
                        if (!pPriority) continue;
                        const pWeight = this.urgencyMotor.getPriorityWeight(pPriority);
                        if (pWeight > highestWeight) { highestWeight = pWeight; highestPriority = pPriority; }
                    }

                    // Desde Tareas Padre (Top-Down)
                    for (const parentName of node.parentTasks) {
                        const parentNode = graph[parentName];
                        if (!parentNode) continue;
                        const parentPriority = parentNode.newPriority !== null ? parentNode.newPriority : parentNode.priority;
                        const parentWeight   = this.urgencyMotor.getPriorityWeight(parentPriority);
                        if (parentWeight > highestWeight) { highestWeight = parentWeight; highestPriority = parentPriority; }
                    }

                    // Desde Tareas Hijas (Bottom-Up)
                    for (const childName of node.children) {
                        const childNode = graph[childName];
                        if (!childNode) continue;
                        const childPriority = childNode.newPriority !== null ? childNode.newPriority : childNode.priority;
                        const childWeight   = this.urgencyMotor.getPriorityWeight(childPriority);
                        if (childWeight > highestWeight) { highestWeight = childWeight; highestPriority = childPriority; }
                    }

                    if (highestPriority !== currentPriority) {
                        node.newPriority = highestPriority;
                        anyChanges = true;
                    }
                }

                // ── REGLA G: Escalado de Tamaño (Bottom-Up) ──────────────
                if (!isLeafFinal && evaluatedStatus !== statusMap.canceled) {
                    const currentSize    = node.newSize !== null ? node.newSize : node.size;
                    const childrenSizes  = node.children.map(childName => {
                        const cNode = graph[childName];
                        if (!cNode) return null;
                        const cStatus = cNode.newStatus !== null ? cNode.newStatus : cNode.status;
                        if (cStatus === statusMap.canceled) return null;
                        return cNode.newSize !== null ? cNode.newSize : cNode.size;
                    }).filter(Boolean);

                    const evaluatedSize = this.sizeMotor.evaluate(currentSize, childrenSizes);
                    if (evaluatedSize !== currentSize) {
                        node.newSize = evaluatedSize;
                        anyChanges   = true;
                    }
                }

                // ── Registro de Cambios de Estado ─────────────────────────
                if (evaluatedStatus !== currentStatus) {
                    node.newStatus = evaluatedStatus;
                    anyChanges     = true;
                }
                if (evaluatedEndDate !== currentEndDate && !(evaluatedEndDate === null && !currentEndDate)) {
                    node.newEndDate = evaluatedEndDate;
                    anyChanges      = true;
                }
                if (evaluatedArchived !== currentArchived) {
                    node.newArchived = evaluatedArchived;
                    anyChanges       = true;
                }
            }

        } while (anyChanges && loopCount < MAX_LOOPS);

        if (loopCount >= MAX_LOOPS && anyChanges) {
            console.warn(
                `[TaskEvaluator] ⚠️ Límite máximo de ${MAX_LOOPS} iteraciones alcanzado con cambios pendientes. ` +
                `El grafo puede tener ciclos o ser demasiado profundo. ` +
                `Revisa los campos 'parentTask' y 'nextTask' de tus tareas.`
            );
        }
    }
}