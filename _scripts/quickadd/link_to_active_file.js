// ============================================================
// link_to_active_file.js
// ============================================================
/**
 * Enlaza el archivo activo con una nota relacionada.
 */
module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;
    const CTRL = "LinkToActiveFile";

    try { customJS.SystemBootstrap.boot(); } catch (err) {
        new Notice(`❌ Error crítico: ${err.message}`); return;
    }

    const { FileClassMapper, Utils, Messages, Logger, Settings } = customJS;

    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) { new Notice(Messages.get("LINK_NO_ACTIVE_FILE")); return; }

    const activeFileFm    = Utils.getFrontmatter(app, activeFile);
    const activeFileClass = activeFileFm?.fileClass;

    if (!activeFileClass) {
        new Notice(Messages.get("LINK_NO_FILECLASS", activeFile.basename)); return;
    }

    const possibleRelations = FileClassMapper.getRelations(activeFileClass);
    if (!Array.isArray(possibleRelations) || possibleRelations.length === 0) {
        new Notice(Messages.get("LINK_NO_RELATIONS", activeFileClass)); return;
    }

    const relationLabels   = possibleRelations.map(r => FileClassMapper.getRelationToShow(r.relationToShow));
    const selectedRelation = await quickAddApi.suggester(relationLabels, possibleRelations);
    if (!selectedRelation) return;

    const { fileClassRelation, propertyToUpdate, linkDirection } = selectedRelation;

    let relatedFile;
    if (variables?.create === true) {
        relatedFile = await _createRelatedFile(quickAddApi, activeFile, activeFileFm, fileClassRelation);
    } else {
        relatedFile = await _selectExistingFile(app, quickAddApi, activeFile, fileClassRelation, FileClassMapper);
    }
    if (!relatedFile) return;

    await Utils.sleep(Settings.SLEEP_AFTER_FILE_OP);

    const isInward       = linkDirection === 'inward';
    const targetFilePath = isInward ? relatedFile.path   : activeFile.path;
    const linkText       = isInward ? `[[${activeFile.basename}]]` : `[[${relatedFile.basename}]]`;

    await quickAddApi.executeChoice("Update Frontmatter", {
        filePath  : targetFilePath,
        properties: { [propertyToUpdate]: linkText },
    });

    const from = isInward ? relatedFile.basename : activeFile.basename;
    const to   = isInward ? activeFile.basename  : relatedFile.basename;

    Logger.info(CTRL, `Enlace creado: "${from}" → "${to}".`, { propertyToUpdate, linkDirection });
    new Notice(Messages.get("LINK_SUCCESS", from, to));
};

async function _createRelatedFile(quickAddApi, activeFile, activeFileFm, fileClassRelation) {
    const inheritProps = {};
    if (activeFileFm?.area)    inheritProps.area    = activeFileFm.area;
    if (activeFileFm?.project) inheritProps.project = activeFileFm.project;

    const creationVars = {
        fileClass        : fileClassRelation,
        result           : { createdFilePath: null },
        inheritProperties: inheritProps,
    };

    await quickAddApi.executeChoice("Create By Template", creationVars);

    const createdPath = creationVars.result?.createdFilePath;
    if (!createdPath) return null;

    const file = app.vault.getAbstractFileByPath(createdPath);
    if (!file) throw new Error(`No se encontró el archivo recién creado: ${createdPath}`);
    return file;
}

async function _selectExistingFile(app, quickAddApi, activeFile, fileClassRelation, FileClassMapper) {
    const templatePath = FileClassMapper.getTemplatePath(fileClassRelation);
    const { Messages } = customJS;

    const validFiles = app.vault.getMarkdownFiles().filter(file => {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        return fm?.fileClass === fileClassRelation
            && !fm?.archived
            && file.path !== activeFile.path
            && file.path !== templatePath;
    });

    if (validFiles.length === 0) {
        new Notice(Messages.get("LINK_NO_FILES_AVAILABLE", fileClassRelation));
        return null;
    }

    return quickAddApi.suggester(validFiles.map(f => f.basename), validFiles);
}