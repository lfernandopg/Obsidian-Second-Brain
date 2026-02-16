---
fileClass: resource
type: 💻 Code
referenceStatus: 🟢 Reviewed
source: "[[Local Machine]]"
location: 📝 Obsidian Note
author: "[[Luis Fernando Peña (Me)]]"
tags:
  - nextjs
  - docker
areas:
projects:
tasks:
resources:
  - "[[Contenedor Docker Interactivo Temporal]]"
aliases:
createdDate: Sep 16, 2025 - 18:36
modifiedDate: Sep 16, 2025 - 21:59
favorite: false
archived: false
---

### Con instalación de Dependencias

```sh
docker run -it --rm -v "$(pwd):/app" -w /app node:18 bash -c "npx create-next-app@latest ."
```

### Sin instalación de Dependencias

```sh
docker run -it --rm -v "$(pwd):/app" -w /app node:18 bash -c "npx create-next-app@latest . --skip-install"
```
