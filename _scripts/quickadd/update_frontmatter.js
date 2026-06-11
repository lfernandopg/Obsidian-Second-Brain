// ============================================================
// update_frontmatter.js
// ============================================================
/**
 * Actualiza propiedades del frontmatter de un archivo.
 */
module.exports = async (params) => {
    const { app, variables } = params;
    const CTRL = "UpdateFrontmatter";

    try { customJS.SystemBootstrap.boot(); } catch (err) {
        new Notice(`❌ Error crítico: ${err.message}`); return;
    }

    const { Utils, Messages, Logger } = customJS;

    if (!variables?.filePath || !variables?.properties) {
        new Notice(Messages.get("FRONTMATTER_MISSING_VARS")); return;
    }

    const { filePath, properties } = variables;
    const file = app.vault.getAbstractFileByPath(filePath);

    if (!file) {
        new Notice(Messages.get("FRONTMATTER_FILE_NOT_FOUND", filePath)); return;
    }

    if (file.extension !== 'md') {
        new Notice(Messages.get("FRONTMATTER_NOT_MARKDOWN", file.name)); return;
    }

    try {
        await Utils.updateFrontmatter(app, file, properties);
        Logger.info(CTRL, `Frontmatter actualizado: "${file.basename}".`, { properties });
        new Notice(Messages.get("FRONTMATTER_UPDATE_SUCCESS", file.basename));
    } catch (err) {
        Logger.error(CTRL, `Error actualizando frontmatter de "${file.basename}".`, { error: err.message });
        new Notice(Messages.get("FRONTMATTER_UPDATE_ERROR", file.basename));
    }
};