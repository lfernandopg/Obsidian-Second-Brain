module.exports = async (params) => {
    const { app } = params;
    
    // 1. Blindaje Inicial
    if (!customJS || !customJS.FileClassMapper || !customJS.Utils) {
        new Notice("❌ Error: customJS o sus módulos no están cargados.");
        return;
    }

    const { FileClassMapper, Utils } = customJS; // Añadimos Utils aquí
    const statusMap = FileClassMapper.STATUS_MAP;
    
    // Extraer la API de QuickAdd
    const quickAddApi = app.plugins.plugins.quickadd.api;

    // 🚀 NUEVO: SINCRONIZAR TAREAS PRIMERO 🚀
    new Notice("⏳ Sincronizando jerarquía de tareas...");
    try {
        await quickAddApi.executeChoice("Sync Task Hierarchy");
        // Pausa táctica para permitir que Obsidian actualice su metadataCache
        await Utils.sleep(800); 
    } catch (error) {
        console.error("Error al sincronizar tareas previas:", error);
        new Notice("❌ Error al ejecutar 'Sync Task Hierarchy'. Revisa la consola.");
        return; // Detenemos el script si las tareas fallan
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // 2. OBTENER PROYECTOS Y TAREAS DEL VAULT (Con la caché ya actualizada)
    const allFiles = app.vault.getMarkdownFiles();
    const projects = {};
    const tasks = [];

    allFiles.forEach(file => {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        if (!fm) return;

        if (fm.fileClass === 'project') {
            projects[file.basename] = {
                file: file,
                status: fm.status,
                startDate: fm.startDate,
                deadlineDate: fm.deadlineDate,
                endDate: fm.endDate,
                archived: fm.archived === true,
                tasks: [],
                newStatus: null,
                newEndDate: undefined,
                newArchived: null
            };
        } else if (fm.fileClass === 'task') {
            tasks.push({
                file: file,
                status: fm.status,
                projects: getLinks(fm.project)
            });
        }
    });

    // 3. MAPEAR TAREAS A PROYECTOS
    tasks.forEach(task => {
        task.projects.forEach(projectName => {
            if (projects[projectName]) {
                projects[projectName].tasks.push(task.status);
            }
        });
    });

    // 4. BUCLE DE EVALUACIÓN DE PROYECTOS
    let anyChanges = false;

    Object.values(projects).forEach(proj => {
        if (proj.archived) return;

        let evaluatedStatus = proj.status;
        let evaluatedEndDate = proj.endDate;
        let evaluatedArchived = proj.archived;

        const validTasks = proj.tasks.filter(status => status !== statusMap.canceled);

        // REGLA A: Fechas
        if (proj.startDate && evaluatedStatus !== statusMap.done && evaluatedStatus !== statusMap.canceled) {
            const startDate = new Date(proj.startDate);
            startDate.setHours(0, 0, 0, 0);
            
            if (startDate > today && evaluatedStatus === statusMap.inbox) {
                evaluatedStatus = statusMap.planned;
            } else if (startDate <= today && evaluatedStatus === statusMap.planned) {
                evaluatedStatus = statusMap.in_progress;
            }
        }

        // REGLA B: Tareas
        if (proj.tasks.length > 0) {
            if (validTasks.length === 0) {
                evaluatedStatus = statusMap.canceled;
                evaluatedArchived = true;
            } else {
                const allValidDone = validTasks.every(status => status === statusMap.done);
                const anyValidInProgressOrDone = validTasks.some(status => status === statusMap.in_progress || status === statusMap.done);
                const anyValidIncomplete = validTasks.some(status => status !== statusMap.done);

                if (allValidDone) {
                    evaluatedStatus = statusMap.done;
                    evaluatedArchived = true;
                    if (!evaluatedEndDate) evaluatedEndDate = window.moment().format("MMM DD, YY"); 
                } else {
                    if (proj.status === statusMap.done && anyValidIncomplete) {
                        evaluatedStatus = statusMap.in_progress;
                        evaluatedEndDate = null; 
                        evaluatedArchived = false;
                    } 
                    else if (anyValidInProgressOrDone && (evaluatedStatus === statusMap.inbox || evaluatedStatus === statusMap.planned)) {
                        evaluatedStatus = statusMap.in_progress;
                    }
                }
            }
        }

        if (proj.deadlineDate && evaluatedStatus !== statusMap.done && evaluatedStatus !== statusMap.canceled) {
            const deadline = new Date(proj.deadlineDate);
            deadline.setHours(0, 0, 0, 0);
            if (deadline < today) {
                console.log(`⚠️ Project overdue: ${proj.file.basename}`);
            }
        }

        if (evaluatedStatus !== proj.status) {
            proj.newStatus = evaluatedStatus;
            anyChanges = true;
        }
        if (evaluatedEndDate !== proj.endDate && !(evaluatedEndDate === null && !proj.endDate)) {
            proj.newEndDate = evaluatedEndDate;
            anyChanges = true;
        }
        if (evaluatedArchived !== proj.archived) {
            proj.newArchived = evaluatedArchived;
            anyChanges = true;
        }
    });

    // 5. APLICAR CAMBIOS
    let updatedCount = 0;
    let archivedCount = 0;

    for (const [basename, proj] of Object.entries(projects)) {
        const statusChanged = proj.newStatus !== null && proj.newStatus !== proj.status;
        const endDateChanged = proj.newEndDate !== undefined && proj.newEndDate !== proj.endDate;
        const archivedChanged = proj.newArchived !== null && proj.newArchived !== proj.archived;

        if (statusChanged || endDateChanged || archivedChanged) {
            await app.fileManager.processFrontMatter(proj.file, (fm) => {
                if (statusChanged) fm.status = proj.newStatus;
                if (endDateChanged) fm.endDate = proj.newEndDate === null ? "" : proj.newEndDate;
                if (archivedChanged) fm.archived = proj.newArchived;
            });
            updatedCount++;

            if (archivedChanged && proj.newArchived === true) {
                await quickAddApi.executeChoice("Move By Archived", { value: proj.file.path });
                archivedCount++;
            }
        }
    }

    if (updatedCount > 0) {
        new Notice(`✅ Completado: ${updatedCount} proyectos sincronizados. (${archivedCount} archivados).`);
    } else {
        new Notice(`👍 Los proyectos están perfectamente sincronizados con sus tareas.`);
    }
};