module.exports = async (params) => {
    const { app, variables} = params;
    
    const fileName = variables.value;

    const file = fileName
        ? app.vault.getAbstractFileByPath(fileName) 
        : app.workspace.getActiveFile();

    if (!file) return;

    const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
    const archived = metadata?.archived;
    if (archived == null) return;

    const { FileClassMapper } = customJS;

    const fileClass = metadata?.fileClass;

    if (!fileClass || !FileClassMapper.FILE_CLASS_LIST.includes(fileClass)) return;

    const baseFolder = FileClassMapper.getFolder(fileClass);

    const archivedFolder = FileClassMapper.getArchivedFolder(fileClass);

    const targetFolder = archived
        ? archivedFolder
        : baseFolder;

    const newPath = `${targetFolder}/${file.basename}.md`;

    if (file.path !== newPath) {
        await app.vault.rename(file, newPath);
        new Notice(`📦 ${file.basename} was moved to: ${targetFolder}`);
    }
};