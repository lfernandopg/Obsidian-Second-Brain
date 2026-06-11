/**
 * sync_task_hierarchy.js
 * Capa de Infraestructura / Controlador
 *
 * Responsabilidades:
 *   1. Boot del sistema
 *   2. Leer el vault y construir el grafo de tareas en memoria
 *   3. Pasar el grafo a TaskEvaluator (dominio puro)
 *   4. Persistir los cambios calculados
 *   5. Procesar recurrencias (I/O puro)
 *
 * NO contiene lógica de evaluación. Toda la lógica está en TaskEvaluator.
 */
module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const CTRL = "SyncTaskHierarchy";

    // ── 0. BOOTSTRAP ──────────────────────────────────────────────────────
    try {
        customJS.SystemBootstrap.boot();
    } catch (err) {
        new Notice(customJS?.Messages?.get("BOOTSTRAP_BOOT_ERROR", err.message) ?? `❌ Error crítico: ${err.message}`);
        return;
    }

    const { Utils, TaskEvaluator, ProjectEvaluator, FileClassMapper, Messages, Logger, Settings } = customJS;

    Logger.info(CTRL, "Iniciando sincronización de tareas.");
    new Notice(Messages.get("SYNC_TASK_START"));

    // ── 1. MAPEAR PRIORIDADES DE PROYECTOS (TOP-DOWN) ─────────────────────
    const fileCache = new Map(); // Caché compartido para toda la ejecución

    const allProjects       = Utils.getFilesByClass(app, 'project', fileCache);
    const projectPriorities = {};

    Logger.info(CTRL, "Evaluando prioridades de proyectos en memoria.", { count: allProjects.length });

    for (const p of allProjects) {
        try {
            const pFm = Utils.getFrontmatter(app, p);
            if (!pFm) continue;
            projectPriorities[p.basename] = ProjectEvaluator.urgencyMotor.evaluate(
                pFm.priority, pFm.size, pFm.deadlineDate
            );
        } catch (err) {
            Logger.warn(CTRL, `Error evaluando prioridad del proyecto "${p.basename}".`, { error: err.message });
        }
    }

    // ── 2. CONSTRUIR GRAFO ────────────────────────────────────────────────
    const allTasks = Utils.getFilesByClass(app, 'task', fileCache);
    Logger.info(CTRL, "Construyendo grafo de tareas.", { count: allTasks.length });

    const graph = _buildGraph(app, allTasks, Utils, Logger, CTRL);

    // ── 3. DETECTAR CICLOS ────────────────────────────────────────────────
    _detectCycles(graph, Logger, CTRL);

    // ── 4. EVALUAR ESTADOS Y PRIORIDADES ──────────────────────────────────
    Logger.info(CTRL, "Ejecutando evaluación de dominio (TaskEvaluator).");
    TaskEvaluator.evaluate(graph, projectPriorities);

    // ── 5. PERSISTIR CAMBIOS ──────────────────────────────────────────────
    Logger.info(CTRL, "Persistiendo cambios en el vault.");
    const { updatedCount, archivedCount, priorityScaledCount, sizeScaledCount } =
        await _applyChanges(app, quickAddApi, graph, Logger, CTRL);

    // ── 6. PROCESAR RECURRENCIAS ──────────────────────────────────────────
    Logger.info(CTRL, "Procesando recurrencias.");
    const recurrencesCreated = await _processRecurrences(
        app, graph, Settings, TaskEvaluator.recurrenceMotor, FileClassMapper, Logger, CTRL
    );

    // ── FEEDBACK CONSOLIDADO ──────────────────────────────────────────────
    const hasChanges = updatedCount > 0 || recurrencesCreated > 0;

    Logger.info(CTRL, "Sincronización completada.", {
        updatedCount, archivedCount, priorityScaledCount, sizeScaledCount, recurrencesCreated
    });

    if (hasChanges) {
        new Notice(Messages.get("SYNC_TASK_COMPLETE", {
            updated:        updatedCount,
            archived:       archivedCount,
            priorityScaled: priorityScaledCount,
            recurrences:    recurrencesCreated,
            sizeScaled:     sizeScaledCount,
        }));
    } else {
        new Notice(Messages.get("SYNC_TASK_UP_TO_DATE"));
    }
};

// =============================================================================
// CONSTRUCCIÓN DEL GRAFO — I/O puro, sin lógica de evaluación
// =============================================================================

function _buildGraph(app, allTasks, Utils, Logger, CTRL) {
    const graph = {};

    for (const file of allTasks) {
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
                // Campos de mutación — null = sin cambio, valor = cambio pendiente
                newStatus    : null,
                newPriority  : null,
                newSize      : null,
                newEndDate   : undefined,
                newArchived  : null,
            };
        } catch (err) {
            Logger.error(CTRL, `Error leyendo tarea "${file.basename}" del vault.`, { error: err.message });
        }
    }

    // Construir aristas inversas (children, previousTasks)
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

// =============================================================================
// DETECCIÓN DE CICLOS — DFS Coloring (blanco/gris/negro)
// =============================================================================

function _detectCycles(graph, Logger, CTRL) {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color       = {};
    const cyclesFound = [];

    for (const k of Object.keys(graph)) color[k] = WHITE;

    function dfs(name, path) {
        color[name] = GRAY;
        path.push(name);

        for (const childName of (graph[name]?.children ?? [])) {
            if (color[childName] === GRAY) {
                const cycleStart = path.indexOf(childName);
                cyclesFound.push([...path.slice(cycleStart), childName].join(' → '));
                continue; // No lanzar excepción — continuar para detectar todos los ciclos
            }
            if (color[childName] === WHITE) dfs(childName, path);
        }

        path.pop();
        color[name] = BLACK;
    }

    for (const k of Object.keys(graph)) {
        if (color[k] === WHITE) dfs(k, []);
    }

    if (cyclesFound.length > 0) {
        Logger.warn(CTRL, `Se detectaron ${cyclesFound.length} ciclo(s) en el grafo de tareas.`, { cycles: cyclesFound });
        console.warn(
            `[${CTRL}] ⚠️ ${cyclesFound.length} ciclo(s) detectados en parentTask:\n` +
            cyclesFound.map((c, i) => `  ${i + 1}. ${c}`).join('\n')
        );
    }
}

// =============================================================================
// PERSISTENCIA — I/O puro, aplica los cambios calculados por el dominio
// =============================================================================

async function _applyChanges(app, quickAddApi, graph, Logger, CTRL) {
    let updatedCount        = 0;
    let archivedCount       = 0;
    let priorityScaledCount = 0;
    let sizeScaledCount     = 0;

    for (const node of Object.values(graph)) {
        const statusChanged   = node.newStatus   !== null      && node.newStatus   !== node.status;
        const endDateChanged  = node.newEndDate  !== undefined && node.newEndDate  !== node.endDate;
        const archivedChanged = node.newArchived !== null      && node.newArchived !== node.archived;
        const priorityChanged = node.newPriority !== null      && node.newPriority !== node.priority;
        const sizeChanged     = node.newSize     !== null      && node.newSize     !== node.size;

        if (!statusChanged && !endDateChanged && !archivedChanged && !priorityChanged && !sizeChanged) continue;

        // Try-catch individual por archivo — un fallo no aborta el resto del loop
        try {
            await app.fileManager.processFrontMatter(node.file, (fm) => {
                if (statusChanged)   fm.status   = node.newStatus;
                if (endDateChanged)  fm.endDate  = node.newEndDate ?? "";
                if (archivedChanged) fm.archived = node.newArchived;
                if (priorityChanged) { fm.priority = node.newPriority; priorityScaledCount++; }
                if (sizeChanged)     { fm.size     = node.newSize;     sizeScaledCount++;     }
            });
            updatedCount++;

            Logger.debug(CTRL, `Tarea actualizada: "${node.file.basename}".`, {
                statusChanged, priorityChanged, sizeChanged, archivedChanged
            });

            if (archivedChanged && node.newArchived === true) {
                await quickAddApi.executeChoice("Move By Archived", { value: node.file.path });
                archivedCount++;
            }
        } catch (err) {
            Logger.error(CTRL, `Error persistiendo cambios en "${node.file.basename}".`, { error: err.message });
        }
    }

    return { updatedCount, archivedCount, priorityScaledCount, sizeScaledCount };
}

// =============================================================================
// MOTOR DE I/O: CLONACIÓN DE RECURRENCIAS
// =============================================================================

async function _processRecurrences(app, graph, Settings, motor, FileClassMapper, Logger, CTRL) {
    let createdCount = 0;
    const today      = window.moment();
    const statusMap  = Settings.STATUS_MAP;

    for (const node of Object.values(graph)) {
        if (node.archived || !node.recurrence || node.nextRecurrenceCreated) continue;

        const currentStatus = node.newStatus !== null ? node.newStatus : node.status;

        if (!motor.shouldSpawnNext(currentStatus, node.deadlineDate, node.recurrence, node.size, statusMap.done)) {
            continue;
        }

        // Try-catch individual — un fallo no aborta el procesamiento de recurrencias
        try {
            const { newDeadline, newStart } = motor.calculateNextDates(
                node.deadlineDate, node.startDate, node.recurrence
            );

            const folderPath  = FileClassMapper.getFolder("task");
            const baseName    = node.file.basename.replace(Settings.DATE_SUFFIX_REGEX, "").trim();
            const newFileName = `${baseName} - ${window.moment(newDeadline, Settings.DATE_FORMAT_DATETIME).format(Settings.DATE_FORMAT_ISO)}`;
            const newFilePath = `${folderPath}/${newFileName}.md`;

            if (await app.vault.adapter.exists(newFilePath)) continue;

            const originalContent = await app.vault.read(node.file);
            const newFile         = await app.vault.create(newFilePath, originalContent);

            await app.fileManager.processFrontMatter(newFile, (newFm) => {
                newFm.status                = statusMap.planned;
                newFm.startDate             = newStart;
                newFm.deadlineDate          = newDeadline;
                newFm.endDate               = "";
                newFm.createdDate           = today.format(Settings.DATE_FORMAT_DATETIME);
                newFm.nextRecurrenceCreated = false;
            });

            await app.fileManager.processFrontMatter(node.file, (oldFm) => {
                oldFm.nextRecurrenceCreated = true;
            });

            createdCount++;
            Logger.info(CTRL, `Recurrencia creada: "${newFileName}".`, { baseName, newDeadline });

        } catch (err) {
            Logger.error(CTRL, `Error clonando recurrencia de "${node.file.basename}".`, { error: err.message });
        }
    }

    return createdCount;
}