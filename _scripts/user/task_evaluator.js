// =========================================================================
// 📐 CLASE AUXILIAR: MOTOR DE TAMAÑO (Estimación Bottom-Up)
// =========================================================================
class SizeMotor {
    constructor(taskSizeMap) {
        this.sMap = taskSizeMap;
        
        // 1. Asignamos un peso de esfuerzo usando Fibonacci
        this.weightMap = {
            [this.sMap.very_small]: 1,
            [this.sMap.small]: 2,
            [this.sMap.medium]: 3,
            [this.sMap.large]: 5,
            [this.sMap.very_large]: 8,
            [this.sMap.huge]: 13,
            [this.sMap.epic]: 21
        };
        
        // 2. Umbrales para convertir el número sumado de vuelta a una etiqueta
        this.thresholds = [
            { limit: 1, size: this.sMap.very_small },
            { limit: 2, size: this.sMap.small },
            { limit: 3, size: this.sMap.medium },
            { limit: 5, size: this.sMap.large },
            { limit: 8, size: this.sMap.very_large },
            { limit: 13, size: this.sMap.huge },
            { limit: Infinity, size: this.sMap.epic }
        ];
    }

    getWeight(size) {
        return this.weightMap[size] || 1; // Por defecto cuenta como 1 (muy pequeña)
    }

    getSizeFromWeight(weight) {
        for (const t of this.thresholds) {
            if (weight <= t.limit) return t.size;
        }
        return this.sMap.epic;
    }

    evaluate(currentParentSize, childrenSizes) {
        if (!childrenSizes || childrenSizes.length === 0) return currentParentSize;

        // Sumar el esfuerzo de todos los hijos
        let totalWeight = 0;
        for (const childSize of childrenSizes) {
            totalWeight += this.getWeight(childSize);
        }

        const targetSize = this.getSizeFromWeight(totalWeight);
        
        const currentWeight = this.getWeight(currentParentSize);
        const targetWeight = this.getWeight(targetSize);

        // REGLA DE ORO: El padre nunca puede ser más pequeño que la suma de sus hijos.
        // Solo escalamos hacia arriba.
        return (targetWeight > currentWeight) ? targetSize : currentParentSize;
    }
}


// =========================================================================
// ⚙️ CLASE AUXILIAR: MOTOR DE RECURRENCIA Y ANTICIPACIÓN
// =========================================================================
class RecurrenceMotor {
    constructor(taskSizeMap) {
        this.sMap = taskSizeMap;
    }

    // Clasifica las tareas en 3 grupos de peso (1: Ligero, 2: Medio, 3: Pesado)
    getSizeGroup(size) {
        if ([this.sMap.epic, this.sMap.huge, this.sMap.very_large].includes(size)) return 3;
        if ([this.sMap.large, this.sMap.medium].includes(size)) return 2;
        return 1;
    }

    // Matriz de Margen de Tiempo (Anticipación en Días)
    getAnticipationDays(recurrence, sizeGroup) {
        if (!recurrence) return 0;
        if (recurrence.includes("Diario")) return 0; // Se crea justo el día anterior (o el mismo día)
        
        if (recurrence.includes("Semanal")) {
            if (sizeGroup === 3) return 4; // Tareas grandes: 4 días de margen
            if (sizeGroup === 2) return 2; // Tareas medias: 2 días
            return 1;                      // Tareas pequeñas: 1 día
        }
        if (recurrence.includes("Mensual")) {
            if (sizeGroup === 3) return 15; // Tareas grandes: 15 días (ej. fin de mes)
            if (sizeGroup === 2) return 7;  // Tareas medias: 1 semana
            return 3;                       // Tareas pequeñas: 3 días
        }
        if (recurrence.includes("Anual")) {
            if (sizeGroup === 3) return 30; // 1 mes de antelación
            if (sizeGroup === 2) return 15;
            return 7;
        }
        return 0;
    }

    // Decide si ya es momento de crear (spawnear) la siguiente tarea
    shouldSpawnNext(status, deadlineDate, recurrence, size, statusDone) {
        // CONDICIÓN A: Si ya la terminaste, crea la siguiente de inmediato
        if (status === statusDone) return true;
        
        // CONDICIÓN B: Margen de tiempo cumplido
        if (!deadlineDate || !recurrence) return false;

        const today = window.moment().startOf('day');
        // d1 es el deadline de la tarea actual
        const d1 = window.moment(deadlineDate, ["MMM DD, YY - HH:mm", "MMM DD, YY", "YYYY-MM-DD"]).startOf('day');
        
        let unit = 'days';
        if (recurrence.includes("Semanal")) unit = 'weeks';
        if (recurrence.includes("Mensual")) unit = 'months';
        if (recurrence.includes("Anual")) unit = 'years';

        // d2 es el deadline calculado para la PRÓXIMA tarea
        const d2 = d1.clone().add(1, unit);
        
        const sizeGroup = this.getSizeGroup(size);
        const anticipation = this.getAnticipationDays(recurrence, sizeGroup);
        
        // La fecha en la que debe nacer la nueva tarea
        const spawnDate = d2.clone().subtract(anticipation, 'days');

        // Si hoy es mayor o igual a la fecha de nacimiento, damos luz verde
        return today.isSameOrAfter(spawnDate, 'day');
    }

    calculateNextDates(deadlineDate, startDate, recurrence) {
        let unit = 'days';
        if (recurrence.includes("Semanal")) unit = 'weeks';
        if (recurrence.includes("Mensual")) unit = 'months';
        if (recurrence.includes("Anual")) unit = 'years';

        const today = window.moment();
        const d1 = deadlineDate ? window.moment(deadlineDate, ["MMM DD, YY - HH:mm", "MMM DD, YY", "YYYY-MM-DD"]) : today.clone();
        
        const newDeadline = d1.clone().add(1, unit).format("MMM DD, YY - HH:mm");
        const newStart = startDate 
            ? window.moment(startDate, ["MMM DD, YY - HH:mm", "MMM DD, YY", "YYYY-MM-DD"]).add(1, unit).format("MMM DD, YY - HH:mm") 
            : "";

        return { newDeadline, newStart };
    }
}

// =========================================================================
// ⚙️ CLASE AUXILIAR: MOTOR DE URGENCIA
// =========================================================================
class UrgencyMotor {
    constructor(priorityMap, taskSizeMap) {
        this.pMap = priorityMap;
        this.sMap = taskSizeMap;
    }

    getPriorityWeight(priority) {
        if (priority === this.pMap.critical) return 4;
        if (priority === this.pMap.high) return 3;
        if (priority === this.pMap.medium) return 2;
        if (priority === this.pMap.low) return 1;
        return 0;
    }

    getSizeGroup(size) {
        if ([this.sMap.epic, this.sMap.huge, this.sMap.very_large].includes(size)) return 3; 
        if ([this.sMap.large, this.sMap.medium].includes(size)) return 2; 
        if ([this.sMap.small, this.sMap.very_small].includes(size)) return 1; 
        return 1; // Por defecto ligera
    }

    calculateTarget(daysLeft, sizeGroup) {
        if (daysLeft < 0) return this.pMap.critical;
        if (daysLeft <= 2) return sizeGroup === 1 ? this.pMap.high : this.pMap.critical;
        
        if (daysLeft <= 6) {
            if (sizeGroup === 1) return this.pMap.medium;
            if (sizeGroup === 2) return this.pMap.high;
            return this.pMap.critical;
        }
        
        if (daysLeft <= 13) {
            if (sizeGroup === 1) return this.pMap.low;
            if (sizeGroup === 2) return this.pMap.medium;
            return this.pMap.high;
        }
        
        return sizeGroup === 3 ? this.pMap.medium : this.pMap.low;
    }

    evaluate(currentPriority, size, deadline) {
        if (!deadline) return currentPriority;
        
        const today = window.moment().startOf('day');
        const targetDate = window.moment(deadline, ["MMM DD, YY - HH:mm", "MMM DD, YY", "YYYY-MM-DD"]).startOf('day');
        const daysLeft = targetDate.diff(today, 'days');
        
        const sizeGroup = this.getSizeGroup(size);
        const targetPriority = this.calculateTarget(daysLeft, sizeGroup);
        
        const currentWeight = this.getPriorityWeight(currentPriority);
        const targetWeight = this.getPriorityWeight(targetPriority);
        
        // REGLA DE ORO: Solo escalar hacia arriba.
        return (targetWeight > currentWeight) ? targetPriority : currentPriority;
    }
}

// =========================================================================
// 🧠 CLASE PRINCIPAL: EVALUADOR DE TAREAS
// =========================================================================
class TaskEvaluator {
    constructor() {
        // Carga dinámica de valores desde la configuración central
        this.statusMap = customJS.FileClassMapper.STATUS_MAP;
        this.urgencyMotor = new UrgencyMotor(
            customJS.FileClassMapper.PRIORITY_MAP,
            customJS.FileClassMapper.SIZE_MAP
        );
        this.sizeMotor = new SizeMotor(customJS.FileClassMapper.SIZE_MAP);
    }

    evaluate(graph, projectPriorities = {}) {
        let anyChanges = false;
        let loopCount = 0;
        const MAX_LOOPS = 10;
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

                // --- REGLA A: Cancelación en Cascada ---
                const hasCanceledParent = node.parentTasks.some(pName => {
                    const pNode = graph[pName];
                    return pNode && (pNode.newStatus !== null ? pNode.newStatus : pNode.status) === this.statusMap.canceled;
                });

                if (hasCanceledParent || evaluatedStatus === this.statusMap.canceled) {
                    evaluatedStatus = this.statusMap.canceled;
                    evaluatedArchived = true;
                } else {
                    // --- REGLA B: Bloqueos Secuenciales ---
                    const hasIncompletePrevious = node.previousTasks.some(prevName => {
                        const prevNode = graph[prevName];
                        if (!prevNode) return false;
                        const prevStat = prevNode.newStatus !== null ? prevNode.newStatus : prevNode.status;
                        return prevStat !== this.statusMap.done && prevStat !== this.statusMap.canceled;
                    });

                    if (hasIncompletePrevious) {
                        evaluatedStatus = this.statusMap.blocked;
                    } else if (currentStatus === this.statusMap.blocked) {
                        evaluatedStatus = this.statusMap.planned;
                    }

                    // --- REGLA C: Evaluación por Hijos (Subtareas) ---
                    const isLeaf = node.children.length === 0;
                    if (!isLeaf) {
                        const validChildren = node.children.filter(childName => {
                            const cNode = graph[childName];
                            return cNode && (cNode.newStatus !== null ? cNode.newStatus : cNode.status) !== this.statusMap.canceled;
                        });

                        if (validChildren.length === 0 && node.children.length > 0) {
                            evaluatedStatus = this.statusMap.canceled;
                            evaluatedArchived = true;
                        } else if (validChildren.length > 0) {
                            const allDone = validChildren.every(c => (graph[c].newStatus !== null ? graph[c].newStatus : graph[c].status) === this.statusMap.done);
                            const anyActive = validChildren.some(c => {
                                const stat = graph[c].newStatus !== null ? graph[c].newStatus : graph[c].status;
                                return stat === this.statusMap.in_progress || stat === this.statusMap.done;
                            });
                            const anyIncomplete = validChildren.some(c => (graph[c].newStatus !== null ? graph[c].newStatus : graph[c].status) !== this.statusMap.done);

                            if (allDone) {
                                evaluatedStatus = this.statusMap.done;
                                if (!evaluatedEndDate) evaluatedEndDate = nowFormatted;
                            } else {
                                if (currentStatus === this.statusMap.done && anyIncomplete) {
                                    evaluatedStatus = this.statusMap.in_progress;
                                    evaluatedEndDate = null;
                                } else if (anyActive && (evaluatedStatus === this.statusMap.inbox || evaluatedStatus === this.statusMap.planned)) {
                                    evaluatedStatus = this.statusMap.in_progress;
                                }
                            }
                        }
                    }
                }

                // --- REGLA D: Cierre de Tareas Hoja ---
                const isLeafFinal = node.children.length === 0; // Calculamos de nuevo por seguridad
                if (isLeafFinal && evaluatedStatus !== this.statusMap.canceled) {
                    if (evaluatedEndDate && evaluatedStatus !== this.statusMap.done) {
                        evaluatedStatus = this.statusMap.done;
                    }
                    if (evaluatedStatus === this.statusMap.done && !evaluatedEndDate) {
                        evaluatedEndDate = nowFormatted;
                    }
                }

                // --- REGLA E: MOTOR DE URGENCIA ---
                if (evaluatedStatus !== this.statusMap.done && evaluatedStatus !== this.statusMap.canceled) {
                    const currentPriority = node.newPriority !== null ? node.newPriority : node.priority;
                    const evaluatedPriority = this.urgencyMotor.evaluate(currentPriority, node.size, node.deadlineDate);
                    
                    if (evaluatedPriority !== currentPriority) {
                        node.newPriority = evaluatedPriority;
                        anyChanges = true;
                    }
                }

                // --- REGLA F: HERENCIA DE PRIORIDAD (Top-Down) ---
                if (evaluatedStatus !== this.statusMap.done && evaluatedStatus !== this.statusMap.canceled) {
                    const currentPriority = node.newPriority !== null ? node.newPriority : node.priority;
                    let highestTargetPriority = currentPriority;
                    let highestWeight = this.urgencyMotor.getPriorityWeight(currentPriority);

                    // 1. Herencia del Proyecto Padre (Si el proyecto quema, la tarea quema)
                    if (node.projects && node.projects.length > 0) {
                        for (const pName of node.projects) {
                            const pPriority = projectPriorities[pName];
                            if (pPriority) {
                                const pWeight = this.urgencyMotor.getPriorityWeight(pPriority);
                                if (pWeight > highestWeight) {
                                    highestWeight = pWeight;
                                    highestTargetPriority = pPriority;
                                }
                            }
                        }
                    }

                    // 2. Herencia de la Tarea Padre (Recursividad Top-Down para Subtareas)
                    if (node.parentTasks.length > 0) {
                        for (const parentName of node.parentTasks) {
                            const parentNode = graph[parentName];
                            if (parentNode) {
                                // Usamos la nueva prioridad del padre por si fue actualizada en este mismo bucle
                                const parentPriority = parentNode.newPriority !== null ? parentNode.newPriority : parentNode.priority;
                                const parentWeight = this.urgencyMotor.getPriorityWeight(parentPriority);
                                if (parentWeight > highestWeight) {
                                    highestWeight = parentWeight;
                                    highestTargetPriority = parentPriority;
                                }
                            }
                        }
                    }

                    if (highestTargetPriority !== currentPriority) {
                        node.newPriority = highestTargetPriority;
                        // Forzamos otra vuelta del bucle para asegurar que los hijos (subtareas) 
                        // hereden esta nueva prioridad en la siguiente iteración
                        anyChanges = true; 
                    }
                }

                // --- REGLA G: ESCALADO DE TAMAÑO (Bottom-Up) ---
                if (!isLeafFinal && evaluatedStatus !== this.statusMap.canceled) {
                    const currentSize = node.newSize !== null ? node.newSize : node.size;
                    
                    // Obtenemos los tamaños de las subtareas (ignoramos las canceladas porque no requieren esfuerzo)
                    const childrenSizes = node.children.map(childName => {
                        const cNode = graph[childName];
                        if (!cNode) return null;
                        const cStatus = cNode.newStatus !== null ? cNode.newStatus : cNode.status;
                        if (cStatus === this.statusMap.canceled) return null; 
                        return cNode.newSize !== null ? cNode.newSize : cNode.size;
                    }).filter(Boolean);

                    const evaluatedSize = this.sizeMotor.evaluate(currentSize, childrenSizes);

                    if (evaluatedSize !== currentSize) {
                        node.newSize = evaluatedSize;
                        anyChanges = true; // Forzamos otra vuelta del bucle para que el tamaño siga subiendo a los abuelos
                    }
                }

                // --- Registro Interno de Cambios de Estado ---
                if (evaluatedStatus !== currentStatus) {
                    node.newStatus = evaluatedStatus;
                    anyChanges = true;
                }
                if (evaluatedEndDate !== currentEndDate && !(evaluatedEndDate === null && !currentEndDate)) {
                    node.newEndDate = evaluatedEndDate;
                    anyChanges = true;
                }
                if (evaluatedArchived !== currentArchived) {
                    node.newArchived = evaluatedArchived;
                    anyChanges = true;
                }
            }

        } while (anyChanges && loopCount < MAX_LOOPS);
    }
}