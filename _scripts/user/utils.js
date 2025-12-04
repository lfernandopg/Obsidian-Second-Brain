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
}