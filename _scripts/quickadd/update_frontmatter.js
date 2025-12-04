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