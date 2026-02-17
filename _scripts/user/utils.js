class Utils {
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    createArchiveButton(dv, page) {
        // Crea un elemento de botón HTML
        const {fieldModifier: f} = app.plugins.plugins['metadata-menu'].api;
        const button = f(dv, page, "archived")

        // Añade un evento de clic al botón
        button.onclick = async () => {

            await this.sleep(500);
            const quickAddApi = app.plugins.plugins.quickadd.api;
            const filePath = page.file.path;
            await quickAddApi.executeChoice("Move By Archived", {value: filePath});       
        };
        return button;
    }

    async ensureFolderExists(app, folderPath) {
        const parts = folderPath.split('/');
        let currentPath = '';
        
        for (let i = 0; i < parts.length; i++) {
            currentPath = currentPath === '' ? parts[i] : `${currentPath}/${parts[i]}`;
            const folder = app.vault.getAbstractFileByPath(currentPath);
            if (!folder) {
                await app.vault.createFolder(currentPath);
            }
        }
    }

    async moveFileSafe(app, file, destFolder) {
        // 1. Asegura que la carpeta exista antes de intentar mover
        await this.ensureFolderExists(app, destFolder);

        // 2. Construye la nueva ruta dinámicamente (.md o cualquier extensión)
        const newPath = `${destFolder}/${file.basename}.${file.extension}`;

        // 3. Mueve solo si la ruta cambió
        if (file.path !== newPath) {
            await app.vault.rename(file, newPath);
            return true;
        }
        return false;
    }
}