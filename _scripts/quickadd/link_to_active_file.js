module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;

    const { FileClassMapper, Utils } = customJS;

    // 1. Obtener contexto del archivo activo
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice("❌ No active file.");
        return;
    }

    const activeFileCache = app.metadataCache.getFileCache(activeFile);
    const activeFileClass = activeFileCache?.frontmatter?.fileClass;

    if (!activeFileClass) {
        new Notice(`❌ No 'fileClass' found in ${activeFile.basename}.`);
        return;
    }

    // 2. Obtener relaciones posibles desde el Mapper
    const possibleRelations = FileClassMapper.getRelations(activeFileClass);

    if (possibleRelations.length === 0) {
        new Notice(`🤷‍♂️ No defined relations for fileClass '${activeFileClass}'.`);
        return;
    }

    // 3. Preguntar al usuario qué desea crear
    const selectedRelation = await quickAddApi.suggester(
        (relation) => `${FileClassMapper.getRelationToShow(relation.relationToShow)}`, // Texto a mostrar
        possibleRelations // Array de objetos de relación
    );

    if (!selectedRelation) return; // El usuario canceló

    const { fileClassRelation, propertyToUpdate, linkDirection } = selectedRelation;
    let relatedFilePath;
    let relatedFile;

    if (variables && variables.create === true) {
        const creationVars = {
            fileClass: fileClassRelation,
            result: { createdFilePath: null }
        };
        await quickAddApi.executeChoice("Create By Template", creationVars);

        const createdFilePath = creationVars.result.createdFilePath;
        if (!createdFilePath) {
            throw new Error(`❌ Failed to create ${fileClassRelation}.`);
        }
        const createdFile = app.vault.getAbstractFileByPath(createdFilePath);
        relatedFilePath = createdFilePath;
        relatedFile = createdFile;
    } else {
        const selectedFile = await quickAddApi.suggester(
            (file) => file.basename,
            app.vault.getMarkdownFiles().filter((file) => {

                const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
                const fileClass = metadata?.fileClass;
                const archived = metadata?.archived;
                return fileClass === fileClassRelation && !archived && file.path !== activeFile.path
                && file.path !== `${FileClassMapper.getTemplateFilePathMap(fileClassRelation)}`;
            })
        );
        if (!selectedFile) return;
        relatedFile = selectedFile;
        relatedFilePath = selectedFile.path;
    }

    // 5. Preparar y ejecutar el enlazado según la dirección
    let targetFilePath;
    let propertiesToUpdate;
    let linkText;
    let targetFileName;

    if (linkDirection === 'inward') {
        // La nota NUEVA apunta a la ACTIVA
        targetFilePath = relatedFilePath;
        linkText = `[[${activeFile.basename}]]`;
        propertiesToUpdate = { [propertyToUpdate]: linkText };
        targetFileName = activeFile.basename;

    } else { // 'outward'
        // La nota ACTIVA apunta a la NUEVA
        targetFilePath = activeFile.path;
        linkText = `[[${relatedFile.basename}]]`;
        propertiesToUpdate = { [propertyToUpdate]: linkText };
        targetFileName = relatedFile.basename;
    }

    await Utils.sleep(500);
    await quickAddApi.executeChoice("Update Frontmatter", {
        filePath: targetFilePath,
        properties: propertiesToUpdate
    });
    
    new Notice(`🔗 Linked ${targetFileName} with ${linkDirection === 'inward' ? relatedFile.basename : activeFile.basename}`);
};