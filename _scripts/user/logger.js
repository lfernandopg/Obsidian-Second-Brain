// Ruta: _scripts/user/logger.js

class Logger {
    constructor() {
        this.logFolder = "_logs";
        this.prefix = "syslog_";
        this.extension = ".txt";
        this.rotation = "monthly"; // "daily" | "weekly" | "monthly"
        
        // 10 MB expresados en bytes
        this.maxSizeBytes = 10 * 1024 * 1024; 
        
        // Caché en memoria para no consultar el file system innecesariamente
        this._activeLogPath = null;
    }

    /**
     * Resuelve cuál es el archivo activo. Maneja la rotación temporal y por tamaño.
     */
    async _getActiveLogFile() {
        const date = window.moment();
        let timeFormat;
        
        switch (this.rotation) {
            case "daily": timeFormat = "YYYY-MM-DD"; break;
            case "weekly": timeFormat = "YYYY-[W]ww"; break;
            case "monthly": timeFormat = "YYYY-MM"; break;
            default: timeFormat = "YYYY-MM";
        }
        
        const timeStr = date.format(timeFormat);
        const basePrefix = `${this.logFolder}/${this.prefix}${timeStr}`;
        
        await customJS.Utils.ensureFolderExists(app, this.logFolder);
        
        // 1. Verificación rápida en caché
        if (this._activeLogPath && this._activeLogPath.startsWith(basePrefix)) {
            try {
                const stat = await app.vault.adapter.stat(this._activeLogPath);
                if (stat && stat.size < this.maxSizeBytes) {
                    return this._activeLogPath;
                }
            } catch (e) {
                // El archivo en caché fue borrado o movido; se recalcula.
            }
        }

        // 2. Si no hay caché válido, se escanea el directorio
        let highestIndex = 1;
        const folderExists = await app.vault.adapter.exists(this.logFolder);
        
        if (folderExists) {
            const list = await app.vault.adapter.list(this.logFolder);
            // Filtrar archivos del ciclo temporal actual
            const matchingFiles = list.files.filter(f => 
                f.startsWith(basePrefix) && f.endsWith(this.extension)
            );
            
            if (matchingFiles.length > 0) {
                // Extraer el índice numérico de los archivos (ej. syslog_2026-03_1.txt -> 1)
                const indices = matchingFiles.map(f => {
                    const match = f.match(/_(\d+)\.txt$/);
                    return match ? parseInt(match[1], 10) : 1;
                });
                
                highestIndex = Math.max(...indices);
                
                // Verificar si el archivo con el índice más alto ya alcanzó los 10MB
                const latestFile = `${basePrefix}_${highestIndex}${this.extension}`;
                const stat = await app.vault.adapter.stat(latestFile);
                
                if (stat && stat.size >= this.maxSizeBytes) {
                    highestIndex++; // Rotación por tamaño superado
                }
            }
        }
        
        // Actualizar la caché y retornar
        this._activeLogPath = `${basePrefix}_${highestIndex}${this.extension}`;
        return this._activeLogPath;
    }

    /**
     * Motor interno de escritura.
     */
    async _write(level, controller, message, data = null) {
        if (!app || !customJS?.Utils) return;

        try {
            const filePath = await this._getActiveLogFile();
            
            // Timestamp con milisegundos
            const timestamp = window.moment().format("YYYY-MM-DD HH:mm:ss.SSS");
            
            // Serialización segura de la data (inline para formato txt)
            let dataStr = "";
            if (data !== null && data !== undefined) {
                try {
                    dataStr = typeof data === "object" ? JSON.stringify(data) : String(data);
                    dataStr = ` | DATA: ${dataStr}`;
                } catch (e) {
                    dataStr = ` | DATA: [Error al serializar objeto]`;
                }
            }

            // Formato de línea solicitado
            const logEntry = `[${timestamp}] [${level}] [${controller}] ${message}${dataStr}\n`;

            const file = app.vault.getAbstractFileByPath(filePath);
            
            if (file) {
                await app.vault.append(file, logEntry);
            } else {
                await app.vault.create(filePath, logEntry);
            }
        } catch (error) {
            console.error(`[Logger] Error escribiendo log de ${controller}:`, error);
        }
    }

    // ── API Pública ───────────────────────────────────────────────

    info(controller, message, data)  { this._write("INFO", controller, message, data); }
    warn(controller, message, data)  { this._write("WARN", controller, message, data); }
    error(controller, message, data) { this._write("ERROR", controller, message, data); }
    debug(controller, message, data) { this._write("DEBUG", controller, message, data); }
}