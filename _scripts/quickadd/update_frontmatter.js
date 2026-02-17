module.exports = async (params) => {
    const { app, variables } = params;

    // 1. Validar que las variables de entrada existan
    if (!variables || !variables.filePath || !variables.properties) {
        new Notice("❌ Faltan variables (filePath o properties) para actualizar el frontmatter.");
        return;
    }

    const { filePath, properties } = variables;

    // 2. Obtener y validar el archivo
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file) {
        new Notice(`❌ Archivo no encontrado: ${filePath}`);
        return;
    }

    // Blindaje: Asegurar que es un archivo Markdown antes de tocar el frontmatter
    if (file.extension !== 'md') {
        new Notice(`❌ No se puede actualizar el frontmatter: '${file.name}' no es un archivo Markdown.`);
        return;
    }

    try {
        // 3. Procesar el Frontmatter de forma segura
        await app.fileManager.processFrontMatter(file, (frontmatter) => {
            for (const key in properties) {
                // Validación segura de propiedades del objeto
                if (Object.prototype.hasOwnProperty.call(properties, key)) {
                    const newValue = properties[key];
                    
                    // Si la propiedad ya existe en la nota y es un array
                    if (Array.isArray(frontmatter[key])) {
                        
                        // Si el nuevo valor también es un array, los fusionamos
                        if (Array.isArray(newValue)) {
                            newValue.forEach(item => {
                                if (!frontmatter[key].includes(item)) {
                                    frontmatter[key].push(item);
                                }
                            });
                        } else {
                            // Si es un valor único, lo añadimos (evitando duplicados)
                            if (!frontmatter[key].includes(newValue)) {
                                frontmatter[key].push(newValue);
                            }
                        }
                    } else {
                        // Si la propiedad no es un array (o no existía), simplemente se asigna
                        frontmatter[key] = newValue;
                    }
                }
            }
        });
        
        // Notificación de éxito
        new Notice(`✅ Frontmatter de '${file.basename}' actualizado.`);

    } catch (error) {
        console.error("Error al actualizar frontmatter:", error);
        new Notice(`❌ Error al actualizar frontmatter en '${file.basename}'. Revisa la consola.`);
    }
};