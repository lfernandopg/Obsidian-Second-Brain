module.exports = async (params) => {
    const { app, quickAddApi } = params;

    // ── 0. BOOTSTRAP ──────────────────────────────────────────────────────
    customJS.SystemBootstrap.boot();

    const { Utils, TaskEvaluator, FileClassMapper } = customJS;

    // ── 1. MAPEAR PRIORIDADES DE PROYECTOS (TOP-DOWN) ─────────────────────
    const fileCache = new Map();

    // Instanciar el motor de urgencia de proyectos para evaluarlos en memoria
    const projectUrgencyMotor = customJS.ProjectEvaluator.urgencyMotor

    const allProjects       = Utils.getFilesByClass(app, 'project', fileCache);
    const projectPriorities = {};
    for (const p of allProjects) {
        const pFm = Utils.getFrontmatter(app, p);
        if (pFm) {
            // Evaluamos la prioridad del proyecto en memoria (por si su deadline está cerca)
            const evaluatedPriority = projectUrgencyMotor.evaluate(pFm.priority, pFm.size, pFm.deadlineDate);
            projectPriorities[p.basename] = evaluatedPriority;
        }
    }

    // ── 2. CONSTRUIR GRAFO ────────────────────────────────────────────────
    const allTasks = Utils.getFilesByClass(app, 'task', fileCache);
    const graph    = _buildGraph(app, allTasks, Utils);

    // ── 3. EVALUAR ESTADOS Y PRIORIDADES ──────────────────────────────────
    TaskEvaluator.evaluate(graph, projectPriorities);

    // ── 4. PERSISTIR CAMBIOS ──────────────────────────────────────────────
    const { updatedCount, archivedCount, priorityScaledCount, sizeScaledCount } =
        await _applyChanges(app, quickAddApi, graph);

    // ── 5. PROCESAR RECURRENCIAS ──────────────────────────────────────────
    const recurrencesCreated = await _processRecurrences(
        app,
        graph,
        FileClassMapper.STATUS_MAP,
        TaskEvaluator.recurrenceMotor
    );

    // ── FEEDBACK CONSOLIDADO ──────────────────────────────────────────────
    if (updatedCount > 0 || recurrencesCreated > 0) {
        let msg = `✅ Sincronización completa:`;
        if (updatedCount > 0)        msg += `\n🔄 ${updatedCount} tareas actualizadas.`;
        if (archivedCount > 0)       msg += `\n📦 ${archivedCount} tareas archivadas.`;
        if (priorityScaledCount > 0) msg += `\n🔥 ${priorityScaledCount} tareas escalaron su prioridad.`;
        if (recurrencesCreated > 0)  msg += `\n♻️ ${recurrencesCreated} tareas recurrentes creadas.`;
        if (sizeScaledCount > 0)     msg += `\n📐 ${sizeScaledCount} tareas recalcularon su tamaño.`;
        new Notice(msg);
    } else {
        new Notice(`👍 Todo el sistema está perfectamente sincronizado y al día.`);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DEL GRAFO
// ─────────────────────────────────────────────────────────────────────────────

function _buildGraph(app, allTasks, Utils) {
    const graph = {};
    for (const file of allTasks) {
        // [FIX V-9 / anterior] try-catch individual por archivo para no abortar el grafo entero
        try {
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
        } catch (err) {
            console.error(`[_buildGraph] Error procesando "${file.basename}":`, err);
        }
    }

    for (const node of Object.values(graph)) {
        for (const parentName of node.parentTasks) {
            if (graph[parentName]) graph[parentName].children.push(node.file.basename);
        }
        for (const nextName of node.nextTasks) {
            if (graph[nextName]) graph[nextName].previousTasks.push(node.file.basename);
        }
    }

    // [FIX V-8] Detectar ciclos en el grafo ANTES de evaluar.
    // Un ciclo (A → B → A) impediría que anyChanges se estabilice, agotando
    // MAX_LOOPS. Detectarlo aquí permite advertir al usuario con contexto claro.
    _detectCycles(graph);

    return graph;
}

/**
 * [FIX V-8] Detección de ciclos mediante DFS con coloración (blanco/gris/negro).
 * - BLANCO (0): nodo no visitado.
 * - GRIS   (1): nodo en el stack de llamadas actual (back-edge = ciclo).
 * - NEGRO  (2): nodo completamente procesado.
 *
 * Solo emite console.warn; no lanza excepción para no abortar la sincronización
 * completa. El usuario puede corregir el ciclo y re-ejecutar.
 *
 * @param {Object} graph - Grafo de nodos de tareas
 */
function _detectCycles(graph) {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = {};
    const cyclesFound = [];

    for (const k of Object.keys(graph)) color[k] = WHITE;

    function dfs(name, path) {
        color[name] = GRAY;
        path.push(name);

        for (const childName of (graph[name]?.children ?? [])) {
            if (color[childName] === GRAY) {
                // Encontramos un back-edge: hay un ciclo
                const cycleStart = path.indexOf(childName);
                const cyclePath  = [...path.slice(cycleStart), childName].join(' → ');
                cyclesFound.push(cyclePath);
                // Continúa para detectar todos los ciclos, no solo el primero
                continue;
            }
            if (color[childName] === WHITE) {
                dfs(childName, path);
            }
        }

        path.pop();
        color[name] = BLACK;
    }

    for (const k of Object.keys(graph)) {
        if (color[k] === WHITE) dfs(k, []);
    }

    if (cyclesFound.length > 0) {
        console.warn(
            `[TaskGraph] ⚠️ Se detectaron ${cyclesFound.length} ciclo(s) en el grafo de tareas. ` +
            `Esto puede causar evaluaciones incompletas. Revisa los campos 'parentTask' de estas tareas:\n` +
            cyclesFound.map((c, i) => `  ${i + 1}. ${c}`).join('\n')
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCIA
// ─────────────────────────────────────────────────────────────────────────────

async function _applyChanges(app, quickAddApi, graph) {
    let updatedCount       = 0;
    let archivedCount      = 0;
    let priorityScaledCount = 0;
    let sizeScaledCount    = 0;

    for (const node of Object.values(graph)) {
        const statusChanged   = node.newStatus   !== null      && node.newStatus   !== node.status;
        const endDateChanged  = node.newEndDate  !== undefined && node.newEndDate  !== node.endDate;
        const archivedChanged = node.newArchived !== null      && node.newArchived !== node.archived;
        const priorityChanged = node.newPriority !== null      && node.newPriority !== node.priority;
        const sizeChanged     = node.newSize     !== null      && node.newSize     !== node.size;

        if (!statusChanged && !endDateChanged && !archivedChanged && !priorityChanged && !sizeChanged) continue;

        // [FIX ADICIONAL] try-catch individual para que un fallo no aborte el resto del bucle
        try {
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
        } catch (err) {
            console.error(`[_applyChanges] Error persistiendo cambios en "${node.file.basename}":`, err);
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

    // [FIX #3] RegEx estricta para quitar SOLO la fecha final YYYY-MM-DD
    // Captura opcionalmente el separador " - " inmediatamente antes de la fecha.
    // Ejemplo: "Proyecto X - Fase 1 - 2026-03-05"  →  "Proyecto X - Fase 1"
    const DATE_SUFFIX_REGEX = /\s*-\s*\d{4}-\d{2}-\d{2}$/;

    for (const node of Object.values(graph)) {
        if (node.archived || !node.recurrence || node.nextRecurrenceCreated) continue;

        const currentStatus = node.newStatus !== null ? node.newStatus : node.status;

        if (!motor.shouldSpawnNext(currentStatus, node.deadlineDate, node.recurrence, node.size, statusMap.done)) {
            continue;
        }

        try {
            const { newDeadline, newStart } = motor.calculateNextDates(
                node.deadlineDate, node.startDate, node.recurrence
            );

            const folderPath = customJS.FileClassMapper.getFolder("task");

            // [FIX #3] Usar RegEx en lugar de split(" - ")[0]
            const baseName    = node.file.basename.replace(DATE_SUFFIX_REGEX, "").trim();
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
                // [FIX ADICIONAL] La nueva tarea comienza sin marca de recurrencia creada
                newFm.nextRecurrenceCreated = false;
            });

            await app.fileManager.processFrontMatter(node.file, (oldFm) => {
                oldFm.nextRecurrenceCreated = true;
            });

            createdCount++;
        } catch (err) {
            console.error(`[_processRecurrences] Error clonando recurrencia de "${node.file.basename}":`, err);
        }
    }
    return createdCount;
}