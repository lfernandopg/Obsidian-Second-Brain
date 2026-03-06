module.exports = async (params) => {
    const { app, quickAddApi } = params;

    // ── 0. BOOTSTRAP ──────────────────────────────────────────────────────
    customJS.SystemBootstrap.boot();

    const { Utils, TaskEvaluator, FileClassMapper } = customJS;

    // ── 1. MAPEAR PRIORIDADES DE PROYECTOS (TOP-DOWN) ─────────────────────
    const allProjects       = Utils.getFilesByClass(app, 'project');
    const projectPriorities = {};
    for (const p of allProjects) {
        const pFm = Utils.getFrontmatter(app, p);
        if (pFm && pFm.priority) projectPriorities[p.basename] = pFm.priority;
    }

    // ── 2. CONSTRUIR GRAFO ────────────────────────────────────────────────
    const allTasks = Utils.getFilesByClass(app, 'task');
    const graph    = _buildGraph(app, allTasks, Utils);

    // ── 3. EVALUAR ESTADOS Y PRIORIDADES ──────────────────────────────────
    TaskEvaluator.evaluate(graph, projectPriorities);

    // ── 4. PERSISTIR CAMBIOS ──────────────────────────────────────────────
    const { updatedCount, archivedCount, priorityScaledCount, sizeScaledCount } =
        await _applyChanges(app, quickAddApi, graph);

    // ── 5. PROCESAR RECURRENCIAS ──────────────────────────────────────────
    // Usamos el RecurrenceMotor ya inicializado dentro de TaskEvaluator
    const recurrencesCreated = await _processRecurrences(
        app,
        graph,
        FileClassMapper.STATUS_MAP,
        TaskEvaluator.recurrenceMotor   // motor inyectado, sin new ni customJS
    );

    // ── FEEDBACK CONSOLIDADO ──────────────────────────────────────────────
    if (updatedCount > 0 || recurrencesCreated > 0) {
        let msg = `✅ Sincronización completa:`;
        if (updatedCount > 0)         msg += `\n🔄 ${updatedCount} tareas actualizadas.`;
        if (archivedCount > 0)        msg += `\n📦 ${archivedCount} tareas archivadas.`;
        if (priorityScaledCount > 0)  msg += `\n🔥 ${priorityScaledCount} tareas escalaron su prioridad.`;
        if (recurrencesCreated > 0)   msg += `\n♻️ ${recurrencesCreated} tareas recurrentes creadas.`;
        if (sizeScaledCount > 0)      msg += `\n📐 ${sizeScaledCount} tareas recalcularon su tamaño.`;
        new Notice(msg);
    } else {
        new Notice(`👍 Todo el sistema está perfectamente sincronizado y al día.`);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────

function _buildGraph(app, allTasks, Utils) {
    const graph = {};
    for (const file of allTasks) {
        const fm = Utils.getFrontmatter(app, file);
        if (!fm) continue;

        graph[file.basename] = {
            file,
            status               : fm.status,
            priority             : fm.priority,
            size                 : fm.size,
            recurrence           : fm.recurrence,
            nextRecurrenceCreated: fm.nextRecurrenceCreated === true,
            startDate            : fm.startDate,
            deadlineDate         : fm.deadlineDate,
            endDate              : fm.endDate,
            archived             : fm.archived === true,
            parentTasks          : Utils.getLinks(fm.parentTask),
            nextTasks            : Utils.getLinks(fm.nextTask),
            projects             : Utils.getLinks(fm.project),
            children             : [],
            previousTasks        : [],
            newStatus            : null,
            newPriority          : null,
            newSize              : null,
            newEndDate           : undefined,
            newArchived          : null,
        };
    }

    for (const node of Object.values(graph)) {
        for (const parentName of node.parentTasks) {
            if (graph[parentName]) graph[parentName].children.push(node.file.basename);
        }
        for (const nextName of node.nextTasks) {
            if (graph[nextName]) graph[nextName].previousTasks.push(node.file.basename);
        }
    }
    return graph;
}

async function _applyChanges(app, quickAddApi, graph) {
    let updatedCount      = 0;
    let archivedCount     = 0;
    let priorityScaledCount = 0;
    let sizeScaledCount   = 0;

    for (const node of Object.values(graph)) {
        const statusChanged   = node.newStatus   !== null      && node.newStatus   !== node.status;
        const endDateChanged  = node.newEndDate  !== undefined && node.newEndDate  !== node.endDate;
        const archivedChanged = node.newArchived !== null      && node.newArchived !== node.archived;
        const priorityChanged = node.newPriority !== null      && node.newPriority !== node.priority;
        const sizeChanged     = node.newSize     !== null      && node.newSize     !== node.size;

        if (!statusChanged && !endDateChanged && !archivedChanged && !priorityChanged && !sizeChanged) continue;

        await app.fileManager.processFrontMatter(node.file, (fm) => {
            if (statusChanged)   fm.status   = node.newStatus;
            if (endDateChanged)  fm.endDate  = node.newEndDate ?? "";
            if (archivedChanged) fm.archived = node.newArchived;
            if (priorityChanged) { fm.priority = node.newPriority; priorityScaledCount++; }
            if (sizeChanged)     { fm.size     = node.newSize;     sizeScaledCount++;     }
        });
        updatedCount++;

        if (archivedChanged && node.newArchived === true) {
            await quickAddApi.executeChoice("Move By Archived", { value: node.file.path });
            archivedCount++;
        }
    }
    return { updatedCount, archivedCount, priorityScaledCount, sizeScaledCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR DE I/O: CLONACIÓN DE RECURRENCIAS
// ─────────────────────────────────────────────────────────────────────────────
async function _processRecurrences(app, graph, statusMap, motor) {
    let createdCount = 0;
    const today = window.moment();

    for (const node of Object.values(graph)) {
        if (node.archived || !node.recurrence || node.nextRecurrenceCreated) continue;

        const currentStatus = node.newStatus !== null ? node.newStatus : node.status;
        
        if (motor.shouldSpawnNext(currentStatus, node.deadlineDate, node.recurrence, node.size, statusMap.done)) {
            const { newDeadline, newStart } = motor.calculateNextDates(
                node.deadlineDate, node.startDate, node.recurrence
            );
            
            const folderPath  = customJS.FileClassMapper.getFolder("task");
            const baseName    = node.file.basename.split(" - ")[0];
            const newFileName = `${baseName} - ${window.moment(newDeadline, "MMM DD, YY - HH:mm").format("YYYY-MM-DD")}`;
            const newFilePath = `${folderPath}/${newFileName}.md`;

            if (await app.vault.adapter.exists(newFilePath)) continue;

            const originalContent = await app.vault.read(node.file);
            const newFile         = await app.vault.create(newFilePath, originalContent);

            await app.fileManager.processFrontMatter(newFile, (newFm) => {
                newFm.status               = statusMap.planned;
                newFm.startDate            = newStart;
                newFm.deadlineDate         = newDeadline;
                newFm.endDate              = "";
                newFm.createdDate          = today.format("MMM DD, YY - HH:mm");
                newFm.nextRecurrenceCreated = false;
            });

            await app.fileManager.processFrontMatter(node.file, (oldFm) => {
                oldFm.nextRecurrenceCreated = true;
            });

            createdCount++;
        }
    }
    return createdCount;
}