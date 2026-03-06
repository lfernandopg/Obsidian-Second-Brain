/**
 * sync_task_hierarchy.js
 *
 * Orquestador de sincronización de tareas.
 * Responsabilidades:
 *   1. Leer el vault y construir el grafo de tareas.
 *   2. Delegar la evaluación de estados a TaskEvaluator.
 *   3. Persistir los cambios al vault (frontmatter + mover archivos).
 *
 * La lógica de negocio vive en: _scripts/user/task_evaluator.js
 */
module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const { Utils, TaskEvaluator } = customJS;

    // ── 1. CONSTRUIR GRAFO ────────────────────────────────────────────────

    const allTasks = Utils.getFilesByClass(app, 'task');
    const graph = _buildGraph(app, allTasks, Utils);

    // ── 2. EVALUAR ────────────────────────────────────────────────────────

    const evaluator = new TaskEvaluator();
    evaluator.evaluate(graph);

    // ── 3. PERSISTIR CAMBIOS ──────────────────────────────────────────────

    const { updatedCount, archivedCount } = await _applyChanges(app, quickAddApi, graph);

    // ── FEEDBACK ──────────────────────────────────────────────────────────

    if (updatedCount > 0) {
        new Notice(`✅ ${updatedCount} tareas sincronizadas. (${archivedCount} archivadas).`);
    } else {
        new Notice(`👍 Todo el sistema está perfectamente sincronizado.`);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DEL GRAFO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construye el grafo de nodos de tareas con sus relaciones padre/hijo y
 * secuencias (previousTask / nextTask).
 *
 * Incluye tareas archivadas para respetar el histórico (una tarea completada
 * y archivada sigue siendo "done" a ojos de su padre).
 *
 * @param {App} app
 * @param {TFile[]} allTasks
 * @param {Utils} Utils
 * @returns {Object} graph - Mapa { basename: TaskNode }
 */
function _buildGraph(app, allTasks, Utils) {
    const graph = {};

    // Primera pasada: crear todos los nodos
    for (const file of allTasks) {
        const fm = Utils.getFrontmatter(app, file);
        if (!fm) continue;

        graph[file.basename] = {
            file,
            status      : fm.status,
            endDate     : fm.endDate,
            archived    : fm.archived === true,
            parentTasks : Utils.getLinks(fm.parentTask),
            nextTasks   : Utils.getLinks(fm.nextTask),
            children    : [],       // hijos directos (populated below)
            previousTasks: [],      // tareas que deben terminar antes (populated below)
            // Campos de resultado (null/undefined = sin cambio)
            newStatus   : null,
            newEndDate  : undefined,
            newArchived : null,
        };
    }

    // Segunda pasada: poblar relaciones inversas
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

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCIA
// ─────────────────────────────────────────────────────────────────────────────

async function _applyChanges(app, quickAddApi, graph) {
    let updatedCount = 0;
    let archivedCount = 0;

    for (const node of Object.values(graph)) {
        const statusChanged   = node.newStatus   !== null      && node.newStatus   !== node.status;
        const endDateChanged  = node.newEndDate  !== undefined && node.newEndDate  !== node.endDate;
        const archivedChanged = node.newArchived !== null      && node.newArchived !== node.archived;

        if (!statusChanged && !endDateChanged && !archivedChanged) continue;

        await app.fileManager.processFrontMatter(node.file, (fm) => {
            if (statusChanged)   fm.status   = node.newStatus;
            if (endDateChanged)  fm.endDate  = node.newEndDate ?? "";
            if (archivedChanged) fm.archived = node.newArchived;
        });
        updatedCount++;

        if (archivedChanged && node.newArchived === true) {
            await quickAddApi.executeChoice("Move By Archived", { value: node.file.path });
            archivedCount++;
        }
    }

    return { updatedCount, archivedCount };
}