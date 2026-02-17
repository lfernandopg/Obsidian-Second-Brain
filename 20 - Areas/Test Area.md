---
fileClass: area
category: 
description: HELLO THIS IS A DESCRIPTION
created: Jul 20, 2025 - 16:04
modified: Jul 22, 2025 - 15:48
favorite: true
archived: false
new_field: new_value
---

```dataviewjs

const app = this.app
const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;

function createArchiveButton(dv, projectPage) {
    // Crea un elemento de botón HTML
    const button = f(dv, projectPage, "archived")

    // Añade un evento de clic al botón
    button.onclick = async () => {
		//new Notice("Click");

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        await sleep(500);
        const quickAddApi = app.plugins.plugins.quickadd.api;
        const filePath = projectPage.file.path;
        await quickAddApi.executeChoice("Move By Archived", {value: filePath});       
    };
    return button;
}

const areas = dv.pages('"20 - Areas"').where(p => p.fileClass === "area");

for (const area of areas) {
    const areaName = area.file.name;
    const projects = dv.pages('"10 - Projects"')
        .where(p =>
            p.fileClass === "project" &&
            p.area &&
            p.area.path === area.file.path &&
            p.status !== "Done" && p.archived !== true
        );

    if (projects.length > 0) {
        dv.header(3, `📁 ${areaName}`);
        dv.table(["📌 Proyecto", "🗓 Inicio", "Deadline🎯", "Estado📍", "🔝Prioridad", "📦"],
            projects.map(p => [
                p.file.link,
                f(dv, p, "start_date"),
                f(dv, p, "deadline"),
                f(dv, p, "status"),
                f(dv, p, "priority"),
                //f(dv, p, "archived")
                createArchiveButton(dv, p)
            ])
        );
    }
}
```



