module.exports = async (params) => {
    const { app } = params;
    
    // 1. Blindaje Inicial
    if (!customJS || !customJS.FileClassMapper) {
        new Notice("❌ Error: customJS no está cargado.");
        return;
    }

    const { FileClassMapper } = customJS;
    const statusMap = FileClassMapper.STATUS_MAP;
    const today = window.moment();

    // 2. Obtener todas las tareas recurrentes que NO han sido archivadas y NO han creado su sucesor
    const recurringTasks = app.vault.getMarkdownFiles().filter(file => {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        return fm?.fileClass === 'task' 
            && fm?.recurrence 
            && fm?.nextRecurrenceCreated !== true 
            && fm?.archived !== true;
    });

    let createdCount = 0;

    for (const file of recurringTasks) {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        const status = fm.status;
        const recurrence = fm.recurrence;
        
        // Parsear la fecha límite actual usando el formato exacto de tus plantillas
        const deadline = fm.deadlineDate ? window.moment(fm.deadlineDate, "MMM DD, YY - HH:mm") : null;

        let shouldCreateNext = false;

        // CONDICIÓN A: La tarea fue completada
        if (status === statusMap.done) {
            shouldCreateNext = true;
        } 
        // CONDICIÓN B: El tiempo establecido (deadline) se ha cumplido o sobrepasado
        else if (deadline && today.isSameOrAfter(deadline, 'day')) {
            shouldCreateNext = true;
        }

        if (shouldCreateNext) {
            // 3. Calcular los incrementos de tiempo
            let unit = 'days';
            if (recurrence.includes("Semanal")) unit = 'weeks';
            if (recurrence.includes("Mensual")) unit = 'months';
            if (recurrence.includes("Anual")) unit = 'years';

            // Usamos la fecha límite actual como base matemática. Si no tiene, usamos hoy.
            const baseDate = deadline ? deadline : today.clone();
            
            const newDeadlineDate = baseDate.clone().add(1, unit).format("MMM DD, YY - HH:mm");
            const newStartDate = fm.startDate 
                ? window.moment(fm.startDate, "MMM DD, YY - HH:mm").add(1, unit).format("MMM DD, YY - HH:mm") 
                : "";

            // 4. Preparar el nuevo archivo
            const folderPath = FileClassMapper.getFolder("task");
            
            // Limpiamos el nombre base por si ya tenía una fecha al final (ej: "Ir al Gym - 2026-03-05")
            const baseName = file.basename.split(" - ")[0]; 
            const newFileName = `${baseName} - ${window.moment(newDeadlineDate, "MMM DD, YY - HH:mm").format("YYYY-MM-DD")}`;
            const newFilePath = `${folderPath}/${newFileName}.md`;

            // Evitar duplicaciones accidentales
            if (await app.vault.adapter.exists(newFilePath)) continue;

            // 5. Clonar el archivo con su contenido interno
            const originalContent = await app.vault.read(file);
            const newFile = await app.vault.create(newFilePath, originalContent);

            // 6. Actualizar el Frontmatter de la NUEVA tarea
            await app.fileManager.processFrontMatter(newFile, (newFm) => {
                newFm.status = statusMap.planned; // Vuelve a nacer como planificada
                newFm.startDate = newStartDate;
                newFm.deadlineDate = newDeadlineDate;
                newFm.endDate = ""; // Limpiamos la fecha de fin
                newFm.createdDate = today.format("MMM DD, YY - HH:mm");
                newFm.nextRecurrenceCreated = false;
            });

            // 7. Marcar la tarea VIEJA como procesada para que no vuelva a entrar en el bucle
            await app.fileManager.processFrontMatter(file, (oldFm) => {
                oldFm.nextRecurrenceCreated = true;
            });

            createdCount++;
        }
    }

    if (createdCount > 0) {
        new Notice(`♻️ Recurrencia: Se han generado ${createdCount} nuevas tareas para el siguiente ciclo.`);
    } else {
        new Notice(`👍 Tareas recurrentes al día.`);
    }
};