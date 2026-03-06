/**
 * move_by_archived.js
 *
 * Mueve el archivo activo (o el indicado por variables.value) a la carpeta
 * de archivo o la principal según el estado de su campo `archived`.
 *
 * Si el archivo es un Área, Proyecto o Tarea, propaga el cambio en cascada
 * a todos sus descendientes (Área → Proyectos → Tareas → Subtareas).
 */
module.exports = async (params) => {
    const { app, variables } = params;
    const { FileClassMapper, Utils } = customJS;

    // ── OBTENER ARCHIVO OBJETIVO ──────────────────────────────────────────

    const targetFile = variables?.value
        ? app.vault.getAbstractFileByPath(variables.value)
        : app.workspace.getActiveFile();

    if (!targetFile) return;

    const fm        = Utils.getFrontmatter(app, targetFile);
    const isArchived = fm?.archived === true;
    const fileClass  = fm?.fileClass;

    // Sin datos suficientes para actuar
    if (fm?.archived == null || !fileClass) return;

    // ── MOVER EL ARCHIVO PRINCIPAL ────────────────────────────────────────

    let movedCount = 0;
    if (await _moveFile(app, targetFile, fileClass, isArchived, FileClassMapper, Utils)) {
        movedCount++;
    }

    // ── PROPAGACIÓN EN CASCADA ────────────────────────────────────────────

    const allProjects = Utils.getFilesByClass(app, 'project');
    const allTasks    = Utils.getFilesByClass(app, 'task');

    // Conjuntos de basenames que hay que archivar/recuperar
    const projectsToProcess = new Set();
    const filesToProcess    = new Set(); // Set<TFile>

    // Nivel 1 – Área → sus Proyectos
    if (fileClass === 'area') {
        for (const p of allProjects) {
            const pfm = Utils.getFrontmatter(app, p);
            if (Utils.getLinks(pfm?.area).includes(targetFile.basename)) {
                filesToProcess.add(p);
                projectsToProcess.add(p.basename);
            }
        }
    }

    // Nivel 2 – Proyecto → sus Tareas
    if (fileClass === 'project') projectsToProcess.add(targetFile.basename);

    const tasksToProcess = new Set();
    if (projectsToProcess.size > 0) {
        for (const t of allTasks) {
            const tfm = Utils.getFrontmatter(app, t);
            if (Utils.getLinks(tfm?.project).some(pName => projectsToProcess.has(pName))) {
                filesToProcess.add(t);
                tasksToProcess.add(t.basename);
            }
        }
    }

    // Nivel 3 – Tarea → Subtareas (búsqueda en anchura para profundidad arbitraria)
    if (fileClass === 'task') tasksToProcess.add(targetFile.basename);

    const queue = Array.from(tasksToProcess);
    while (queue.length > 0) {
        const currentName = queue.shift();
        for (const t of allTasks) {
            if (filesToProcess.has(t)) continue; // ya procesada
            const tfm = Utils.getFrontmatter(app, t);
            if (Utils.getLinks(tfm?.parentTask).includes(currentName)) {
                filesToProcess.add(t);
                queue.push(t.basename);
            }
        }
    }

    // ── APLICAR CAMBIOS A LA DESCENDENCIA ────────────────────────────────

    for (const childFile of filesToProcess) {
        const childFm       = Utils.getFrontmatter(app, childFile);
        const childClass    = childFm?.fileClass;
        const childArchived = childFm?.archived === true;

        // Solo actuar si el estado de archivo difiere del padre
        if (childArchived === isArchived) continue;

        await app.fileManager.processFrontMatter(childFile, (cfm) => {
            cfm.archived = isArchived;
        });

        if (await _moveFile(app, childFile, childClass, isArchived, FileClassMapper, Utils)) {
            movedCount++;
        }
    }

    // ── FEEDBACK ──────────────────────────────────────────────────────────

    if (movedCount > 0) {
        const msg = isArchived
            ? `📦 Cascada completada: ${movedCount} archivo(s) movido(s) al archivo.`
            : `📤 Cascada completada: ${movedCount} archivo(s) recuperado(s) a la bóveda principal.`;
        new Notice(msg);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER PRIVADO
// ─────────────────────────────────────────────────────────────────────────────

async function _moveFile(app, file, fileClass, isArchived, FileClassMapper, Utils) {
    const destFolder = isArchived
        ? FileClassMapper.getArchivedFolder(fileClass)
        : FileClassMapper.getFolder(fileClass);
    return Utils.moveFileSafe(app, file, destFolder);
}