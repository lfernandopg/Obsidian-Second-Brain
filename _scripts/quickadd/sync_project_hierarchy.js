/**
 * sync_project_hierarchy.js
 *
 * Orquestador de sincronización de proyectos.
 */
module.exports = async (params) => {
    const { app } = params;

    // ── 0. BOOTSTRAP ──────────────────────────────────────────────────────
    customJS.SystemBootstrap.boot();

    if (!customJS?.FileClassMapper || !customJS?.Utils) {
        new Notice("❌ Error: customJS o sus módulos no están cargados.");
        return;
    }

    const { Utils, ProjectEvaluator } = customJS;
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
    // [FIX V-10] Caché compartido para no iterar el vault dos veces
    const fileCache = new Map();
    const projects  = _buildProjectsMap(app, Utils, fileCache);
    _mapTasksToProjects(app, projects, Utils, fileCache);

    // ── 3. EVALUAR ────────────────────────────────────────────────────────
    ProjectEvaluator.evaluate(projects);

    // ── 4. PERSISTIR CAMBIOS ──────────────────────────────────────────────
    const { updatedCount, archivedCount, priorityScaledCount } =
        await _applyChanges(app, quickAddApi, projects);

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

function _buildProjectsMap(app, Utils, fileCache) {
    const projects = {};

    // [FIX V-10] Pasar fileCache a getFilesByClass
    for (const file of Utils.getFilesByClass(app, 'project', fileCache)) {
        try {
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
                tasks        : [],
                newStatus    : null,
                newPriority  : null,
                newEndDate   : undefined,
                newArchived  : null,
            };
        } catch (err) {
            console.error(`[_buildProjectsMap] Error procesando "${file.basename}":`, err);
        }
    }

    return projects;
}

function _mapTasksToProjects(app, projects, Utils, fileCache) {
    // [FIX V-10] Pasar fileCache a getFilesByClass
    for (const file of Utils.getFilesByClass(app, 'task', fileCache)) {
        try {
            const fm = Utils.getFrontmatter(app, file);
            if (!fm) continue;

            for (const projectName of Utils.getLinks(fm.project)) {
                if (projects[projectName]) {
                    projects[projectName].tasks.push(fm.status);
                }
            }
        } catch (err) {
            console.error(`[_mapTasksToProjects] Error procesando tarea "${file.basename}":`, err);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCIA
// ─────────────────────────────────────────────────────────────────────────────

async function _applyChanges(app, quickAddApi, projects) {
    let updatedCount        = 0;
    let archivedCount       = 0;
    let priorityScaledCount = 0;

    for (const proj of Object.values(projects)) {
        const statusChanged   = proj.newStatus   !== null      && proj.newStatus   !== proj.status;
        const endDateChanged  = proj.newEndDate  !== undefined && proj.newEndDate  !== proj.endDate;
        const archivedChanged = proj.newArchived !== null      && proj.newArchived !== proj.archived;
        const priorityChanged = proj.newPriority !== null      && proj.newPriority !== proj.priority;

        if (!statusChanged && !endDateChanged && !archivedChanged && !priorityChanged) continue;

        // [FIX V-9] try-catch individual por proyecto.
        // Un fallo en processFrontMatter de un archivo no debe abortar
        // el resto del bucle de 50+ proyectos.
        try {
            await app.fileManager.processFrontMatter(proj.file, (fm) => {
                if (statusChanged)   fm.status   = proj.newStatus;
                if (endDateChanged)  fm.endDate  = proj.newEndDate ?? "";
                if (archivedChanged) fm.archived = proj.newArchived;
                if (priorityChanged) { fm.priority = proj.newPriority; priorityScaledCount++; }
            });
            updatedCount++;

            if (archivedChanged && proj.newArchived === true) {
                await quickAddApi.executeChoice("Move By Archived", { value: proj.file.path });
                archivedCount++;
            }
        } catch (err) {
            console.error(
                `[_applyChanges] Error persistiendo cambios en el proyecto "${proj.file.basename}":`, err
            );
        }
    }

    return { updatedCount, archivedCount, priorityScaledCount };
}