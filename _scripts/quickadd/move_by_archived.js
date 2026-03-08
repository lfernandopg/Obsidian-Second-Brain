
// ============================================================
// move_by_archived.js
// ============================================================
/**
 * Mueve el archivo activo (o el indicado por variables.value) según
 * su campo `archived`. Propaga el cambio en cascada a descendientes.
 */
module.exports = async (params) => {
    const { app, variables } = params;
    const CTRL = "MoveByArchived";

    try { customJS.SystemBootstrap.boot(); } catch (err) {
        new Notice(`❌ Error crítico: ${err.message}`); return;
    }

    const { FileClassMapper, Utils, Messages, Logger } = customJS;

    const targetFile = variables?.value
        ? app.vault.getAbstractFileByPath(variables.value)
        : app.workspace.getActiveFile();

    if (!targetFile) return;

    const fm         = Utils.getFrontmatter(app, targetFile);
    const isArchived = fm?.archived === true;
    const fileClass  = fm?.fileClass;

    if (fm?.archived == null || !fileClass) return;

    Logger.info(CTRL, `Moviendo "${targetFile.basename}".`, { isArchived, fileClass });

    let movedCount = 0;
    if (await _moveFile(app, targetFile, fileClass, isArchived, FileClassMapper, Utils)) movedCount++;

    // ── PROPAGACIÓN EN CASCADA ────────────────────────────────────────────
    const allProjects = Utils.getFilesByClass(app, 'project');
    const allTasks    = Utils.getFilesByClass(app, 'task');

    const projectsToProcess = new Set();
    const filesToProcess    = new Map();

    if (fileClass === 'area') {
        for (const p of allProjects) {
            const pfm = Utils.getFrontmatter(app, p);
            if (Utils.getLinks(pfm?.area).includes(targetFile.basename)) {
                filesToProcess.set(p.basename, p);
                projectsToProcess.add(p.basename);
            }
        }
    }

    if (fileClass === 'project') projectsToProcess.add(targetFile.basename);

    const tasksToProcess = new Set();
    if (projectsToProcess.size > 0) {
        for (const t of allTasks) {
            const tfm = Utils.getFrontmatter(app, t);
            if (Utils.getLinks(tfm?.project).some(pName => projectsToProcess.has(pName))) {
                filesToProcess.set(t.basename, t);
                tasksToProcess.add(t.basename);
            }
        }
    }

    if (fileClass === 'task') tasksToProcess.add(targetFile.basename);

    const visitedBasenames = new Set(tasksToProcess);
    const queue = Array.from(tasksToProcess);

    while (queue.length > 0) {
        const currentName = queue.shift();
        for (const t of allTasks) {
            const tfm = Utils.getFrontmatter(app, t);
            if (visitedBasenames.has(t.basename)) continue;
            if (Utils.getLinks(tfm?.parentTask).includes(currentName)) {
                filesToProcess.set(t.basename, t);
                visitedBasenames.add(t.basename);
                queue.push(t.basename);
            }
        }
    }

    Logger.info(CTRL, `Cascada: ${filesToProcess.size} descendientes a procesar.`);

    for (const childFile of filesToProcess.values()) {
        const childFm       = Utils.getFrontmatter(app, childFile);
        const childClass    = childFm?.fileClass;
        const childArchived = childFm?.archived === true;

        if (childArchived === isArchived) continue;

        try {
            await app.fileManager.processFrontMatter(childFile, (cfm) => {
                cfm.archived = isArchived;
            });

            if (await _moveFile(app, childFile, childClass, isArchived, FileClassMapper, Utils)) movedCount++;

        } catch (err) {
            Logger.error(CTRL, `Error propagando archived a "${childFile.basename}".`, { error: err.message });
        }
    }

    if (movedCount > 0) {
        const msg = isArchived
            ? Messages.get("MOVE_CASCADE_ARCHIVED", movedCount)
            : Messages.get("MOVE_CASCADE_RESTORED", movedCount);
        Logger.info(CTRL, msg);
        new Notice(msg);
    }
};

async function _moveFile(app, file, fileClass, isArchived, FileClassMapper, Utils) {
    const destFolder = isArchived
        ? FileClassMapper.getArchivedFolder(fileClass)
        : FileClassMapper.getFolder(fileClass);
    return Utils.moveFileSafe(app, file, destFolder);
}