module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;

    // 1. Blindaje Inicial: Validar que customJS y sus módulos estén cargados
    if (!customJS || !customJS.FileClassMapper || !customJS.Utils) {
        new Notice("❌ Error: customJS o sus módulos no están cargados.");
        return;
    }

    const { FileClassMapper, Utils } = customJS;
    let fileClass = variables?.fileClass;

    // 2. Selección de FileClass con manejo de cancelación (Escape)
    if (!fileClass || !FileClassMapper.FILE_CLASS_LIST.includes(fileClass)) {
        const capitalizeNames = Object.values(FileClassMapper.CAPITALIZE_NAMES_MAP);
        const fileClassList = Object.keys(FileClassMapper.CAPITALIZE_NAMES_MAP);
        
        fileClass = await quickAddApi.suggester(capitalizeNames, fileClassList);
        
        // Salida limpia si el usuario presiona ESC
        if (!fileClass) {
            console.log("Creación de archivo cancelada por el usuario.");
            return; 
        }
    }
    
    // 3. Captura del nombre (Corrección de variable local: 'let fileName')
    let fileName = await quickAddApi.inputPrompt(`Create new ${fileClass}`);
    
    // Salida limpia si el usuario cancela el prompt
    if (!fileName) return; 

    // 4. Sanitización del nombre de archivo para evitar errores del SO
    fileName = fileName.trim().replace(/[\\/:*?"<>|]/g, '');
    if (fileName.length === 0) {
        new Notice("❌ El nombre proporcionado contiene caracteres inválidos o está vacío.");
        return;
    }
    
    const templateFilePath = FileClassMapper.getTemplateFilePathMap(fileClass);
    const folderPath = FileClassMapper.getFolder(fileClass);
    const fileToCreatePath = `${folderPath}/${fileName}.md`;

    try {
        // 5. Validar existencia de la plantilla tempranamente
        const templateFile = app.vault.getAbstractFileByPath(templateFilePath);
        if (!templateFile) {
            throw new Error(`Template not found at ${templateFilePath}`);
        }

        // 6. Verificar si la carpeta destino existe, si no, crearla
        const folderExists = await app.vault.adapter.exists(folderPath);
        if (!folderExists) {
            await app.vault.createFolder(folderPath);
        }

        // 7. Prevención de sobreescritura (Si el archivo ya existe)
        const fileExists = await app.vault.adapter.exists(fileToCreatePath);
        if (fileExists) {
            new Notice(`⚠️ El archivo ya existe: ${fileName}.md`);
            return; // Detener ejecución para no pisar la nota existente
        }

        // 8. Crear la nueva nota
        const templateContent = await app.vault.read(templateFile);
        const newFile = await app.vault.create(fileToCreatePath, templateContent);
        
        // Mostrar notificación de éxito
        new Notice(`✅ Successfully ${fileClass} created at ${folderPath}/`);
        
        // Abrir la nueva nota en una nueva ventana
        const newLeaf = app.workspace.getLeaf(true);
        await newLeaf.openFile(newFile);

        await Utils.sleep(500);

        // 9. Retorno seguro de variables
        if (variables && variables.result) {
            variables.result.createdFilePath = fileToCreatePath;
        }
        
    } catch (error) {
        console.error("Error creating note:", error);
        new Notice(`❌ Failed to create note: ${error.message}`);
    }
};