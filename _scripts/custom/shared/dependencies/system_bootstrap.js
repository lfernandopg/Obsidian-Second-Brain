// =========================================================================
// 🚀 CLASE: SYSTEM BOOTSTRAP
// Responsabilidad única: orquestar la inicialización del sistema completo.
//
// Orden de arranque garantizado:
//   1. Settings    (lee el vault)
//   2. FileClassMapper (recibe Settings)
//   3. Logger      (recibe Settings)
//   4. Messages    (sin deps)
//   5. TaskEvaluator    (recibe Settings + FileClassMapper)
//   6. ProjectEvaluator (recibe Settings + FileClassMapper)
//   7. Table            (recibe Settings + FileClassMapper)
//
// Es idempotente (boot() repetido no re-inicializa) y re-entrancy-safe.
// =========================================================================
class SystemBootstrap {

    constructor() {
        // Constructor vacío — requerimiento CustomJS
        this.isReady    = false;
        this._isBooting = false;
    }

    // =========================================================================
    // BOOT
    // =========================================================================

    /**
     * Inicializa todo el sistema.
     * Debe ser la PRIMERA instrucción en cada macro de QuickAdd.
     *
     * @throws {Error} Si algún módulo falta o si la configuración es inválida.
     */
    boot() {
        // Guarda 1: ya inicializado → salir rápido (idempotente)
        if (this.isReady) return;

        // Guarda 2: boot en progreso → evitar doble inicialización parcial
        if (this._isBooting) {
            console.warn(
                "[SystemBootstrap] boot() fue llamado mientras ya estaba en progreso. " +
                "Llamada ignorada para evitar re-inicialización parcial."
            );
            return;
        }

        this._isBooting = true;

        try {
            // ── PASO 1: Verificar presencia de todos los módulos ──────────
            this._assertModules();

            const {
                Settings, FileClassMapper,
                Logger, Messages,
                TaskEvaluator, ProjectEvaluator, Table,
            } = customJS;

            // ── PASO 2: Settings (lee el vault) ───────────────────────────
            Settings.init();

            // ── PASO 3: Logger (recibe Settings) ──────────────────────────
            // Se inicializa antes que FileClassMapper para poder loggear
            // cualquier error subsecuente.
            Logger.init(Settings);

            // ── PASO 4: Messages (sin dependencias) ───────────────────────
            Messages.init();

            Logger.info("SystemBootstrap", "Iniciando boot del sistema...");

            // ── PASO 5: FileClassMapper (recibe Settings) ─────────────────
            FileClassMapper.init(Settings);

            Logger.info("SystemBootstrap", "FileClassMapper inicializado.", {
                fileClasses: Settings.FILE_CLASS_LIST
            });

            // ── PASO 6: Evaluadores (reciben Settings + FileClassMapper) ──
            TaskEvaluator.init(Settings, FileClassMapper);
            ProjectEvaluator.init(Settings, FileClassMapper);
            Table.init(Settings, FileClassMapper);

            Logger.info("SystemBootstrap", "Todos los módulos inicializados correctamente.", {
                modules: [
                    "Settings", "FileClassMapper", "Logger", "Messages",
                    "TaskEvaluator", "ProjectEvaluator", "Table"
                ]
            });

            this.isReady = true;

        } catch (err) {
            // Si boot() falla, resetear _isBooting para permitir reintentos
            // tras resolver el problema. NO poner isReady a true.
            console.error("[SystemBootstrap] Error crítico durante el arranque:", err);
            throw err; // Re-lanzar para que el caller muestre el Notice

        } finally {
            // Siempre liberar el flag de "en progreso"
            this._isBooting = false;
        }
    }

    // ─────────────────────────────────────────────
    // PRIVADOS
    // ─────────────────────────────────────────────

    _assertModules() {
        const required = [
            "Settings",
            "FileClassMapper",
            "Logger",
            "Messages",
            "TaskEvaluator",
            "ProjectEvaluator",
            "Table",
            "Utils",
        ];

        const missing = required.filter(name => !customJS[name]);

        if (missing.length > 0) {
            throw new Error(
                `[SystemBootstrap] Módulos ausentes en customJS: ${missing.map(n => `❌ ${n}`).join(", ")}. ` +
                `Verifica que todos los archivos estén en la carpeta de CustomJS y que el plugin haya terminado de cargar.`
            );
        }
    }

    // =========================================================================
    // UTILIDADES
    // =========================================================================

    /**
     * Resetea el estado del bootstrap.
     * Útil para forzar re-inicialización tras cambios en _config/*.
     * No debe usarse en producción.
     */
    reset() {
        this.isReady    = false;
        this._isBooting = false;
        console.log("[SystemBootstrap] Estado reseteado. El próximo boot() re-inicializará todos los módulos.");
    }
}