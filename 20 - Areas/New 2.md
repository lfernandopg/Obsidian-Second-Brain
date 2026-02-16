---
fileClass: area
category:
aliases:
createdDate: Feb 13, 2026 - 10:53
modifiedDate: Feb 13, 2026 - 11:02
favorite: false
archived: false
---

---
## 📁 Projects
```dataviewjs

const { FileClassMapper, Utils, Table } = customJS;
const fileClass = 'project';
const projectsFolder = FileClassMapper.getFolder(fileClass);
const archivedFolder = FileClassMapper.getArchivedFolder(fileClass);
const activeArea = dv.current();
Table.showActiveProjectsByArea(dv, activeArea, projectsFolder, Utils)
Table.showDoneProjectsByArea(dv, activeArea, projectsFolder, archivedFolder, Utils)

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