// create_and_link.js
module.exports = async (params) => {
  //const { app, quickAddApi, variables } = params;
  const { quickAddApi } = params;

  await quickAddApi.executeChoice("Link To Active File", { create : true });

};


// create_by_template.js
module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;

    const { FileClassMapper, Utils } = customJS;

    let { fileClass } = variables

    if (!fileClass || !FileClassMapper.FILE_CLASS_LIST.includes(fileClass)) {
      const capitalizeNames = Object.values(FileClassMapper.CAPITALIZE_NAMES_MAP);
      const fileClassList = Object.keys(FileClassMapper.CAPITALIZE_NAMES_MAP);
      
      fileClass = await quickAddApi.suggester(
        capitalizeNames,
        fileClassList
      );
    }
    
    fileName = await quickAddApi.inputPrompt(`Create new ${fileClass}`);
    if (!fileName) throw new Error(`❌ No name was provided for the ${fileClass}`);
    fileName = fileName.trim();
    
    const templateFilePath = FileClassMapper.getTemplateFilePathMap(fileClass);
    const fileToCreatePath = `${FileClassMapper.getFolder(fileClass)}/${fileName}.md`;

  try {
    // Leer el contenido del archivo de plantilla
    const templateFile = app.vault.getAbstractFileByPath(templateFilePath);
    if (!templateFile) {
      throw new Error(`❌ Template not found at ${templateFilePath}`);
    }
    const templateContent = await app.vault.read(templateFile);

    // Crear la nueva nota con el contenido de la plantilla
    const newFile = await app.vault.create(fileToCreatePath, templateContent);

    
    // Mostrar notificación de éxito
    new Notice(`✅ Successfully ${fileClass} created at ${fileToCreatePath}`);
    // Abrir la nueva nota en una nueva ventana
    const newLeaf = app.workspace.getLeaf(true);
    await newLeaf.openFile(newFile);

    await Utils.sleep(500);

    if (variables.result) {
      variables.result.createdFilePath = fileToCreatePath;
    }
  } catch (error) {
    // Manejar errores, como plantilla no encontrada o problemas al crear la nota
    throw new Error(`❌ Failed to create note: ${error.message}`);
  }
};

// link_to_active_file.js
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

// move_by_archived.js
module.exports = async (params) => {
    const { app, variables} = params;
    
    const fileName = variables.value;

    const file = fileName
        ? app.vault.getAbstractFileByPath(fileName) 
        : app.workspace.getActiveFile();

    if (!file) return;

    const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
    const archived = metadata?.archived;
    if (archived == null) return;

    const { FileClassMapper } = customJS;

    const fileClass = metadata?.fileClass;

    if (!fileClass || !FileClassMapper.FILE_CLASS_LIST.includes(fileClass)) return;

    const baseFolder = FileClassMapper.getFolder(fileClass);

    const archivedFolder = FileClassMapper.getArchivedFolder(fileClass);

    const targetFolder = archived
        ? archivedFolder
        : baseFolder;

    const newPath = `${targetFolder}/${file.basename}.md`;

    if (file.path !== newPath) {
        await app.vault.rename(file, newPath);
        new Notice(`📦 ${file.basename} was moved to: ${targetFolder}`);
    }
};

//update_frontmatter.js
module.exports = async (params) => {
    const { app, variables } = params;

    const { filePath, properties } =  variables ;

    new Notice(filePath);
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file) throw new Error(`Not found file: ${filePath}`);

    try {
        await app.fileManager.processFrontMatter(file, (frontmatter) => {
            for (const key in properties) {
                
                if (Object.hasOwnProperty.call(properties, key)) {
                    const value = properties[key];
                    
                    // Si la propiedad ya existe y es un array, añade el nuevo valor.
                    if (Array.isArray(frontmatter[key])) {
                        // Evitar duplicados
                        if (!frontmatter[key].includes(value)) {
                            frontmatter[key].push(value);
                        }
                    } else {
                        // Si no, simplemente asigna el valor.
                        new Notice(key)
                        new Notice(value)
                        frontmatter[key] = value;
                    }
                }
            }
        });
        new Notice(`✅ Frontmatter of '${file.basename}' successfully updated.`);

    } catch (error) {
        throw new Error(`Error updating frontmatter: ${error.message}`);
    }
};