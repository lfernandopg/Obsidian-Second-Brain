module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;

    // 1. Blindaje Inicial: Validar customJS y dependencias
    if (!customJS || !customJS.FileClassMapper || !customJS.Utils) {
        new Notice("❌ Error: customJS o sus dependencias no están cargadas.");
        return;
    }

    const { FileClassMapper, Utils } = customJS;

    try {
        // 2. Obtener contexto del archivo activo
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

        // 3. Obtener y validar relaciones posibles desde el Mapper
        const possibleRelations = FileClassMapper.getRelations(activeFileClass);

        if (!Array.isArray(possibleRelations) || possibleRelations.length === 0) {
            new Notice(`🤷‍♂️ No defined relations for fileClass '${activeFileClass}'.`);
            return;
        }

        // 4. Preguntar al usuario qué desea crear/enlazar
        const relationOptions = possibleRelations.map(rel => FileClassMapper.getRelationToShow(rel.relationToShow));
        const selectedRelation = await quickAddApi.suggester(relationOptions, possibleRelations);

        if (!selectedRelation) return; // Salida limpia si el usuario presiona ESC

        const { fileClassRelation, propertyToUpdate, linkDirection } = selectedRelation;
        
        // Validar que la relación tenga los datos mínimos necesarios
        if (!fileClassRelation || !propertyToUpdate) {
            new Notice("❌ La relación seleccionada está mal configurada (faltan propiedades).");
            return;
        }

        let relatedFilePath;
        let relatedFile;

        // 5. Flujo de Creación vs Selección de nota existente
        if (variables && variables.create === true) {
            
            // 🚀 NUEVO: Lógica de Herencia de Propiedades 🚀
            const fm = activeFileCache?.frontmatter;
            const inheritProps = {};
            
            // Extraer el area y project de la nota padre si existen
            if (fm?.area) inheritProps.area = fm.area;
            if (fm?.project) inheritProps.project = fm.project;

            const creationVars = {
                fileClass: fileClassRelation,
                result: { createdFilePath: null },
                inheritProperties: inheritProps // Enviamos el paquete al script creador
            };
            
            // Llamamos al otro script blindado para crear la nota
            await quickAddApi.executeChoice("Create By Template", creationVars);

            const createdFilePath = creationVars.result?.createdFilePath;
            if (!createdFilePath) {
                return; // Si el usuario canceló la creación, salimos en silencio
            }
            
            relatedFile = app.vault.getAbstractFileByPath(createdFilePath);
            if (!relatedFile) {
                throw new Error(`No se pudo encontrar el archivo recién creado en la ruta: ${createdFilePath}`);
            }
            relatedFilePath = createdFilePath;

        } else {
            // Filtrar archivos válidos para enlazar
            const templatePath = FileClassMapper.getTemplateFilePathMap(fileClassRelation);
            
            const validFiles = app.vault.getMarkdownFiles().filter((file) => {
                const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
                const fileClass = metadata?.fileClass;
                const archived = metadata?.archived;
                
                return fileClass === fileClassRelation 
                    && !archived 
                    && file.path !== activeFile.path
                    && file.path !== templatePath;
            });

            if (validFiles.length === 0) {
                new Notice(`⚠️ No hay archivos de tipo '${fileClassRelation}' disponibles para enlazar.`);
                return;
            }

            const fileNames = validFiles.map(f => f.basename);
            const selectedFile = await quickAddApi.suggester(fileNames, validFiles);
            
            if (!selectedFile) return; 
            
            relatedFile = selectedFile;
            relatedFilePath = selectedFile.path;
        }

        // 6. Preparar y ejecutar el enlazado según la dirección
        let targetFilePath;
        let propertiesToUpdate;
        let linkText;
        let targetFileName;

        if (linkDirection === 'inward') {
            targetFilePath = relatedFilePath;
            linkText = `[[${activeFile.basename}]]`;
            propertiesToUpdate = { [propertyToUpdate]: linkText };
            targetFileName = activeFile.basename; 
        } else { 
            targetFilePath = activeFile.path;
            linkText = `[[${relatedFile.basename}]]`;
            propertiesToUpdate = { [propertyToUpdate]: linkText };
            targetFileName = relatedFile.basename;
        }

        await Utils.sleep(500); 

        // 7. Ejecutar actualización de frontmatter delegando a QuickAdd
        await quickAddApi.executeChoice("Update Frontmatter", {
            filePath: targetFilePath,
            properties: propertiesToUpdate
        });
        
        const linkedFromName = linkDirection === 'inward' ? relatedFile.basename : activeFile.basename;
        new Notice(`🔗 Linked: ${linkedFromName} ➡️ ${targetFileName}`);

    } catch (error) {
        console.error("Error en script de enlazado:", error);
        new Notice(`❌ Ocurrió un error al enlazar: ${error.message}`);
    }
};