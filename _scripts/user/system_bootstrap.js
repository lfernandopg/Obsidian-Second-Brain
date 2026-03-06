// =========================================================================
// 🚀 CLASE: SYSTEM BOOTSTRAP
// Responsabilidad única: extraer dependencias de FileClassMapper e
// inyectarlas en los evaluadores mediante sus métodos init().
// =========================================================================
class SystemBootstrap {
    constructor() {
        this.isReady = false;
    }

    /**
     * Inicializa todos los evaluadores del sistema.
     * Es idempotente: si ya se ejecutó, sale inmediatamente.
     * Debe llamarse como primera instrucción en cada macro de QuickAdd.
     */
    boot() {
        if (this.isReady) return;

        const { FileClassMapper, TaskEvaluator, ProjectEvaluator, Table } = customJS;

        // Validaciones...
        if (!FileClassMapper || !TaskEvaluator || !ProjectEvaluator || !Table) {
            throw new Error("SystemBootstrap: Faltan módulos en customJS.");
        }

        // ── Extraer diccionarios desde FileClassMapper ────────────────────
        const statusMap      = FileClassMapper.STATUS_MAP;
        const priorityMap    = FileClassMapper.PRIORITY_MAP;
        const sizeMap        = FileClassMapper.SIZE_MAP;
        const projectSizeMap = FileClassMapper.ALL_VALUES.projectSizeMap ?? {};
        const tablesConfig   = FileClassMapper.TABLES_CONFIG; // <-- NUEVO

        // ── Inyectar Dependencias ─────────────────────────────────────
        TaskEvaluator.init(statusMap, priorityMap, sizeMap);
        ProjectEvaluator.init(statusMap, priorityMap, projectSizeMap);
        Table.init(tablesConfig, statusMap); // <-- NUEVO: Inyectamos la tabla

        this.isReady = true;
    }
}