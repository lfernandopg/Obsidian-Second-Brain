/**
 * update_frontmatter.js
 *
 * Macro de QuickAdd que actualiza propiedades del frontmatter de un archivo.
 * Recibe su configuración mediante variables:
 *   - variables.filePath   {string}  Ruta al archivo .md
 *   - variables.properties {Object}  Par clave-valor con los campos a actualizar
 *
 * Delega la lógica de fusión de arrays a Utils.updateFrontmatter.
 */
module.exports = async (params) => {
    const { app, variables } = params;

    if (!variables?.filePath || !variables?.properties) {
        new Notice("❌ Faltan variables (filePath o properties) para actualizar el frontmatter.");
        return;
    }

    const { filePath, properties } = variables;
    const file = app.vault.getAbstractFileByPath(filePath);

    if (!file) {
        new Notice(`❌ Archivo no encontrado: ${filePath}`);
        return;
    }

    if (file.extension !== 'md') {
        new Notice(`❌ '${file.name}' no es un archivo Markdown.`);
        return;
    }

    try {
        await customJS.Utils.updateFrontmatter(app, file, properties);
        new Notice(`✅ Frontmatter de '${file.basename}' actualizado.`);
    } catch (error) {
        console.error("Error al actualizar frontmatter:", error);
        new Notice(`❌ Error al actualizar '${file.basename}'. Revisa la consola.`);
    }
};