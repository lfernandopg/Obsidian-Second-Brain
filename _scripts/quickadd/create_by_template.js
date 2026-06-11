// ============================================================
// create_by_template.js
// ============================================================
/**
 * Crea una nueva nota a partir de la plantilla del fileClass indicado.
 */
module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;
    const CTRL = "CreateByTemplate";

    try { customJS.SystemBootstrap.boot(); } catch (err) {
        new Notice(`❌ Error crítico: ${err.message}`); return;
    }

    const { FileClassMapper, Utils, Messages, Logger, Settings } = customJS;

    // ── SELECCIONAR FILECLASS ─────────────────────────────────────────────
    let fileClass = variables?.fileClass;

    if (!fileClass || !Settings.FILE_CLASS_LIST.includes(fileClass)) {
        const labels  = Object.values(FileClassMapper.CAPITALIZE_NAMES_MAP);
        const classes = Object.keys(FileClassMapper.CAPITALIZE_NAMES_MAP);
        fileClass = await quickAddApi.suggester(labels, classes);
        if (!fileClass) return;
    }

    // ── CAPTURAR Y SANITIZAR NOMBRE ───────────────────────────────────────
    let fileName = await quickAddApi.inputPrompt(`Crear nuevo ${FileClassMapper.getCapitalizeName(fileClass)}`);
    if (!fileName) return;

    fileName = fileName.trim().replace(/[\\/:*?"<>|]/g, '');
    if (!fileName) {
        new Notice(Messages.get("CREATE_INVALID_NAME")); return;
    }

    // ── RUTAS ─────────────────────────────────────────────────────────────
    const templatePath = FileClassMapper.getTemplatePath(fileClass);
    const folderPath   = FileClassMapper.getFolder(fileClass);
    const fileToCreate = `${folderPath}/${fileName}.md`;

    // ── VALIDACIONES ──────────────────────────────────────────────────────
    const templateFile = app.vault.getAbstractFileByPath(templatePath);
    if (!templateFile) {
        new Notice(Messages.get("CREATE_TEMPLATE_NOT_FOUND", templatePath)); return;
    }

    if (await app.vault.adapter.exists(fileToCreate)) {
        new Notice(Messages.get("CREATE_FILE_EXISTS", fileName)); return;
    }

    // ── CREAR NOTA ────────────────────────────────────────────────────────
    try {
        await Utils.ensureFolderExists(app, folderPath);

        const templateContent = await app.vault.read(templateFile);
        const newFile         = await app.vault.create(fileToCreate, templateContent);

        const inheritProps = variables?.inheritProperties ?? {};
        if (Object.keys(inheritProps).length > 0) {
            await Utils.updateFrontmatter(app, newFile, inheritProps);
        }

        Logger.info(CTRL, `Nota creada: "${fileName}".`, { fileClass, folderPath });
        new Notice(Messages.get("CREATE_SUCCESS", FileClassMapper.getCapitalizeName(fileClass), folderPath));

        const newLeaf = app.workspace.getLeaf(true);
        await newLeaf.openFile(newFile);
        await Utils.sleep(Settings.SLEEP_AFTER_FILE_OP);

        if (variables?.result) variables.result.createdFilePath = fileToCreate;

    } catch (err) {
        Logger.error(CTRL, `Error creando nota "${fileName}".`, { error: err.message });
        new Notice(Messages.get("CREATE_ERROR", err.message));
    }
};