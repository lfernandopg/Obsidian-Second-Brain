/**
 * sync_project_hierarchy.js
 *
 * Orquestador de sincronización de proyectos.
 * Responsabilidades:
 *   1. Sincronizar tareas (delegando a "Sync Task Hierarchy").
 *   2. Leer proyectos y tareas del vault.
 *   3. Delegar la evaluación a ProjectEvaluator.
 *   4. Persistir los cambios al vault.
 *
 * La lógica de negocio vive en: _scripts/user/project_evaluator.js
 */
module.exports = async (params) => {
    const { app } = params;

    if (!customJS?.FileClassMapper || !customJS?.Utils) {
        new Notice("❌ Error: customJS o sus módulos no están cargados.");
        return;
    }

    const { Utils } = customJS;
    const quickAddApi = app.plugins.plugins.quickadd.api;

    // ── 1. SINCRONIZAR TAREAS PRIMERO ─────────────────────────────────────
    new Notice("⏳ Sincronizando jerarquía de tareas...");
    try {
        await quickAddApi.executeChoice("Sync Task Hierarchy");
        // Pausa para que Obsidian actualice su metadataCache tras los cambios
        await Utils.sleep(800);
    } catch (error) {
        console.error("Error al sincronizar tareas:", error);
        new Notice("❌ Error en 'Sync Task Hierarchy'. Revisa la consola.");
        return;
    }

    // ── 2. CONSTRUIR MAPA DE PROYECTOS Y TAREAS ───────────────────────────

    const projects = _buildProjectsMap(app, Utils);
    _mapTasksToProjects(app, projects, Utils);

    // ── 3. EVALUAR ────────────────────────────────────────────────────────

    const { ProjectEvaluator } = customJS;
    const evaluator = new ProjectEvaluator();
    evaluator.evaluate(projects);

    // ── 4. PERSISTIR CAMBIOS ──────────────────────────────────────────────

    const { updatedCount, archivedCount, priorityScaledCount } = await _applyChanges(app, quickAddApi, projects);

    // ── FEEDBACK ──────────────────────────────────────────────────────────

    if (updatedCount > 0) {
        new Notice(`✅ ${updatedCount} proyectos sincronizados. (${archivedCount} archivados).`);
        new Notice(`🔥 ${priorityScaledCount} proyectos escalaron su prioridad.`);
    } else {
        new Notice(`👍 Los proyectos están perfectamente sincronizados.`);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DEL MAPA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lee todos los archivos con fileClass "project" y construye un mapa de nodos.
 * @returns {Object} projects - Mapa { basename: ProjectNode }
 */
function _buildProjectsMap(app, Utils) {
    const projects = {};

    for (const file of Utils.getFilesByClass(app, 'project')) {
        const fm = Utils.getFrontmatter(app, file);
        if (!fm) continue;

        projects[file.basename] = {
            file,
            status       : fm.status,
            priority     : fm.priority,
            size         : fm.size,
            startDate    : fm.startDate,
            deadlineDate : fm.deadlineDate,
            endDate      : fm.endDate,
            archived     : fm.archived === true,
            tasks        : [],      // Se rellena en _mapTasksToProjects
            // Campos de resultado
            newStatus    : null,
            newPriority  : null,
            newEndDate   : undefined,
            newArchived  : null,
        };
    }

    return projects;
}

/**
 * Lee todas las tareas del vault y añade sus estados al proyecto correspondiente.
 * Usa el metadataCache actualizado (tras haber ejecutado Sync Task Hierarchy).
 */
function _mapTasksToProjects(app, projects, Utils) {
    for (const file of Utils.getFilesByClass(app, 'task')) {
        const fm = Utils.getFrontmatter(app, file);
        if (!fm) continue;

        for (const projectName of Utils.getLinks(fm.project)) {
            if (projects[projectName]) {
                projects[projectName].tasks.push(fm.status);
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCIA
// ─────────────────────────────────────────────────────────────────────────────

async function _applyChanges(app, quickAddApi, projects) {
    let updatedCount = 0;
    let archivedCount = 0;
    let priorityScaledCount = 0; // <-- NUEVO

    for (const proj of Object.values(projects)) {
        const statusChanged   = proj.newStatus   !== null      && proj.newStatus   !== proj.status;
        const endDateChanged  = proj.newEndDate  !== undefined && proj.newEndDate  !== proj.endDate;
        const archivedChanged = proj.newArchived !== null      && proj.newArchived !== proj.archived;
        const priorityChanged = proj.newPriority !== null      && proj.newPriority !== proj.priority; // <-- NUEVO

        if (!statusChanged && !endDateChanged && !archivedChanged && !priorityChanged) continue;

        await app.fileManager.processFrontMatter(proj.file, (fm) => {
            if (statusChanged)   fm.status   = proj.newStatus;
            if (endDateChanged)  fm.endDate  = proj.newEndDate ?? "";
            if (archivedChanged) fm.archived = proj.newArchived;
            if (priorityChanged) { // <-- NUEVO
                fm.priority = proj.newPriority;
                priorityScaledCount++;
            }
        });
        updatedCount++;

        if (archivedChanged && proj.newArchived === true) {
            await quickAddApi.executeChoice("Move By Archived", { value: proj.file.path });
            archivedCount++;
        }
    }

    return { updatedCount, archivedCount, priorityScaledCount };
}