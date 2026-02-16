---
fileClass: area
category: 💼 Career & Jobs
aliases: 
createdDate: Aug 11, 2025 - 19:01
modifiedDate: Aug 15, 2025 - 14:14
favorite: false
archived: false
---

```dataviewjs

const {FileClassMapper, Utils, Table } = customJS;
const projectFolder = FileClassMapper.getFolder('project');
const activeArea = dv.current();
Table.showProjectsByArea(dv, activeArea, projectFolder, Utils)

```
