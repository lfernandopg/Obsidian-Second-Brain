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