module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const { FileClassMapper } = customJS;

    // Actualizar proyectos
    const projects = app.vault.getMarkdownFiles().filter(file => {
        const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
        return metadata?.fileClass === 'project' && !metadata?.archived;
    });

    let updatedCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const project of projects) {
        const metadata = app.metadataCache.getFileCache(project)?.frontmatter;
        let newStatus = null;

        // Si tiene fecha de inicio y aún no ha comenzado
        if (metadata.startDate) {
            const startDate = new Date(metadata.startDate);
            startDate.setHours(0, 0, 0, 0);
            
            if (startDate > today && metadata.status === "⚪️ Inbox") {
                newStatus = "🔵 Planned";
            } else if (startDate <= today && metadata.status === "🔵 Planned") {
                newStatus = "🟡 In progress";
            }
        }

        // Si tiene deadline vencido y no está completado
        if (metadata.deadlineDate && metadata.status !== "🟢 Done" && metadata.status !== "⛔ Canceled") {
            const deadline = new Date(metadata.deadlineDate);
            deadline.setHours(0, 0, 0, 0);
            
            if (deadline < today) {
                new Notice(`⚠️ Project overdue: ${project.basename}`);
            }
        }

        if (newStatus && newStatus !== metadata.status) {
            await app.fileManager.processFrontMatter(project, (frontmatter) => {
                frontmatter.status = newStatus;
            });
            updatedCount++;
        }
    }
}