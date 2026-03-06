module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;

    // 1. Blindaje Inicial
    if (!customJS || !customJS.FileClassMapper || !customJS.Utils) {
        new Notice("❌ Error: customJS o sus módulos no están cargados.");
        return;
    }

    const { FileClassMapper, Utils } = customJS;
    let fileClass = variables?.fileClass;

    // 2. Selección de FileClass
    if (!fileClass || !FileClassMapper.FILE_CLASS_LIST.includes(fileClass)) {
        const capitalizeNames = Object.values(FileClassMapper.CAPITALIZE_NAMES_MAP);
        const fileClassList = Object.keys(FileClassMapper.CAPITALIZE_NAMES_MAP);
        
        fileClass = await quickAddApi.suggester(capitalizeNames, fileClassList);
        
        if (!fileClass) return; 
    }
    
    // 3. Captura del nombre
    let fileName = await quickAddApi.inputPrompt(`Create new ${fileClass}`);
    if (!fileName) return; 

    // 4. Sanitización
    fileName = fileName.trim().replace(/[\\/:*?"<>|]/g, '');
    if (fileName.length === 0) {
        new Notice("❌ El nombre proporcionado contiene caracteres inválidos o está vacío.");
        return;
    }
    
    const templateFilePath = FileClassMapper.getTemplateFilePathMap(fileClass);
    const folderPath = FileClassMapper.getFolder(fileClass);
    const fileToCreatePath = `${folderPath}/${fileName}.md`;

    try {
        // 5. Validar plantilla
        const templateFile = app.vault.getAbstractFileByPath(templateFilePath);
        if (!templateFile) throw new Error(`Template not found at ${templateFilePath}`);

        // 6. Verificar y crear carpeta
        const folderExists = await app.vault.adapter.exists(folderPath);
        if (!folderExists) await app.vault.createFolder(folderPath);

        // 7. Prevención de sobreescritura
        const fileExists = await app.vault.adapter.exists(fileToCreatePath);
        if (fileExists) {
            new Notice(`⚠️ El archivo ya existe: ${fileName}.md`);
            return;
        }

        // 8. Crear la nueva nota
        const templateContent = await app.vault.read(templateFile);
        const newFile = await app.vault.create(fileToCreatePath, templateContent);
        
        // 🚀 8.5 NUEVO: INYECTAR PROPIEDADES HEREDADAS 🚀
        if (variables?.inheritProperties) {
            const propsToInherit = variables.inheritProperties;
            if (Object.keys(propsToInherit).length > 0) {
                await app.fileManager.processFrontMatter(newFile, (fm) => {
                    for (const [key, value] of Object.entries(propsToInherit)) {
                        fm[key] = value;
                    }
                });
            }
        }
        
        new Notice(`✅ Successfully ${fileClass} created at ${folderPath}/`);
        
        const newLeaf = app.workspace.getLeaf(true);
        await newLeaf.openFile(newFile);

        await Utils.sleep(500);

        // 9. Retorno de variables
        if (variables && variables.result) {
            variables.result.createdFilePath = fileToCreatePath;
        }
        
    } catch (error) {
        console.error("Error creating note:", error);
        new Notice(`❌ Failed to create note: ${error.message}`);
    }
};