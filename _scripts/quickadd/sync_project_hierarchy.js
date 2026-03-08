/**
 * sync_project_hierarchy.js
 * Capa de Infraestructura / Controlador
 *
 * Responsabilidades:
 *   1. Boot del sistema
 *   2. Sincronizar tareas primero (delegando a la macro de tareas)
 *   3. Leer el vault y construir el mapa de proyectos en memoria
 *   4. Pasar el mapa a ProjectEvaluator (dominio puro)
 *   5. Persistir los cambios calculados
 */
module.exports = async (params) => {
    const { app } = params;
    const CTRL    = "SyncProjectHierarchy";

    // ── 0. BOOTSTRAP ──────────────────────────────────────────────────────
    try {
        customJS.SystemBootstrap.boot();
    } catch (err) {
        new Notice(customJS?.Messages?.get("BOOTSTRAP_BOOT_ERROR", err.message) ?? `❌ Error crítico: ${err.message}`);
        return;
    }

    const { Utils, ProjectEvaluator, Messages, Logger, Settings } = customJS;
    const quickAddApi = app.plugins.plugins.quickadd.api;

    Logger.info(CTRL, "Iniciando sincronización de proyectos.");
    new Notice(Messages.get("SYNC_PROJECT_START"));

    // ── 1. SINCRONIZAR TAREAS PRIMERO ─────────────────────────────────────
    try {
        await quickAddApi.executeChoice("Sync Task Hierarchy");
        // Pausa para que Obsidian actualice su metadataCache tras los cambios
        await Utils.sleep(Settings.SLEEP_AFTER_SYNC);
    } catch (err) {
        Logger.error(CTRL, "Error al ejecutar 'Sync Task Hierarchy'.", { error: err.message });
        new Notice(Messages.get("SYNC_TASK_ERROR"));
        return;
    }

    // ── 2. CONSTRUIR MAPA DE PROYECTOS Y TAREAS ───────────────────────────
    const fileCache = new Map(); // Caché compartido para toda la ejecución
    const projects  = _buildProjectsMap(app, Utils, fileCache, Logger, CTRL);
    _mapTasksToProjects(app, projects, Utils, fileCache, Logger, CTRL);

    Logger.info(CTRL, "Mapa de proyectos construido.", {
        projectCount: Object.keys(projects).length
    });

    // ── 3. EVALUAR ────────────────────────────────────────────────────────
    Logger.info(CTRL, "Ejecutando evaluación de dominio (ProjectEvaluator).");
    ProjectEvaluator.evaluate(projects);

    // ── 4. PERSISTIR CAMBIOS ──────────────────────────────────────────────
    Logger.info(CTRL, "Persistiendo cambios en el vault.");
    const { updatedCount, archivedCount, priorityScaledCount } =
        await _applyChanges(app, quickAddApi, projects, Logger, CTRL);

    // ── FEEDBACK ──────────────────────────────────────────────────────────
    Logger.info(CTRL, "Sincronización de proyectos completada.", {
        updatedCount, archivedCount, priorityScaledCount
    });

    if (updatedCount > 0) {
        new Notice(Messages.get("SYNC_PROJECT_COMPLETE", {
            updated:        updatedCount,
            archived:       archivedCount,
            priorityScaled: priorityScaledCount,
        }));
    } else {
        new Notice(Messages.get("SYNC_PROJECT_UP_TO_DATE"));
    }
};

// =============================================================================
// CONSTRUCCIÓN DEL MAPA — I/O puro
// =============================================================================

function _buildProjectsMap(app, Utils, fileCache, Logger, CTRL) {
    const projects = {};

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
            Logger.error(CTRL, `Error leyendo proyecto "${file.basename}" del vault.`, { error: err.message });
        }
    }

    return projects;
}

function _mapTasksToProjects(app, projects, Utils, fileCache, Logger, CTRL) {
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
            Logger.warn(CTRL, `Error mapeando tarea "${file.basename}" a proyectos.`, { error: err.message });
        }
    }
}

// =============================================================================
// PERSISTENCIA — I/O puro
// =============================================================================

async function _applyChanges(app, quickAddApi, projects, Logger, CTRL) {
    let updatedCount        = 0;
    let archivedCount       = 0;
    let priorityScaledCount = 0;

    for (const proj of Object.values(projects)) {
        const statusChanged   = proj.newStatus   !== null      && proj.newStatus   !== proj.status;
        const endDateChanged  = proj.newEndDate  !== undefined && proj.newEndDate  !== proj.endDate;
        const archivedChanged = proj.newArchived !== null      && proj.newArchived !== proj.archived;
        const priorityChanged = proj.newPriority !== null      && proj.newPriority !== proj.priority;

        if (!statusChanged && !endDateChanged && !archivedChanged && !priorityChanged) continue;

        // Try-catch individual — un fallo no aborta el resto del loop
        try {
            await app.fileManager.processFrontMatter(proj.file, (fm) => {
                if (statusChanged)   fm.status   = proj.newStatus;
                if (endDateChanged)  fm.endDate  = proj.newEndDate ?? "";
                if (archivedChanged) fm.archived = proj.newArchived;
                if (priorityChanged) { fm.priority = proj.newPriority; priorityScaledCount++; }
            });
            updatedCount++;

            Logger.debug(CTRL, `Proyecto actualizado: "${proj.file.basename}".`, {
                statusChanged, priorityChanged, archivedChanged
            });

            if (archivedChanged && proj.newArchived === true) {
                await quickAddApi.executeChoice("Move By Archived", { value: proj.file.path });
                archivedCount++;
            }
        } catch (err) {
            Logger.error(CTRL, `Error persistiendo cambios en proyecto "${proj.file.basename}".`, { error: err.message });
        }
    }

    return { updatedCount, archivedCount, priorityScaledCount };
}