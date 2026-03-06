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

    // Conjunto de basenames de proyectos que hay que propagar
    const projectsToProcess = new Set();
    // Mapa de basename → TFile para todos los descendientes a procesar
    const filesToProcess    = new Map(); // Map<basename, TFile>

    // Nivel 1 – Área → sus Proyectos
    if (fileClass === 'area') {
        for (const p of allProjects) {
            const pfm = Utils.getFrontmatter(app, p);
            if (Utils.getLinks(pfm?.area).includes(targetFile.basename)) {
                filesToProcess.set(p.basename, p);
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
                filesToProcess.set(t.basename, t);
                tasksToProcess.add(t.basename);
            }
        }
    }

    // Nivel 3 – Tarea → Subtareas
    // [FIX V-11] Se usa un Set<string> de basenames YA VISITADOS separado del
    // Map de archivos a procesar. En el código anterior se usaba `filesToProcess.has(t)`
    // donde `t` es un TFile — esto funciona solo si la referencia de objeto es idéntica,
    // lo cual puede fallar. Además, el BFS añadía basenames a la cola sin garantía
    // de que todos los ancestros con el mismo basename hubieran sido marcados,
    // pudiendo entrar en bucle infinito ante ciclos de parentTask.
    if (fileClass === 'task') tasksToProcess.add(targetFile.basename);

    const visitedBasenames = new Set(tasksToProcess); // [FIX V-11] Set de basenames visitados
    const queue = Array.from(tasksToProcess);

    while (queue.length > 0) {
        const currentName = queue.shift();

        for (const t of allTasks) {
            const tfm = Utils.getFrontmatter(app, t);
            // [FIX V-11] Guardias: ya procesado por basename O la referencia ya está en el mapa
            if (visitedBasenames.has(t.basename)) continue;
            if (Utils.getLinks(tfm?.parentTask).includes(currentName)) {
                filesToProcess.set(t.basename, t);
                visitedBasenames.add(t.basename); // [FIX V-11] Marcar antes de encolar
                queue.push(t.basename);
            }
        }
    }

    // ── APLICAR CAMBIOS A LA DESCENDENCIA ────────────────────────────────

    for (const childFile of filesToProcess.values()) {
        const childFm       = Utils.getFrontmatter(app, childFile);
        const childClass    = childFm?.fileClass;
        const childArchived = childFm?.archived === true;

        // Solo actuar si el estado de archivo difiere del padre
        if (childArchived === isArchived) continue;

        try {
            await app.fileManager.processFrontMatter(childFile, (cfm) => {
                cfm.archived = isArchived;
            });

            if (await _moveFile(app, childFile, childClass, isArchived, FileClassMapper, Utils)) {
                movedCount++;
            }
        } catch (err) {
            console.error(`[move_by_archived] Error propagando archived a "${childFile.basename}":`, err);
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