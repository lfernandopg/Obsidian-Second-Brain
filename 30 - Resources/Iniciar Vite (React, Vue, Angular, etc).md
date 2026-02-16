---
fileClass: resource
type: 💻 Code
referenceStatus: 🟢 Reviewed
source: "[[Local Machine]]"
location: 📝 Obsidian Note
author: "[[Luis Fernando Peña (Me)]]"
tags:
  - vite
  - react
  - vue
  - angular
areas:
projects:
tasks:
resources:
  - "[[Contenedor Docker Interactivo Temporal]]"
aliases:
createdDate: Sep 25, 2025 - 22:54
modifiedDate: Sep 25, 2025 - 23:10
favorite: false
archived: false
---
```sh
docker run -it --rm -v "$(pwd):/app" -w /app node:18 bash -c "npm create vite@latest ."
```
