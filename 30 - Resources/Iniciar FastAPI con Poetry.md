---
fileClass: resource
type: 💻 Code
referenceStatus: 🟢 Reviewed
source: "[[Local Machine]]"
location: 📝 Obsidian Note
author: "[[Luis Fernando Peña (Me)]]"
tags:
  - python
  - fastapi
  - poetry
areas:
projects:
tasks:
resources:
aliases:
createdDate: Sep 24, 2025 - 15:02
modifiedDate: Sep 24, 2025 - 15:27
favorite: false
archived: false
---
```bash
docker run --rm -v "$(pwd):/app" -w /app python:3.11-slim bash -c "pip install poetry && poetry init --name my-fastapi-app -n && poetry add fastapi uvicorn python-dotenv && chown -R $(id -u):$(id -g) /app"
```
