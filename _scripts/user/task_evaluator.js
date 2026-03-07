// =========================================================================
// 🧠 CLASE PRINCIPAL: EVALUADOR DE TAREAS (Con Clases Anidadas)
// =========================================================================
class TaskEvaluator {
    constructor() {
        this.isInitialized   = false;
        this.statusMap       = null;
        this.urgencyMotor    = null;
        this.sizeMotor       = null;
        this.recurrenceMotor = null;
    }

    // --- CLASES ANIDADAS COMO MIEMBROS ESTÁTICOS ---

    static SizeMotor = class {
        constructor(taskSizeMap) {
            this.sMap = taskSizeMap;
            this.weightMap = {
                [this.sMap.very_small]: 1, [this.sMap.small]: 2,
                [this.sMap.medium]: 3,     [this.sMap.large]: 5,
                [this.sMap.very_large]: 8, [this.sMap.huge]: 13,
                [this.sMap.epic]: 21,
            };
            this.thresholds = [
                { limit: 1,  size: this.sMap.very_small },
                { limit: 2,  size: this.sMap.small      },
                { limit: 3,  size: this.sMap.medium     },
                { limit: 5,  size: this.sMap.large      },
                { limit: 8,  size: this.sMap.very_large },
                { limit: 13, size: this.sMap.huge       },
                { limit: Infinity, size: this.sMap.epic },
            ];
        }

        getWeight(size) { return this.weightMap[size] || 1; }

        getSizeFromWeight(weight) {
            for (const t of this.thresholds) {
                if (weight <= t.limit) return t.size;
            }
            return this.sMap.epic;
        }

        evaluate(currentParentSize, childrenSizes) {
            if (!childrenSizes || childrenSizes.length === 0) return currentParentSize;
            let totalWeight = 0;
            for (const childSize of childrenSizes) {
                totalWeight += this.getWeight(childSize);
            }
            const targetSize = this.getSizeFromWeight(totalWeight);
            const currentWeight = this.getWeight(currentParentSize);
            const targetWeight = this.getWeight(targetSize);
            return (targetWeight > currentWeight) ? targetSize : currentParentSize;
        }
    }

    static RecurrenceMotor = class {
        constructor(sizeMap) {
            this.sMap = sizeMap;
        }

        getSizeGroup(size) {
            if ([this.sMap.epic, this.sMap.huge, this.sMap.very_large].includes(size)) return 3;
            if ([this.sMap.large, this.sMap.medium].includes(size)) return 2;
            return 1;
        }

        getAnticipationDays(recurrence, sizeGroup) {
            if (!recurrence || recurrence.includes("Diario")) return 0;
            if (recurrence.includes("Semanal")) return sizeGroup === 3 ? 4 : (sizeGroup === 2 ? 2 : 1);
            if (recurrence.includes("Mensual")) return sizeGroup === 3 ? 15 : (sizeGroup === 2 ? 7 : 3);
            if (recurrence.includes("Anual"))   return sizeGroup === 3 ? 30 : (sizeGroup === 2 ? 15 : 7);
            return 0;
        }

        shouldSpawnNext(status, deadlineDate, recurrence, size, statusDone) {
            if (status === statusDone) return true;
            if (!deadlineDate || !recurrence) return false;

            const d1 = window.moment(deadlineDate, ["MMM DD, yy - HH:mm", "MMM DD, YY", "YYYY-MM-DD"], true);
            if (!d1.isValid()) return false;

            const today = window.moment().startOf('day');
            d1.startOf('day');

            let unit = recurrence.includes("Semanal") ? 'weeks' : (recurrence.includes("Mensual") ? 'months' : (recurrence.includes("Anual") ? 'years' : 'days'));
            const d2 = d1.clone().add(1, unit);
            const anticipation = this.getAnticipationDays(recurrence, this.getSizeGroup(size));
            const spawnDate = d2.clone().subtract(anticipation, 'days');

            return today.isSameOrAfter(spawnDate, 'day');
        }

        calculateNextDates(deadlineDate, startDate, recurrence) {
            let unit = recurrence.includes("Semanal") ? 'weeks' : (recurrence.includes("Mensual") ? 'months' : (recurrence.includes("Anual") ? 'years' : 'days'));
            const today = window.moment();
            const d1 = deadlineDate ? window.moment(deadlineDate, ["MMM DD, YY - HH:mm", "MMM DD, YY", "YYYY-MM-DD"], true) : null;
            const baseDeadline = (d1 && d1.isValid()) ? d1 : today.clone();
            const newDeadline = baseDeadline.clone().add(1, unit).format("MMM DD, YY - HH:mm");

            let newStart = "";
            if (startDate) {
                const d2 = window.moment(startDate, ["MMM DD, YY - HH:mm", "MMM DD, YY", "YYYY-MM-DD"], true);
                if (d2.isValid()) newStart = d2.clone().add(1, unit).format("MMM DD, YY - HH:mm");
            }
            return { newDeadline, newStart };
        }
    }

    static UrgencyMotor = class {
        constructor(priorityMap, taskSizeMap) {
            this.pMap = priorityMap;
            this.sMap = taskSizeMap;
        }

        getPriorityWeight(priority) {
            const weights = { [this.pMap.critical]: 4, [this.pMap.high]: 3, [this.pMap.medium]: 2, [this.pMap.low]: 1 };
            return weights[priority] || 0;
        }

        getSizeGroup(size) {
            if ([this.sMap.epic, this.sMap.huge, this.sMap.very_large].includes(size)) return 3;
            if ([this.sMap.large, this.sMap.medium].includes(size)) return 2;
            return 1;
        }

        calculateTarget(daysLeft, sizeGroup) {
            if (daysLeft < 0) return this.pMap.critical;
            if (daysLeft <= 2) return sizeGroup === 1 ? this.pMap.high : this.pMap.critical;
            if (daysLeft <= 6) return sizeGroup === 1 ? this.pMap.medium : (sizeGroup === 2 ? this.pMap.high : this.pMap.critical);
            if (daysLeft <= 13) return sizeGroup === 1 ? this.pMap.low : (sizeGroup === 2 ? this.pMap.medium : this.pMap.high);
            return sizeGroup === 3 ? this.pMap.medium : this.pMap.low;
        }

        evaluate(currentPriority, size, deadline) {
            if (!deadline) return currentPriority;
            const targetDate = window.moment(deadline, ["MMM DD, YY - HH:mm", "MMM DD, YY", "YYYY-MM-DD"], true).startOf('day');
            if (!targetDate.isValid()) return currentPriority;

            const daysLeft = targetDate.diff(window.moment().startOf('day'), 'days');
            const targetPriority = this.calculateTarget(daysLeft, this.getSizeGroup(size));
            return (this.getPriorityWeight(targetPriority) > this.getPriorityWeight(currentPriority)) ? targetPriority : currentPriority;
        }
    }

    /**
     * Inyecta las dependencias necesarias para operar.
     */
    init(statusMap, priorityMap, sizeMap) {
        this.statusMap       = statusMap;
        // Se instancian usando la referencia estática de la clase
        this.urgencyMotor    = new TaskEvaluator.UrgencyMotor(priorityMap, sizeMap);
        this.sizeMotor       = new TaskEvaluator.SizeMotor(sizeMap);
        this.recurrenceMotor = new TaskEvaluator.RecurrenceMotor(sizeMap);
        this.isInitialized   = true;
    }

    evaluate(graph, projectPriorities = {}) {
        if (!this.isInitialized) {
            throw new Error("TaskEvaluator no ha sido inicializado. Llama a SystemBootstrap.boot() primero.");
        }

        let anyChanges   = false;
        let loopCount    = 0;
        const MAX_LOOPS  = 30;
        const nowFormatted = window.moment().format("MMM DD, YY - HH:mm");

        do {
            anyChanges = false;
            loopCount++;

            for (const node of Object.values(graph)) {
                if (node.archived) continue;

                const currentStatus = node.newStatus !== null ? node.newStatus : node.status;
                let evaluatedStatus = currentStatus;
                const currentEndDate = node.newEndDate !== undefined ? node.newEndDate : node.endDate;
                let evaluatedEndDate = currentEndDate;
                const currentArchived = node.newArchived !== null ? node.newArchived : node.archived;
                let evaluatedArchived = currentArchived;

                // --- Lógica de Negocio (Reglas A-G) ---
                // (Se mantiene igual que tu código original, solo que ahora utiliza los motores internos)
                
                // ... [Resto de tu lógica de evaluación aquí] ...
                // Nota: El código dentro del loop 'for' permanece idéntico.
            }

        } while (anyChanges && loopCount < MAX_LOOPS);

        if (loopCount >= MAX_LOOPS && anyChanges) {
            console.warn(`[TaskEvaluator] ⚠️ Límite de iteraciones alcanzado.`);
        }
    }
}