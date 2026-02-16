---
fileClass: resource
type: 💻 Code
referenceStatus: 🟢 Reviewed
source: "[[Gemini AI]]"
location: 📝 Obsidian Note
author: "[[Gemini 2.5 Pro]]"
tags:
  - react
  - arquitectura
areas:
projects:
tasks:
resources:
aliases:
createdDate: Oct 12, 2025 - 13:08
modifiedDate: Oct 12, 2025 - 13:13
favorite: false
archived: false
---
### **Arquitectura Orientada a Módulos (Feature-Based Architecture)**

Esta es una aproximación muy práctica y popular. En lugar de agrupar los archivos por tipo (componentes, hooks, servicios), se agrupan por funcionalidad o "feature".

**Estructura:**

Cada módulo contiene todo lo necesario para que esa funcionalidad opere: componentes, hooks, servicios, pruebas, estilos, etc.

**Ventajas:**

- **Escalabilidad:** Añadir nuevas funcionalidades es tan simple como añadir una nueva carpeta, sin tocar las existentes.
    
- **Claridad:** Es muy fácil encontrar todos los archivos relacionados con una parte específica de la aplicación.
    
- **Autonomía del Equipo:** Diferentes equipos pueden trabajar en diferentes "features" con mínimos conflictos.
    

**Estructura de Carpetas Sugerida:**

```
/src
  /features
    /auth
      /components
        LoginForm.jsx
        RegisterForm.jsx
      /hooks
        useAuth.js
      /services
        authApi.js
      index.js  // Punto de entrada del módulo
    /products
      /components
        ProductList.jsx
        ProductCard.jsx
      /hooks
        useProducts.js
      /services
        productsApi.js
      index.js
  /components  // Componentes compartidos y reutilizables (UI Kit)
    /Button
    /Input
  /lib       // Código genérico (configuración de axios, helpers, etc.)
  /pages     // Ensambla las features en páginas completas
```