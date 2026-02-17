module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const { FileClassMapper, Utils } = customJS;
    const statusMap = FileClassMapper.STATUS_MAP;

    const getNowFormatted = () => window.moment().format("MMM DD, YY - HH:mm");

    // 1. OBTENER TODAS LAS TAREAS (¡Incluso las archivadas!)
    // Necesitamos el histórico para saber si un padre completado depende de hijos completados y archivados.
    const tasks = app.vault.getMarkdownFiles().filter(file => {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        return fm?.fileClass === 'task'; 
    });

    const getLinks = (prop) => {
        if (!prop) return [];
        const arr = Array.isArray(prop) ? prop : [prop];
        return arr.map(item => {
            if (typeof item === 'string') {
                const match = item.match(/\[\[(.*?)(\|.*)?\]\]/);
                return match ? match[1] : item;
            }
            return String(item);
        });
    };

    // 2. Construir el Grafo extendido
    const graph = {};
    tasks.forEach(task => {
        const fm = app.metadataCache.getFileCache(task)?.frontmatter;
        graph[task.basename] = {
            file: task,
            status: fm?.status,
            endDate: fm?.endDate,
            archived: fm?.archived === true, // Estado actual de archivo
            parentTasks: getLinks(fm?.parentTask),
            nextTasks: getLinks(fm?.nextTask),
            children: [],
            previousTasks: [],
            newStatus: null,
            newEndDate: undefined,
            newArchived: null // Para rastrear si debemos archivarla ahora
        };
    });

    // Poblar relaciones inversas
    Object.values(graph).forEach(node => {
        node.parentTasks.forEach(parentName => {
            if (graph[parentName]) graph[parentName].children.push(node.file.basename);
        });
        node.nextTasks.forEach(nextName => {
            if (graph[nextName]) graph[nextName].previousTasks.push(node.file.basename);
        });
    });

    // 3. Bucle de Evaluación en Cascada
    let anyChanges = false;
    let loopCount = 0;
    const MAX_LOOPS = 10;

    do {
        anyChanges = false;
        loopCount++;

        Object.values(graph).forEach(node => {
            // REGLA DE ORO (Congelación Histórica):
            // Si la tarea YA estaba archivada desde antes de correr el script, 
            // no modificamos su estado. Esto protege tus proyectos pasados.
            if (node.archived) return;

            const currentStatus = node.newStatus !== null ? node.newStatus : node.status;
            let evaluatedStatus = currentStatus;
            
            const currentEndDate = node.newEndDate !== undefined ? node.newEndDate : node.endDate;
            let evaluatedEndDate = currentEndDate;

            const currentArchived = node.newArchived !== null ? node.newArchived : node.archived;
            let evaluatedArchived = currentArchived;

            // --- REGLA A: Cancelación en Cascada y Auto-Archivo ---
            // ¿Mi padre fue cancelado?
            const hasCanceledParent = node.parentTasks.some(pName => {
                const pNode = graph[pName];
                if (!pNode) return false;
                const pStat = pNode.newStatus !== null ? pNode.newStatus : pNode.status;
                return pStat === statusMap.canceled;
            });

            // Si el padre se cancela, o el usuario canceló esta tarea manualmente:
            if (hasCanceledParent || evaluatedStatus === statusMap.canceled) {
                evaluatedStatus = statusMap.canceled;
                evaluatedArchived = true; // Auto-archivar
            } else {

                // --- REGLA B: Bloqueos Secuenciales ---
                // Tareas canceladas NO bloquean a la siguiente.
                const hasIncompletePrevious = node.previousTasks.some(prevName => {
                    const prevNode = graph[prevName];
                    if (!prevNode) return false;
                    const prevStat = prevNode.newStatus !== null ? prevNode.newStatus : prevNode.status;
                    return prevStat !== statusMap.done && prevStat !== statusMap.canceled;
                });

                if (hasIncompletePrevious) {
                    evaluatedStatus = statusMap.blocked;
                } else {
                    if (currentStatus === statusMap.blocked) {
                        evaluatedStatus = statusMap.planned;
                    }

                    // --- REGLA C: Completitud del Padre (Ignorando Cancelados) ---
                    const isLeaf = node.children.length === 0;

                    if (!isLeaf) {
                        // Excluimos las tareas hijas canceladas para que no saboteen al padre
                        const validChildren = node.children.filter(childName => {
                            const cNode = graph[childName];
                            if (!cNode) return false;
                            const cStat = cNode.newStatus !== null ? cNode.newStatus : cNode.status;
                            return cStat !== statusMap.canceled;
                        });

                        // Si todos los hijos fueron cancelados, el padre se queda sin nada que hacer
                        if (validChildren.length === 0 && node.children.length > 0) {
                            evaluatedStatus = statusMap.canceled;
                            evaluatedArchived = true;
                        } else if (validChildren.length > 0) {
                            const allValidDone = validChildren.every(childName => {
                                const cStat = graph[childName].newStatus !== null ? graph[childName].newStatus : graph[childName].status;
                                return cStat === statusMap.done;
                            });

                            const anyValidInProgressOrDone = validChildren.some(childName => {
                                const cStat = graph[childName].newStatus !== null ? graph[childName].newStatus : graph[childName].status;
                                return cStat === statusMap.in_progress || cStat === statusMap.done;
                            });

                            const anyValidIncomplete = validChildren.some(childName => {
                                const cStat = graph[childName].newStatus !== null ? graph[childName].newStatus : graph[childName].status;
                                return cStat !== statusMap.done;
                            });

                            if (allValidDone) {
                                evaluatedStatus = statusMap.done;
                                if (!evaluatedEndDate) evaluatedEndDate = getNowFormatted();
                            } else {
                                if (currentStatus === statusMap.done && anyValidIncomplete) {
                                    evaluatedStatus = statusMap.in_progress;
                                    evaluatedEndDate = null;
                                } else if (anyValidInProgressOrDone && (evaluatedStatus === statusMap.inbox || evaluatedStatus === statusMap.planned)) {
                                    evaluatedStatus = statusMap.in_progress;
                                }
                            }
                        }
                    }
                }
            }

            // --- REGLA D: Tareas Hoja y Fechas ---
            const isLeaf = node.children.length === 0;
            if (isLeaf && evaluatedStatus !== statusMap.canceled) {
                if (evaluatedEndDate && evaluatedStatus !== statusMap.done) {
                    evaluatedStatus = statusMap.done;
                }
                if (evaluatedStatus === statusMap.done && !evaluatedEndDate) {
                    evaluatedEndDate = getNowFormatted();
                }
            }

            // --- Registro Interno de Cambios ---
            if (evaluatedStatus !== currentStatus) {
                node.newStatus = evaluatedStatus;
                anyChanges = true;
            }
            const isDateChanged = evaluatedEndDate !== currentEndDate && !(evaluatedEndDate === null && !currentEndDate);
            if (isDateChanged) {
                node.newEndDate = evaluatedEndDate;
                anyChanges = true;
            }
            if (evaluatedArchived !== currentArchived) {
                node.newArchived = evaluatedArchived;
                anyChanges = true;
            }
        });

    } while (anyChanges && loopCount < MAX_LOOPS);


  // 4. APLICAR CAMBIOS Y MOVER ARCHIVOS FÍSICAMENTE
    let updatedCount = 0;
    let archivedCount = 0;
    
    for (const [basename, node] of Object.entries(graph)) {
        const statusChanged = node.newStatus !== null && node.newStatus !== node.status;
        const endDateChanged = node.newEndDate !== undefined && node.newEndDate !== node.endDate;
        const archivedChanged = node.newArchived !== null && node.newArchived !== node.archived;

        if (statusChanged || endDateChanged || archivedChanged) {
            // Actualizar Frontmatter
            await app.fileManager.processFrontMatter(node.file, (fm) => {
                if (statusChanged) fm.status = node.newStatus;
                if (endDateChanged) fm.endDate = node.newEndDate === null ? "" : node.newEndDate;
                if (archivedChanged) fm.archived = node.newArchived;
            });
            updatedCount++;

            // Ejecutar macro de QuickAdd si la tarea fue archivada
            if (archivedChanged && node.newArchived === true) {
                // Pasamos el path del archivo a la variable "value" que espera tu macro
                await quickAddApi.executeChoice("Move By Archived", { value: node.file.path });
                archivedCount++;
            }
        }
    }

    if (updatedCount > 0) {
        new Notice(`✅ Completado: ${updatedCount} tareas sincronizadas. (${archivedCount} enviadas a la macro de archivo).`);
    } else {
        new Notice(`👍 Todo el sistema está perfectamente sincronizado.`);
    }
};