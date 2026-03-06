// =========================================================================
// 🚀 CLASE: SYSTEM BOOTSTRAP
// Responsabilidad única: extraer dependencias de FileClassMapper e
// inyectarlas en los evaluadores mediante sus métodos init().
// =========================================================================
class SystemBootstrap {
    constructor() {
        this.isReady   = false;
        // [FIX V-12] Flag adicional para detectar llamadas concurrentes.
        // En el modelo single-thread de JS esto es improbable con el código
        // actual (boot() es síncrono), pero se vuelve crítico si boot()
        // llegara a incluir awaits en el futuro. El flag lo hace seguro
        // por diseño desde ahora, sin coste alguno.
        this._isBooting = false;
    }

    /**
     * Inicializa todos los evaluadores del sistema.
     *
     * Es idempotente: si ya se ejecutó con éxito (isReady === true), retorna
     * inmediatamente sin re-inicializar nada.
     *
     * Es re-entrancy-safe: si una llamada concurrente llega mientras boot()
     * ya está en progreso (relevante si se añaden awaits en el futuro),
     * la segunda llamada retorna sin pisar el estado que está construyendo
     * la primera.
     *
     * Debe llamarse como primera instrucción en cada macro de QuickAdd.
     */
    boot() {
        // Guarda 1: ya inicializado correctamente → salir rápido
        if (this.isReady) return;

        // [FIX V-12] Guarda 2: boot en progreso → evitar doble init
        if (this._isBooting) {
            console.warn(
                "[SystemBootstrap] boot() fue llamado mientras ya estaba en progreso. " +
                "Llamada ignorada para evitar re-inicialización parcial. " +
                "Si esto ocurre frecuentemente, verifica que tus macros no se solapen."
            );
            return;
        }

        this._isBooting = true;

        try {
            const { FileClassMapper, TaskEvaluator, ProjectEvaluator, Table } = customJS;

            if (!FileClassMapper || !TaskEvaluator || !ProjectEvaluator || !Table) {
                throw new Error(
                    "SystemBootstrap: Faltan módulos en customJS. " +
                    "Módulos encontrados: " +
                    [
                        FileClassMapper  ? "FileClassMapper"  : "❌ FileClassMapper",
                        TaskEvaluator    ? "TaskEvaluator"    : "❌ TaskEvaluator",
                        ProjectEvaluator ? "ProjectEvaluator" : "❌ ProjectEvaluator",
                        Table            ? "Table"            : "❌ Table",
                    ].join(", ")
                );
            }

            // ── Extraer diccionarios desde FileClassMapper ────────────────
            const statusMap      = FileClassMapper.STATUS_MAP;
            const priorityMap    = FileClassMapper.PRIORITY_MAP;
            const sizeMap        = FileClassMapper.SIZE_MAP;
            const projectSizeMap = FileClassMapper.ALL_VALUES.projectSizeMap ?? {};
            const tablesConfig   = FileClassMapper.TABLES_CONFIG;

            // ── Validación de los mapas extraídos ─────────────────────────
            // Si los mapas están vacíos, algo falló en FileClassMapper al leer
            // _config/values.md o _config/tables.md. Mejor fallar aquí con un
            // mensaje claro que propagar valores vacíos a los motores.
            if (!statusMap || Object.keys(statusMap).length === 0) {
                throw new Error("SystemBootstrap: statusMap está vacío. Verifica '_config/values.md'.");
            }
            if (!priorityMap || Object.keys(priorityMap).length === 0) {
                throw new Error("SystemBootstrap: priorityMap está vacío. Verifica '_config/values.md'.");
            }

            // ── Inyectar Dependencias ─────────────────────────────────────
            TaskEvaluator.init(statusMap, priorityMap, sizeMap);
            ProjectEvaluator.init(statusMap, priorityMap, projectSizeMap);
            Table.init(tablesConfig, statusMap);

            this.isReady = true;

        } catch (err) {
            // [FIX V-12] Si boot() falla, reseteamos _isBooting para que
            // una llamada posterior pueda reintentar (ej. tras resolver el
            // problema de configuración). NO ponemos isReady a true.
            console.error("[SystemBootstrap] Error durante el arranque:", err);
            throw err; // Re-lanzar para que el caller (la macro) muestre el Notice de error

        } finally {
            // Siempre liberar el flag de "en progreso"
            this._isBooting = false;
        }
    }

    /**
     * Resetea el estado del bootstrap. Útil para forzar una re-inicialización
     * completa en desarrollo o tras cambios en _config/*.
     * No debería llamarse en producción salvo en casos de depuración.
     */
    reset() {
        this.isReady    = false;
        this._isBooting = false;
        console.log("[SystemBootstrap] Estado reseteado. El próximo boot() re-inicializará todos los módulos.");
    }
}