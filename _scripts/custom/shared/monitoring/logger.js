// =========================================================================
// 📋 CLASE: LOGGER
// Sistema de logging persistente con rotación por tiempo y tamaño.
// Escribe en archivos .txt en la carpeta configurada del vault.
//
// Recibe la instancia de Settings como dependencia inyectada.
// No depende de customJS.Utils ni de ningún otro módulo de la app.
// =========================================================================
class Logger {

    constructor() {
        // Constructor vacío — requerimiento CustomJS
        this.isInitialized  = false;
        this._settings      = null;
        this._activeLogPath = null;
    }

    // =========================================================================
    // INIT — Recibe Settings inyectado
    // =========================================================================

    /**
     * @param {Settings} settings - Instancia inicializada de Settings
     */
    init(settings) {
        if (!settings?.isInitialized) {
            throw new Error("[Logger] Se requiere una instancia de Settings inicializada.");
        }
        this._settings      = settings;
        this._activeLogPath = null; // Resetear caché al re-inicializar
        this.isInitialized  = true;
    }

    // ─────────────────────────────────────────────
    // INTERNOS
    // ─────────────────────────────────────────────

    _getTimeFormat() {
        switch (this._settings.LOG_ROTATION) {
            case "daily":   return "YYYY-MM-DD";
            case "weekly":  return "YYYY-[W]ww";
            case "monthly": return "YYYY-MM";
            default:        return "YYYY-MM";
        }
    }

    async _ensureLogFolder() {
        const folder = this._settings.LOG_FOLDER;
        if (!await app.vault.adapter.exists(folder)) {
            await app.vault.createFolder(folder);
        }
    }

    async _getActiveLogFile() {
        const s         = this._settings;
        const timeStr   = window.moment().format(this._getTimeFormat());
        const basePrefix = `${s.LOG_FOLDER}/${s.LOG_PREFIX}${timeStr}`;

        await this._ensureLogFolder();

        // 1. Verificación rápida en caché
        if (this._activeLogPath?.startsWith(basePrefix)) {
            try {
                const stat = await app.vault.adapter.stat(this._activeLogPath);
                if (stat && stat.size < s.LOG_MAX_SIZE_BYTES) return this._activeLogPath;
            } catch (_) {
                // Caché inválida — continúa a escaneo
            }
        }

        // 2. Escanear directorio para el índice más alto del periodo actual
        let highestIndex = 1;
        const list = await app.vault.adapter.list(s.LOG_FOLDER);
        const matching = list.files.filter(
            f => f.startsWith(basePrefix) && f.endsWith(s.LOG_EXTENSION)
        );

        if (matching.length > 0) {
            const indices = matching.map(f => {
                const m = f.match(/_(\d+)\.txt$/);
                return m ? parseInt(m[1], 10) : 1;
            });
            highestIndex = Math.max(...indices);

            const latestFile = `${basePrefix}_${highestIndex}${s.LOG_EXTENSION}`;
            const stat = await app.vault.adapter.stat(latestFile);
            if (stat && stat.size >= s.LOG_MAX_SIZE_BYTES) highestIndex++; // Rotación por tamaño
        }

        this._activeLogPath = `${basePrefix}_${highestIndex}${s.LOG_EXTENSION}`;
        return this._activeLogPath;
    }

    async _write(level, controller, message, data = null) {
        // Degradación silenciosa — el Logger nunca debe romper la app
        if (!this.isInitialized) return;

        try {
            const filePath  = await this._getActiveLogFile();
            const timestamp = window.moment().format("YYYY-MM-DD HH:mm:ss.SSS");

            let dataStr = "";
            if (data !== null && data !== undefined) {
                try {
                    dataStr = ` | DATA: ${typeof data === "object" ? JSON.stringify(data) : String(data)}`;
                } catch (_) {
                    dataStr = " | DATA: [Error al serializar objeto]";
                }
            }

            const logEntry = `[${timestamp}] [${level}] [${controller}] ${message}${dataStr}\n`;
            const file     = app.vault.getAbstractFileByPath(filePath);

            if (file) {
                await app.vault.append(file, logEntry);
            } else {
                await app.vault.create(filePath, logEntry);
            }
        } catch (error) {
            // Fallback a consola si el vault no está disponible
            console.error(`[Logger] Error escribiendo log [${controller}]:`, error);
        }
    }

    // =========================================================================
    // API PÚBLICA
    // =========================================================================

    info(controller, message, data)  { this._write("INFO",  controller, message, data); }
    warn(controller, message, data)  { this._write("WARN",  controller, message, data); }
    error(controller, message, data) { this._write("ERROR", controller, message, data); }
    debug(controller, message, data) { this._write("DEBUG", controller, message, data); }
}