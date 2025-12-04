class Table {

    showActiveProjectsByArea(dv, area, projectFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const projects = dv.pages(`"${projectFolder}"`)
            .where(p =>
                p.fileClass === "project" &&
                p.area &&
                p.area.path === area.file.path &&
                p.status !== "🟢 Done" && p.status !== "⛔ Canceled" && p.archived !== true 
            );

        if (projects.length > 0) {
            dv.header(3, `⏳ Active Projects`);
            dv.table(["📁Projects", "🎯Deadline", "📍Status", "⬆️Priority", "📊Progress", "🗃"],
                projects.map(p => [
                    p.file.link,
                    //f(dv, p, "startDate"),
                    //f(dv, p, "deadlineDate"),
                    //p.startDate || "-",
                    p.deadlineDate || "-",
                    f(dv, p, "status"),
                    f(dv, p, "priority"),
                    //f(dv, p, "archived")
                    `60%<progress style="max-width: 65px" value="6" max="10"></progress>`,
                    Utils.createArchiveButton(dv, p)
                ])
            );
        }
    }

    showDoneProjectsByArea(dv, area, projectFolder, archivedProjectFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const projects = dv.pages(`"${projectFolder}" or "${archivedProjectFolder}"`)
            .where(p =>
                p.fileClass === "project" &&
                p.area &&
                p.area.path === area.file.path &&
                p.status === "🟢 Done"
            );

        if (projects.length > 0) {
            dv.header(3, `✅ Completed Projects`);
            dv.table(["📁Projects", "🗓Start",  "🗓End", "🎯Deadline", "⬆️Priority", "🗃"],
                projects.map(p => [
                    p.file.link,
                    p.startDate || "-",
                    p.endDate || "-",
                    p.deadlineDate || "-",
                    p.priority || "-",
                    Utils.createArchiveButton(dv, p)
                ])
            );
        }
    }

    showActiveTasksByArea(dv, area, taskFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const tasks = dv.pages(`"${taskFolder}"`)
            .where(p =>
                p.fileClass === "task" &&
                p.area &&
                p.area.path === area.file.path &&
                p.status !== "🟢 Done" && p.status !== "⛔ Canceled" && p.archived !== true 
            );

        if (tasks .length > 0) {
            dv.header(3, `⏳ Active Tasks`);
            dv.table(["📝Tasks", "🎯Deadline", "📍Status", "📐Size", "⬆️Priority", "📊Progress", "🗃"],
                tasks.map(p => [
                    p.file.link,
                    //f(dv, p, "startDate"),
                    //f(dv, p, "deadlineDate"),
                    //p.startDate || "-",
                    p.deadlineDate || "-",
                    f(dv, p, "status"),
                    f(dv, p, "size"),
                    f(dv, p, "priority"),
                    //f(dv, p, "archived")
                    `60%<progress style="max-width: 65px" value="6" max="10"></progress>`,
                    Utils.createArchiveButton(dv, p)
                ])
            );
        }
    }

    showDoneTasksByArea(dv, area, taskFolder, archivedTaskFolder, Utils) {
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const tasks = dv.pages(`"${taskFolder}" or "${archivedTaskFolder}"`)
            .where(p =>
                p.fileClass === "task" &&
                p.area &&
                p.area.path === area.file.path &&
                p.status === "🟢 Done"
            );

        if (tasks .length > 0) {
            dv.header(3, `✅ Completed Task`);
            dv.table(["📝Tasks", "🗓Start",  "🗓End", "🎯Deadline", "📐Size", "⬆️Priority", "🗃"],
                tasks.map(p => [
                    p.file.link,
                    //f(dv, p, "startDate"),
                    //f(dv, p, "deadlineDate"),
                    p.startDate || "-",
                    p.endDate || "-",
                    p.deadlineDate || "-",
                    p.size || "-",
                    p.priority || "-",
                    //f(dv, p, "archived")
                    Utils.createArchiveButton(dv, p)
                ])
            );
        }
    }
}