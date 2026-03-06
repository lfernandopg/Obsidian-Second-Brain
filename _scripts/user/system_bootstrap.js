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

        const { FileClassMapper, TaskEvaluator, ProjectEvaluator } = customJS;

        if (!FileClassMapper) {
            throw new Error("SystemBootstrap: FileClassMapper no está disponible en customJS.");
        }
        if (!TaskEvaluator) {
            throw new Error("SystemBootstrap: TaskEvaluator no está disponible en customJS.");
        }
        if (!ProjectEvaluator) {
            throw new Error("SystemBootstrap: ProjectEvaluator no está disponible en customJS.");
        }

        // ── Extraer diccionarios desde FileClassMapper ────────────────────
        const statusMap      = FileClassMapper.STATUS_MAP;
        const priorityMap    = FileClassMapper.PRIORITY_MAP;
        const sizeMap        = FileClassMapper.SIZE_MAP;               // taskSizeMap
        const projectSizeMap = FileClassMapper.ALL_VALUES.projectSizeMap ?? {};

        // ── Inyectar en TaskEvaluator ─────────────────────────────────────
        TaskEvaluator.init(statusMap, priorityMap, sizeMap);

        // ── Inyectar en ProjectEvaluator ──────────────────────────────────
        ProjectEvaluator.init(statusMap, priorityMap, projectSizeMap);

        this.isReady = true;
    }
}