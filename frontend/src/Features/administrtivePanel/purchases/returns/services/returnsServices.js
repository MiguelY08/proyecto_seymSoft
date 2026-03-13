import { PurchasesDB } from "../../purchases/services/Purchases.service";

const STORAGE_KEY  = "pm_returns";
const SEED_VERSION = "returns_v2"; // ← bumped: codBarras alineados con ProductsService

// ─── Seed de devoluciones de ejemplo ─────────────────────────────────────────
// Productos alineados con Purchases.service.js (purchases_v3):
//   FAC-001 tiene: Libreta (7701234000011), Bolígrafo (7701234000044), Corrector (7701234000066)
//   FAC-003 tiene: Bolígrafo (7701234000044), Block (7701234000100), Resma (7701234000033), Silicona (7701234000022)
const SEED_RETURNS = [
  {
    id:              "FAC-001-1",
    idCompra:        "FAC-001",
    fechaDevolucion: "2026-01-10",
    productos: [
      {
        nombre:           "Libreta con Lapicero",
        codigoBarras:     "7701234000011",
        valorUnit:        4200,
        iva:              19,
        cantidadComprada: 12,
        cantidadDevolver: 4,
        motivo:           "Prod. en mal estado",
        tipoDevolucion:   "Reemplazo",
        estado:           "Recibido",
      },
    ],
  },
  {
    id:              "FAC-003-1",
    idCompra:        "FAC-003",
    fechaDevolucion: "2026-01-15",
    productos: [
      {
        nombre:           "Bolígrafo Kilométrico x12",
        codigoBarras:     "7701234000044",
        valorUnit:        6900,
        iva:              19,
        cantidadComprada: 10,
        cantidadDevolver: 5,
        motivo:           "Prod. incorrecto",
        tipoDevolucion:   "Sin reemplazo",
        estado:           "Pend. envío",
      },
      {
        nombre:           "Block Cuadriculado 50 Hojas",
        codigoBarras:     "7701234000100",
        valorUnit:        3100,
        iva:              19,
        cantidadComprada: 8,
        cantidadDevolver: 3,
        motivo:           "Insatisfecho",
        tipoDevolucion:   "Sin reemplazo",
        estado:           "Enviado",
      },
    ],
  },
];

// ─── Sembrar con control de versión ───────────────────────────────────────────
const seedReturns = () => {
  try {
    const currentVersion = localStorage.getItem(`${STORAGE_KEY}_seed_version`);
    const stored         = localStorage.getItem(STORAGE_KEY);
    const parsed         = stored ? JSON.parse(stored) : [];

    if (parsed.length === 0 || currentVersion !== SEED_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RETURNS));
      localStorage.setItem(`${STORAGE_KEY}_seed_version`, SEED_VERSION);

      // Sincronizar estados de las compras del seed
      SEED_RETURNS.forEach((ret) => {
        ReturnsDB._syncPurchaseState(ret.idCompra);
      });
    }
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RETURNS));
    localStorage.setItem(`${STORAGE_KEY}_seed_version`, SEED_VERSION);
  }
};

// ─── Servicio de Devoluciones ─────────────────────────────────────────────────
export const ReturnsDB = {

  // ── Lectura ────────────────────────────────────────────────────────────────

  list() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  findById(id) {
    return this.list().find((r) => r.id === id) ?? null;
  },

  /** Devuelve todas las devoluciones que pertenecen a una compra */
  findByPurchase(idCompra) {
    return this.list().filter((r) => r.idCompra === idCompra);
  },

  // ── Persistencia ───────────────────────────────────────────────────────────

  _save(returns) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
  },

  // ── Generación de ID ───────────────────────────────────────────────────────

  /**
   * Genera el próximo id para una devolución de una compra.
   * Si FAC-001 ya tiene FAC-001-1 y FAC-001-2, el siguiente es FAC-001-3.
   */
  _nextId(idCompra) {
    const existing = this.findByPurchase(idCompra);
    const max = existing.reduce((acc, r) => {
      const parts = r.id.split("-");
      const num   = parseInt(parts[parts.length - 1], 10);
      return isNaN(num) ? acc : Math.max(acc, num);
    }, 0);
    return `${idCompra}-${max + 1}`;
  },

  // ── Cálculo de estado general ──────────────────────────────────────────────

  /**
   * Calcula el estado general de una devolución a partir de sus productos.
   *
   * Estados terminales por tipo:
   *   Reemplazo     → "Recibido"
   *   Sin reemplazo → "Enviado"
   *
   * Resultado:
   *   - "Procesada x/x"  si todos los productos están en estado terminal
   *   - "Aprobada  x/y"  si al menos uno no ha terminado
   *   - "Anulada"        si la devolución fue anulada manualmente
   */
  _calculateState(devolucion) {
    if (devolucion.estado === "Anulada") return "Anulada";

    const productos = devolucion.productos ?? [];
    const total     = productos.length;

    if (total === 0) return "Aprobada 0/0";

    const terminados = productos.filter((p) =>
      p.tipoDevolucion === "Reemplazo"
        ? p.estado === "Recibido"
        : p.estado === "Enviado"
    ).length;

    const prefix = terminados === total ? "Procesada" : "Aprobada";
    return `${prefix} ${terminados}/${total}`;
  },

  // ── Sincronización del estado de la compra original ────────────────────────

  /**
   * Revisa todas las devoluciones de una compra y actualiza su estado:
   *   - Si alguna devolución NO es "Procesada" ni "Anulada" → "Proc. devolución"
   *   - Si todas son "Procesada" o "Anulada"               → "Completada*"
   */
  _syncPurchaseState(idCompra) {
    const devoluciones = this.findByPurchase(idCompra);

    if (devoluciones.length === 0) return;

    const activas = devoluciones.filter(
      (r) => r.estado !== "Anulada" && !r.estado?.startsWith("Procesada")
    );

    const nuevoEstado = activas.length > 0 ? "Proc. devolución" : "Completada*";

    const purchases = PurchasesDB.list();
    const updated   = purchases.map((p) =>
      p.numeroFacturacion === idCompra ? { ...p, estado: nuevoEstado } : p
    );
    PurchasesDB._save(updated);
  },

  // ── CRUD ───────────────────────────────────────────────────────────────────

  /**
   * Actualiza los productos de una devolución existente.
   * Recalcula el estado general y sincroniza la compra original.
   * @param {string} idDevolucion - id de la devolución (ej. "FAC-001-1")
   * @param {Array}  productos    - lista actualizada de productos con sus datos
   * @returns {Object} devolución actualizada
   */
  update(idDevolucion, productos) {
    const returns = this.list();
    const updated = returns.map((r) => {
      if (r.id !== idDevolucion) return r;
      const devolucionActualizada = { ...r, productos };
      devolucionActualizada.estado = this._calculateState(devolucionActualizada);
      return devolucionActualizada;
    });
    this._save(updated);
    const devolucion = updated.find((r) => r.id === idDevolucion);
    if (devolucion) this._syncPurchaseState(devolucion.idCompra);
    return devolucion;
  },


  /**
   * Crea una nueva devolución.
   * @param {string} idCompra   - numeroFacturacion de la compra
   * @param {Array}  productos  - productos seleccionados con sus datos
   * @returns {Object} devolución creada con id y estado calculados
   */
  create(idCompra, productos) {
    const returns = this.list();

    const nuevaDevolucion = {
      id:              this._nextId(idCompra),
      idCompra,
      fechaDevolucion: new Date().toISOString().split("T")[0],
      productos,
    };

    // Calcular estado inicial (siempre "Aprobada 0/n" al crear)
    nuevaDevolucion.estado = this._calculateState(nuevaDevolucion);

    this._save([...returns, nuevaDevolucion]);
    this._syncPurchaseState(idCompra);

    return nuevaDevolucion;
  },

  /**
   * Actualiza el estado de un producto dentro de una devolución.
   * Recalcula el estado general de la devolución y sincroniza la compra.
   *
   * @param {string} idDevolucion  - id de la devolución (ej. "FAC-001-1")
   * @param {string} codigoBarras  - identificador del producto
   * @param {string} nuevoEstado   - nuevo estado del producto
   */
  updateProductState(idDevolucion, codigoBarras, nuevoEstado) {
    const returns = this.list();

    const updated = returns.map((r) => {
      if (r.id !== idDevolucion) return r;

      const productosActualizados = r.productos.map((p) =>
        p.codigoBarras === codigoBarras ? { ...p, estado: nuevoEstado } : p
      );

      const devolucionActualizada = {
        ...r,
        productos: productosActualizados,
      };

      devolucionActualizada.estado = this._calculateState(devolucionActualizada);
      return devolucionActualizada;
    });

    this._save(updated);

    const devolucion = updated.find((r) => r.id === idDevolucion);
    if (devolucion) this._syncPurchaseState(devolucion.idCompra);

    return updated;
  },

  /**
   * Anula una devolución completa.
   * Sincroniza el estado de la compra original tras la anulación.
   *
   * @param {string} idDevolucion - id de la devolución a anular
   * @param {string} motivo       - motivo de la anulación
   */
  annul(idDevolucion, motivo) {
    const returns = this.list();

    const updated = returns.map((r) =>
      r.id === idDevolucion
        ? {
            ...r,
            estado:          "Anulada",
            motivoAnulacion: motivo,
            fechaAnulacion:  new Date().toISOString().split("T")[0],
          }
        : r
    );

    this._save(updated);

    const devolucion = updated.find((r) => r.id === idDevolucion);
    if (devolucion) this._syncPurchaseState(devolucion.idCompra);

    return updated;
  },
};

seedReturns();

export default ReturnsDB;