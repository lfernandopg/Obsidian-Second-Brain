// =========================================================================
// ⚙️ CLASE AUXILIAR: MOTOR DE URGENCIA PARA PROYECTOS
// =========================================================================
class ProjectUrgencyMotor {
    constructor(priorityMap, projectSizeMap) {
        this.pMap = priorityMap;
        this.sMap = projectSizeMap;
    }

    getPriorityWeight(priority) {
        if (priority === this.pMap.critical) return 4;
        if (priority === this.pMap.high) return 3;
        if (priority === this.pMap.medium) return 2;
        if (priority === this.pMap.low) return 1;
        return 0;
    }

    getSizeGroup(size) {
        // Grupo 3: Proyectos muy largos (Semestral, Anual) -> Requieren meses de margen
        if ([this.sMap.half_year, this.sMap.year].includes(size)) return 3;
        // Grupo 2: Proyectos medios (Mensual, Trimestral) -> Requieren semanas de margen
        if ([this.sMap.month, this.sMap.quarter].includes(size)) return 2;
        // Grupo 1: Sprints cortos -> Requieren días de margen
        return 1; 
    }

    calculateTarget(daysLeft, sizeGroup) {
        if (daysLeft < 0) return this.pMap.critical;
        
        if (sizeGroup === 1) { // 🏃 Sprints
            if (daysLeft <= 3) return this.pMap.critical;
            if (daysLeft <= 7) return this.pMap.high;
            if (daysLeft <= 10) return this.pMap.medium;
            return this.pMap.low;
        }
        if (sizeGroup === 2) { // 🗓️ Mes / Trimestre
            if (daysLeft <= 7) return this.pMap.critical;
            if (daysLeft <= 15) return this.pMap.high;
            if (daysLeft <= 30) return this.pMap.medium;
            return this.pMap.low;
        }
        if (sizeGroup === 3) { // 🌍 Semestre / Año
            if (daysLeft <= 15) return this.pMap.critical;
            if (daysLeft <= 30) return this.pMap.high;
            if (daysLeft <= 60) return this.pMap.medium;
            return this.pMap.low;
        }
        return this.pMap.low;
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
        
        // REGLA DE ORO: La prioridad solo escala hacia arriba, nunca baja automáticamente.
        return (targetWeight > currentWeight) ? targetPriority : currentPriority;
    }
}


// =========================================================================
// 🧠 CLASE PRINCIPAL: EVALUADOR DE PROYECTOS
// =========================================================================
class ProjectEvaluator {
    constructor() {
        // Carga dinámica de valores desde la configuración central
        this.statusMap = customJS.FileClassMapper.STATUS_MAP;
        
        // El ALL_VALUES contiene cualquier diccionario adicional en _config/values.md
        const projectSizes = customJS.FileClassMapper.ALL_VALUES.projectSizeMap || {};
        
        this.urgencyMotor = new ProjectUrgencyMotor(
            customJS.FileClassMapper.PRIORITY_MAP,
            projectSizes
        );
    }

    evaluate(projects) {
        const nowFormatted = window.moment().format("MMM DD, YY - HH:mm");

        for (const node of Object.values(projects)) {
            // Ignoramos los proyectos que ya están en la carpeta de archivo
            if (node.archived) continue;

            const currentStatus = node.newStatus !== null ? node.newStatus : node.status;
            let evaluatedStatus = currentStatus;
            
            const currentEndDate = node.newEndDate !== undefined ? node.newEndDate : node.endDate;
            let evaluatedEndDate = currentEndDate;

            const currentArchived = node.newArchived !== null ? node.newArchived : node.archived;
            let evaluatedArchived = currentArchived;

            // --- REGLA A: EVALUACIÓN POR TAREAS (Bottom-Up) ---
            // Revisamos el array 'tasks' que contiene los estatus de todas las tareas enlazadas al proyecto
            if (node.tasks && node.tasks.length > 0 && evaluatedStatus !== this.statusMap.canceled) {
                
                // Filtramos las tareas canceladas (no cuentan para el progreso del proyecto)
                const validTasks = node.tasks.filter(tStatus => tStatus !== this.statusMap.canceled);

                if (validTasks.length === 0 && node.tasks.length > 0) {
                    // Si todas las tareas del proyecto fueron canceladas, se cancela el proyecto automáticamente
                    evaluatedStatus = this.statusMap.canceled;
                    evaluatedArchived = true;
                } else if (validTasks.length > 0) {
                    const allDone = validTasks.every(tStatus => tStatus === this.statusMap.done);
                    const anyActive = validTasks.some(tStatus => 
                        tStatus === this.statusMap.in_progress || tStatus === this.statusMap.done
                    );
                    const anyIncomplete = validTasks.some(tStatus => tStatus !== this.statusMap.done);

                    if (allDone) {
                        // Todas las tareas válidas terminaron -> Completar Proyecto
                        evaluatedStatus = this.statusMap.done;
                        if (!evaluatedEndDate) evaluatedEndDate = nowFormatted;
                    } else {
                        // Resiliencia: Si el proyecto estaba marcado como 'Done' pero agregaste una nueva tarea, se reabre.
                        if (currentStatus === this.statusMap.done && anyIncomplete) {
                            evaluatedStatus = this.statusMap.in_progress;
                            evaluatedEndDate = null; // Limpiamos la fecha de finalización
                        } 
                        // Si el proyecto estaba 'Planned' y una tarea pasa a 'In Progress', el proyecto arranca automáticamente.
                        else if (anyActive && (evaluatedStatus === this.statusMap.inbox || evaluatedStatus === this.statusMap.planned)) {
                            evaluatedStatus = this.statusMap.in_progress;
                        }
                    }
                }
            }

            // --- REGLA B: MOTOR DE URGENCIA ---
            if (evaluatedStatus !== this.statusMap.done && evaluatedStatus !== this.statusMap.canceled) {
                const currentPriority = node.newPriority !== null ? node.newPriority : node.priority;
                
                // Calculamos si la prioridad debe subir por la cercanía de la fecha límite
                const evaluatedPriority = this.urgencyMotor.evaluate(currentPriority, node.size, node.deadlineDate);
                
                if (evaluatedPriority !== currentPriority) {
                    node.newPriority = evaluatedPriority;
                }
            }

            // --- REGISTRO INTERNO DE CAMBIOS ---
            // Solo marcamos cambios si hubo una modificación real respecto a la bóveda
            if (evaluatedStatus !== currentStatus) {
                node.newStatus = evaluatedStatus;
            }
            if (evaluatedEndDate !== currentEndDate && !(evaluatedEndDate === null && !currentEndDate)) {
                node.newEndDate = evaluatedEndDate;
            }
            if (evaluatedArchived !== currentArchived) {
                node.newArchived = evaluatedArchived;
            }
        }
    }
}