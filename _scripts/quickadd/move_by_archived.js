module.exports = async (params) => {
    const { app, variables } = params;
    const fileName = variables.value;

    // Obtener el archivo objetivo
    const targetFile = fileName
        ? app.vault.getAbstractFileByPath(fileName) 
        : app.workspace.getActiveFile();

    if (!targetFile) return;

    const metadata = app.metadataCache.getFileCache(targetFile)?.frontmatter;
    const isArchived = metadata?.archived === true;
    const fileClass = metadata?.fileClass;

    if (metadata?.archived == null || !fileClass) return;

    const { FileClassMapper, Utils } = customJS;

    const getLinks = (prop) => {
        if (!prop) return [];
        const arr = Array.isArray(prop) ? prop : [prop];
        return arr.map(item => {
            if (typeof item === 'string') {
                const match = item.match(/\[\[(.*?)(\|.*)?\]\]/);
                return match ? match[1] : item;
            }
            return String(item);
        });
    };
    const moveFile = async (file, fClass, targetIsArchived) => {
        const baseFolder = FileClassMapper.getFolder(fClass);
        const archFolder = FileClassMapper.getArchivedFolder(fClass);
        const destFolder = targetIsArchived ? archFolder : baseFolder;
        
        // Llamamos a la única fuente de verdad en Utils
        return await Utils.moveFileSafe(app, file, destFolder);
    };
    
    let movedCount = 0;

    // 1. MOVER EL ARCHIVO PRINCIPAL
    if (await moveFile(targetFile, fileClass, isArchived)) {
        movedCount++;
    }

    // 2. PROPAGACIÓN EN CASCADA (Área -> Proyecto -> Tarea -> Subtarea)
    const allProjects = app.vault.getMarkdownFiles().filter(f => app.metadataCache.getFileCache(f)?.frontmatter?.fileClass === 'project');
    const allTasks = app.vault.getMarkdownFiles().filter(f => app.metadataCache.getFileCache(f)?.frontmatter?.fileClass === 'task');

    const filesToProcess = new Set();
    const projectsToProcess = new Set();
    const tasksToProcess = new Set();

    // A. Nivel 1: Si es un Área, buscar sus Proyectos
    if (fileClass === 'area') {
        allProjects.forEach(p => {
            const fm = app.metadataCache.getFileCache(p)?.frontmatter;
            if (getLinks(fm?.area).includes(targetFile.basename)) {
                filesToProcess.add(p);
                projectsToProcess.add(p.basename);
            }
        });
    }

    // B. Nivel 2: Si es un Proyecto (o fue agregado en el paso A), buscar sus Tareas
    if (fileClass === 'project') {
        projectsToProcess.add(targetFile.basename);
    }

    if (projectsToProcess.size > 0) {
        allTasks.forEach(t => {
            const fm = app.metadataCache.getFileCache(t)?.frontmatter;
            const parentProjects = getLinks(fm?.project);
            if (parentProjects.some(pName => projectsToProcess.has(pName))) {
                filesToProcess.add(t);
                tasksToProcess.add(t.basename);
            }
        });
    }

    // C. Nivel 3: Si es una Tarea (o fue agregada en el paso B), buscar Subtareas en profundidad
    if (fileClass === 'task') {
        tasksToProcess.add(targetFile.basename);
    }

    const queue = Array.from(tasksToProcess);
    while (queue.length > 0) {
        const currentName = queue.shift();
        
        allTasks.forEach(t => {
            const fm = app.metadataCache.getFileCache(t)?.frontmatter;
            if (getLinks(fm?.parentTask).includes(currentName) && !filesToProcess.has(t)) {
                filesToProcess.add(t);
                queue.push(t.basename);
            }
        });
    }

    // D. Aplicar cambios de frontmatter y mover archivos a toda la descendencia
    for (const childFile of filesToProcess) {
        const childFm = app.metadataCache.getFileCache(childFile)?.frontmatter;
        const childClass = childFm?.fileClass;
        const childIsArchived = childFm?.archived === true;
        
        if (childIsArchived !== isArchived) {
            await app.fileManager.processFrontMatter(childFile, (fm) => {
                fm.archived = isArchived;
            });
            
            // Usamos la clase de archivo correcta (project o task) para moverlo a su carpeta correspondiente
            if (await moveFile(childFile, childClass, isArchived)) {
                movedCount++;
            }
        }
    }

    // Feedback visual
    if (movedCount > 0) {
        if (isArchived) {
            new Notice(`📦 Cascada completada: ${movedCount} archivo(s) movido(s) al archivo.`);
        } else {
            new Notice(`📤 Cascada completada: ${movedCount} archivo(s) recuperado(s) a la bóveda principal.`);
        }
    }
};