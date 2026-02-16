---
fileClass: resource
type: 💻 Code
creationStatus: 🟡 Draft
source: "[[Local Machine]]"
location: 📝 Obsidian Note
author: "[[Luis Fernando Peña (Me)]]"
tags:
  - python
  - docker
  - template
areas:
projects:
tasks:
resources:
aliases:
createdDate: Dec 02, 2025 - 12:41
modifiedDate: Feb 02, 2026 - 14:30
favorite: false
archived: false
---
```
mi-proyecto-python/
├── src/
│   └── my_app/     <-- Nombre real de tu app (snake_case)
│       ├── __init__.py
│       └── main.py
├── tests/
├── Dockerfile
├── compose.yaml
└── requirements.txt
```

```Dockerfile
# Usamos una imagen base oficial de Python ligera
FROM python:3.11-slim

# Evita que Python genere archivos .pyc y fuerza la salida estándar (logs) en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="${PYTHONPATH}:/app/src"

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los requerimientos para aprovechar la caché de Docker
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY ./app /app

# Comando por defecto (se puede sobrescribir desde docker-compose)
CMD ["tail", "-f", "/dev/null"]
```

```yml
services:
  python-app:
    build: .
    container_name: python_dev_env
    volumes:
      - ./src:/app/src      # Mapeamos el código fuente
      - ./tests:/app/tests  # <--- AGREGADO: Mapeamos los tests para poder ejecutarlos
    environment:
      - APP_ENV=development
      # El PYTHONPATH ya incluye /app/src gracias al Dockerfile, 
      # así que los tests encontrarán tu código automáticamente.
```

```
requests
python-dotenv
```
