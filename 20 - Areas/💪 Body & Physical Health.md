---
fileClass: area
category: ❤️ Health & Wellness
aliases: 
createdDate: Aug 11, 2025 - 18:41
modifiedDate: Aug 15, 2025 - 20:35
favorite: false
archived: false
---

---
## 📁 Projects
```dataviewjs

const { FileClassMapper, Utils, Table } = customJS;
const fileClass = 'project';
const projectFolder = FileClassMapper.getFolder(fileClass);
const archivedFolder = FileClassMapper.getArchivedFolder(fileClass);
const activeArea = dv.current();
Table.showActiveProjectsByArea(dv, activeArea, projectFolder, Utils)
Table.showDoneProjectsByArea(dv, activeArea, projectFolder, archivedFolder, Utils)

```
---
## 📝 Tasks
```dataviewjs

const { FileClassMapper, Utils, Table } = customJS;
const fileClass = 'task';
const tasksFolder = FileClassMapper.getFolder(fileClass);
const archivedFolder = FileClassMapper.getArchivedFolder(fileClass);
const activeArea = dv.current();
Table.showActiveTasksByArea(dv, activeArea, tasksFolder, Utils)
Table.showDoneTasksByArea(dv, activeArea, tasksFolder, archivedFolder, Utils)

```


