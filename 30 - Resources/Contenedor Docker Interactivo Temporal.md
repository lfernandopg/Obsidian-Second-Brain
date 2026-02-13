---
fileClass: resource
type: 💻 Code
referenceStatus: 🟢 Reviewed
source: "[[Local Machine]]"
location: 📝 Obsidian Note
author: "[[Luis Fernando Peña (Me)]]"
tags:
  - docker
  - container
areas:
projects:
tasks:
resources:
aliases:
createdDate: Sep 16, 2025 - 20:52
modifiedDate: Sep 16, 2025 - 22:00
favorite: false
archived: false
---
### Con volumen Bind
Esto para ver el resultado de lo que se hace en el contenedor temporal

```sh
docker run -it --rm -v "$(pwd):/{ruta}" -w /{working_directory} {imagen_docker} bash -c "{command}"
```

### Con volumen nombrado
Esto si se necesitan guardar dependencias de la creacion del contenedor temporal.

Crea el volumen nombrado:
```sh
docker volume create modules_my_app
```

Ejecuta el contenedor con el nuevo volumen:
```sh
docker run -it --rm -v "$(pwd):/{ruta}" -v modules_my_app:/app/modules -w /{working_directory} {imagen_docker} bash -c "{command}"
```
