/**
 * create_by_template.js
 *
 * Crea una nueva nota a partir de la plantilla del fileClass indicado.
 * Si se proporcionan `inheritProperties`, las inyecta en el frontmatter.
 *
 * Variables de entrada (opcionales):
 *   - variables.fileClass          {string}  Si se omite, se muestra un selector.
 *   - variables.inheritProperties  {Object}  Propiedades a inyectar en el frontmatter.
 *   - variables.result             {Object}  Se rellena con { createdFilePath } al terminar.
 */
module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;

    if (!customJS?.FileClassMapper || !customJS?.Utils) {
        new Notice("❌ Error: customJS o sus módulos no están cargados.");
        return;
    }

    const { FileClassMapper, Utils } = customJS;

    // ── SELECCIONAR FILECLASS ─────────────────────────────────────────────

    let fileClass = variables?.fileClass;

    if (!fileClass || !FileClassMapper.FILE_CLASS_LIST.includes(fileClass)) {
        const labels    = Object.values(FileClassMapper.CAPITALIZE_NAMES_MAP);
        const classes   = Object.keys(FileClassMapper.CAPITALIZE_NAMES_MAP);
        fileClass = await quickAddApi.suggester(labels, classes);
        if (!fileClass) return;
    }

    // ── CAPTURAR Y SANITIZAR NOMBRE ───────────────────────────────────────

    let fileName = await quickAddApi.inputPrompt(`Crear nuevo ${FileClassMapper.getCapitalizeName(fileClass)}`);
    if (!fileName) return;

    fileName = fileName.trim().replace(/[\\/:*?"<>|]/g, '');
    if (!fileName) {
        new Notice("❌ El nombre contiene caracteres inválidos o está vacío.");
        return;
    }

    // ── RUTAS ─────────────────────────────────────────────────────────────

    const templatePath   = FileClassMapper.getTemplateFilePathMap(fileClass);
    const folderPath     = FileClassMapper.getFolder(fileClass);
    const fileToCreate   = `${folderPath}/${fileName}.md`;

    // ── VALIDACIONES ──────────────────────────────────────────────────────

    const templateFile = app.vault.getAbstractFileByPath(templatePath);
    if (!templateFile) {
        new Notice(`❌ Plantilla no encontrada: ${templatePath}`);
        return;
    }

    if (await app.vault.adapter.exists(fileToCreate)) {
        new Notice(`⚠️ Ya existe: ${fileName}.md`);
        return;
    }

    // ── CREAR NOTA ────────────────────────────────────────────────────────

    try {
        await Utils.ensureFolderExists(app, folderPath);

        const templateContent = await app.vault.read(templateFile);
        const newFile = await app.vault.create(fileToCreate, templateContent);

        // Inyectar propiedades heredadas si las hay
        const inheritProps = variables?.inheritProperties ?? {};
        if (Object.keys(inheritProps).length > 0) {
            await Utils.updateFrontmatter(app, newFile, inheritProps);
        }

        new Notice(`✅ ${FileClassMapper.getCapitalizeName(fileClass)} creado en ${folderPath}/`);

        // Abrir la nota en una nueva pestaña
        const newLeaf = app.workspace.getLeaf(true);
        await newLeaf.openFile(newFile);

        await Utils.sleep(500);

        // Devolver la ruta al script llamador si está esperando un resultado
        if (variables?.result) {
            variables.result.createdFilePath = fileToCreate;
        }

    } catch (error) {
        console.error("Error al crear la nota:", error);
        new Notice(`❌ No se pudo crear la nota: ${error.message}`);
    }
};