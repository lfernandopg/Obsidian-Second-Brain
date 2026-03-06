/**
 * link_to_active_file.js
 *
 * Permite crear o enlazar una nota relacionada con el archivo activo,
 * actualizando las propiedades de frontmatter correspondientes en ambas notas.
 *
 * Flujos posibles:
 *   - variables.create === true  → crea una nueva nota y la enlaza.
 *   - variables.create falsy     → muestra selector de notas existentes.
 */
module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;

    if (!customJS?.FileClassMapper || !customJS?.Utils) {
        new Notice("❌ Error: customJS o sus dependencias no están cargadas.");
        return;
    }

    const { FileClassMapper, Utils } = customJS;

    // ── CONTEXTO DEL ARCHIVO ACTIVO ───────────────────────────────────────

    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice("❌ No hay ningún archivo activo.");
        return;
    }

    const activeFileFm    = Utils.getFrontmatter(app, activeFile);
    const activeFileClass = activeFileFm?.fileClass;

    if (!activeFileClass) {
        new Notice(`❌ '${activeFile.basename}' no tiene un 'fileClass' definido.`);
        return;
    }

    // ── SELECCIONAR TIPO DE RELACIÓN ──────────────────────────────────────

    const possibleRelations = FileClassMapper.getRelations(activeFileClass);
    if (!Array.isArray(possibleRelations) || possibleRelations.length === 0) {
        new Notice(`🤷‍♂️ No hay relaciones definidas para '${activeFileClass}'.`);
        return;
    }

    const relationLabels  = possibleRelations.map(r => FileClassMapper.getRelationToShow(r.relationToShow));
    const selectedRelation = await quickAddApi.suggester(relationLabels, possibleRelations);
    if (!selectedRelation) return;

    const { fileClassRelation, propertyToUpdate, linkDirection } = selectedRelation;

    // ── OBTENER EL ARCHIVO RELACIONADO ────────────────────────────────────

    let relatedFile;

    if (variables?.create === true) {
        relatedFile = await _createRelatedFile(quickAddApi, activeFile, activeFileFm, fileClassRelation);
    } else {
        relatedFile = await _selectExistingFile(app, quickAddApi, activeFile, fileClassRelation, FileClassMapper);
    }

    if (!relatedFile) return;

    // ── ENLAZAR ───────────────────────────────────────────────────────────

    await Utils.sleep(500);

    const isInward        = linkDirection === 'inward';
    const targetFilePath  = isInward ? relatedFile.path   : activeFile.path;
    const linkText        = isInward ? `[[${activeFile.basename}]]` : `[[${relatedFile.basename}]]`;

    await quickAddApi.executeChoice("Update Frontmatter", {
        filePath   : targetFilePath,
        properties : { [propertyToUpdate]: linkText },
    });

    const from = isInward ? relatedFile.basename : activeFile.basename;
    const to   = isInward ? activeFile.basename  : relatedFile.basename;
    new Notice(`🔗 Enlazado: ${from} ➡️ ${to}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS PRIVADOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Invoca "Create By Template" para crear una nueva nota del tipo indicado,
 * heredando las propiedades `area` y `project` del archivo padre si existen.
 *
 * @returns {TFile|null} El archivo creado, o null si el usuario canceló.
 */
async function _createRelatedFile(quickAddApi, activeFile, activeFileFm, fileClassRelation) {
    const inheritProps = {};
    if (activeFileFm?.area)    inheritProps.area    = activeFileFm.area;
    if (activeFileFm?.project) inheritProps.project = activeFileFm.project;

    const creationVars = {
        fileClass         : fileClassRelation,
        result            : { createdFilePath: null },
        inheritProperties : inheritProps,
    };

    await quickAddApi.executeChoice("Create By Template", creationVars);

    const createdPath = creationVars.result?.createdFilePath;
    if (!createdPath) return null;

    const file = app.vault.getAbstractFileByPath(createdPath);
    if (!file) throw new Error(`No se encontró el archivo recién creado: ${createdPath}`);
    return file;
}

/**
 * Muestra un selector de archivos existentes del tipo indicado.
 *
 * @returns {TFile|null} El archivo seleccionado, o null si el usuario canceló.
 */
async function _selectExistingFile(app, quickAddApi, activeFile, fileClassRelation, FileClassMapper) {
    const templatePath = FileClassMapper.getTemplateFilePathMap(fileClassRelation);

    const validFiles = app.vault.getMarkdownFiles().filter(file => {
        const fm       = app.metadataCache.getFileCache(file)?.frontmatter;
        const archived = fm?.archived;
        return fm?.fileClass === fileClassRelation
            && !archived
            && file.path !== activeFile.path
            && file.path !== templatePath;
    });

    if (validFiles.length === 0) {
        new Notice(`⚠️ No hay archivos de tipo '${fileClassRelation}' disponibles.`);
        return null;
    }

    return quickAddApi.suggester(validFiles.map(f => f.basename), validFiles);
}