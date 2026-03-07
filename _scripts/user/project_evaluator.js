// =========================================================================
// 🧠 CLASE PRINCIPAL: EVALUADOR DE PROYECTOS (Con Clases Anidadas)
// =========================================================================
class ProjectEvaluator {
    constructor() {
        this.isInitialized = false;
        this.statusMap     = null;
        this.urgencyMotor  = null;
    }

    // --- CLASE ANIDADA: MOTOR DE URGENCIA ESPECÍFICO PARA PROYECTOS ---
    static UrgencyMotor = class {
        constructor(priorityMap, projectSizeMap) {
            this.pMap = priorityMap;
            this.sMap = projectSizeMap;
        }

        getPriorityWeight(priority) {
            const weights = {
                [this.pMap.critical]: 4,
                [this.pMap.high]:     3,
                [this.pMap.medium]:   2,
                [this.pMap.low]:      1
            };
            return weights[priority] || 0;
        }

        getSizeGroup(size) {
            if ([this.sMap.half_year, this.sMap.year].includes(size))    return 3;
            if ([this.sMap.month,     this.sMap.quarter].includes(size)) return 2;
            return 1;
        }

        calculateTarget(daysLeft, sizeGroup) {
            if (daysLeft < 0) return this.pMap.critical;

            if (sizeGroup === 1) {
                if (daysLeft <= 3)  return this.pMap.critical;
                if (daysLeft <= 7)  return this.pMap.high;
                if (daysLeft <= 10) return this.pMap.medium;
                return this.pMap.low;
            }
            if (sizeGroup === 2) {
                if (daysLeft <= 7)  return this.pMap.critical;
                if (daysLeft <= 15) return this.pMap.high;
                if (daysLeft <= 30) return this.pMap.medium;
                return this.pMap.low;
            }
            if (sizeGroup === 3) {
                if (daysLeft <= 15) return this.pMap.critical;
                if (daysLeft <= 30) return this.pMap.high;
                if (daysLeft <= 60) return this.pMap.medium;
                return this.pMap.low;
            }
            return this.pMap.low;
        }

        evaluate(currentPriority, size, deadline) {
            if (!deadline) return currentPriority;

            const FORMATS = ["MMM DD, yy"];
            const targetDate = window.moment(deadline, FORMATS, true).startOf('day');

            if (!targetDate.isValid()) {
                console.warn(`[ProjectEvaluator.UrgencyMotor] deadlineDate inválida: "${deadline}"`);
                return currentPriority;
            }

            const today    = window.moment().startOf('day');
            const daysLeft = targetDate.diff(today, 'days');
            const sizeGroup = this.getSizeGroup(size);
            const targetPriority = this.calculateTarget(daysLeft, sizeGroup);

            const currentWeight = this.getPriorityWeight(currentPriority);
            const targetWeight  = this.getPriorityWeight(targetPriority);

            return (targetWeight > currentWeight) ? targetPriority : currentPriority;
        }
    }

    /**
     * Inyecta las dependencias e instancia el motor anidado.
     */
    init(statusMap, priorityMap, projectSizeMap) {
        this.statusMap    = statusMap;
        // Instanciación de la clase anidada
        this.urgencyMotor = new ProjectEvaluator.UrgencyMotor(priorityMap, projectSizeMap);
        this.isInitialized = true;
    }

    evaluate(projects) {
        if (!this.isInitialized) {
            throw new Error("ProjectEvaluator no ha sido inicializado.");
        }

        const nowFormatted = window.moment().format("MMM DD, yy");

        for (const node of Object.values(projects)) {
            if (node.archived) continue;

            const currentStatus   = node.newStatus   !== null      ? node.newStatus   : node.status;
            let   evaluatedStatus = currentStatus;

            const currentEndDate   = node.newEndDate  !== undefined ? node.newEndDate  : node.endDate;
            let   evaluatedEndDate = currentEndDate;

            const currentArchived   = node.newArchived !== null      ? node.newArchived : node.archived;
            let   evaluatedArchived = currentArchived;

            // --- REGLA A: EVALUACIÓN POR TAREAS (Bottom-Up) ---
            if (node.tasks && node.tasks.length > 0 && evaluatedStatus !== this.statusMap.canceled) {
                const validTasks = node.tasks.filter(tStatus => tStatus !== this.statusMap.canceled);

                if (validTasks.length === 0 && node.tasks.length > 0) {
                    evaluatedStatus   = this.statusMap.canceled;
                    evaluatedArchived = true;
                } else if (validTasks.length > 0) {
                    const allDone       = validTasks.every(tStatus => tStatus === this.statusMap.done);
                    const anyActive     = validTasks.some(tStatus =>
                        tStatus === this.statusMap.in_progress || tStatus === this.statusMap.done
                    );
                    const anyIncomplete = validTasks.some(tStatus => tStatus !== this.statusMap.done);

                    if (allDone) {
                        evaluatedStatus = this.statusMap.done;
                        if (!evaluatedEndDate) evaluatedEndDate = nowFormatted;
                    } else {
                        if (currentStatus === this.statusMap.done && anyIncomplete) {
                            evaluatedStatus  = this.statusMap.in_progress;
                            evaluatedEndDate = null;
                        } else if (anyActive && (evaluatedStatus === this.statusMap.inbox || evaluatedStatus === this.statusMap.planned)) {
                            evaluatedStatus = this.statusMap.in_progress;
                        }
                    }
                }
            }

            // --- REGLA B: MOTOR DE URGENCIA ---
            if (evaluatedStatus !== this.statusMap.done && evaluatedStatus !== this.statusMap.canceled) {
                const currentPriority   = node.newPriority !== null ? node.newPriority : node.priority;
                const evaluatedPriority = this.urgencyMotor.evaluate(currentPriority, node.size, node.deadlineDate);

                if (evaluatedPriority !== currentPriority) {
                    node.newPriority = evaluatedPriority;
                }
            }

            // --- Registro de Cambios ---
            if (evaluatedStatus !== currentStatus) node.newStatus = evaluatedStatus;
            if (evaluatedEndDate !== currentEndDate && !(evaluatedEndDate === null && !currentEndDate)) {
                node.newEndDate = evaluatedEndDate;
            }
            if (evaluatedArchived !== currentArchived) node.newArchived = evaluatedArchived;
        }
    }
}