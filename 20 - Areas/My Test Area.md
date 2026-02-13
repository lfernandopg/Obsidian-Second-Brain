---
fileClass: area
category: 
aliases: 
createdDate: Jul 23, 2025 - 00:29
modifiedDate: Jul 24, 2025 - 13:42
favorite: false
archived: false
---


```dataviewjs

const app = this.app
const fileClass = 'project';
const { FileClassMapper, Utils } = customJS;
const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;

const areaFolder = FileClassMapper.getFolder('area');
const projectFolder = FileClassMapper.getFolder(fileClass);

function createArchiveButton(dv, projectPage) {
    // Crea un elemento de botón HTML
    const button = f(dv, projectPage, "archived")

    // Añade un evento de clic al botón
    button.onclick = async () => {

        await Utils.sleep(500);
        const quickAddApi = app.plugins.plugins.quickadd.api;
        const filePath = projectPage.file.path;
        await quickAddApi.executeChoice("Move By Archived", {value: filePath});       
    };
    return button;
}

const areas = dv.pages(`"${areaFolder}"`).where(p => p.fileClass === "area");


for (const area of areas) {
    const areaName = area.file.name;
    const projects = dv.pages(`"${projectFolder}"`)
        .where(p =>
            p.fileClass === "project" &&
            p.area &&
            p.area.path === area.file.path &&
            p.status !== "Done" && p.archived !== true
        );

    if (projects.length > 0) {
        dv.header(3, ` ${areaName}`);
        dv.table(["📁 Projects", "🗓Start", "🎯Deadline", "📍Status", "🔝Priority", "📊Progress", "🗃"],
            projects.map(p => [
                p.file.link,
                //f(dv, p, "startDate"),
                //f(dv, p, "deadlineDate"),
                p.startDate || "-",
                p.deadlineDate || "-",
                f(dv, p, "status"),
                f(dv, p, "priority"),
                //f(dv, p, "archived")
                `60%<progress style="max-width: 65px" value="6" max="10"></progress>`,
                createArchiveButton(dv, p)
            ])
        );
    }
}
```




















```dataviewjs 
 const completedWeight = 60;
 const totalWeight = 100;	
 const percent = Math.round((completedWeight / totalWeight) * 100);
  dv.paragraph(`📊 **Progreso del proyecto**: ${percent}% (${completedWeight}/${totalWeight} ponderado)`);
  dv.paragraph(`<progress value="${completedWeight}" max="${totalWeight}" style="width: 100%; height: 1rem;"></progress>`);
```


