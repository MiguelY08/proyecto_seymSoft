const STORAGE_KEY  = 'pm_purchases';
const SEED_VERSION = 'purchases_v1';

// ─── Seed de compras de ejemplo ───────────────────────────────────────────────
const SEED_PURCHASES = [
  { id: 1,  numeroFacturacion: "FAC-001", fechaCompra: "2026-01-02", proveedor: "Papelería Central",      cantidadProductos: 12, precioTotal: 450000,  estado: "Completada", productos: [] },
  { id: 2,  numeroFacturacion: "FAC-002", fechaCompra: "2026-01-05", proveedor: "Distribuidora Tech",     cantidadProductos: 5,  precioTotal: 1200000, estado: "Devuelta",   productos: [] },
  { id: 3,  numeroFacturacion: "FAC-003", fechaCompra: "2026-01-08", proveedor: "Office Supplies SAS",    cantidadProductos: 20, precioTotal: 780000,  estado: "Completada", productos: [] },
  { id: 4,  numeroFacturacion: "FAC-004", fechaCompra: "2026-01-10", proveedor: "Importadora Global",     cantidadProductos: 8,  precioTotal: 350000,  estado: "Anulada",    productos: [], motivoAnulacion: "Productos en mal estado.", fechaAnulacion: "2026-01-11" },
  { id: 5,  numeroFacturacion: "FAC-005", fechaCompra: "2026-01-12", proveedor: "Papelería Central",      cantidadProductos: 15, precioTotal: 620000,  estado: "Devuelta",   productos: [] },
  { id: 6,  numeroFacturacion: "FAC-006", fechaCompra: "2026-01-15", proveedor: "Distribuidora Andina",   cantidadProductos: 7,  precioTotal: 410000,  estado: "Completada", productos: [] },
  { id: 7,  numeroFacturacion: "FAC-007", fechaCompra: "2026-01-18", proveedor: "Insumos Colombia",       cantidadProductos: 30, precioTotal: 1500000, estado: "Devuelta",   productos: [] },
  { id: 8,  numeroFacturacion: "FAC-008", fechaCompra: "2026-01-20", proveedor: "Proveedores del Norte",  cantidadProductos: 9,  precioTotal: 290000,  estado: "Completada", productos: [] },
  { id: 9,  numeroFacturacion: "FAC-009", fechaCompra: "2026-01-22", proveedor: "Papelería Central",      cantidadProductos: 4,  precioTotal: 180000,  estado: "Anulada",    productos: [], motivoAnulacion: "Proveedor no entregó a tiempo.", fechaAnulacion: "2026-01-23" },
  { id: 10, numeroFacturacion: "FAC-010", fechaCompra: "2026-01-25", proveedor: "Distribuidora Tech",     cantidadProductos: 11, precioTotal: 890000,  estado: "Completada", productos: [] },
  { id: 11, numeroFacturacion: "FAC-011", fechaCompra: "2026-01-27", proveedor: "Office Supplies SAS",    cantidadProductos: 6,  precioTotal: 260000,  estado: "Devuelta",   productos: [] },
  { id: 12, numeroFacturacion: "FAC-012", fechaCompra: "2026-01-29", proveedor: "Importadora Global",     cantidadProductos: 18, precioTotal: 980000,  estado: "Completada", productos: [] },
  { id: 13, numeroFacturacion: "FAC-013", fechaCompra: "2026-02-01", proveedor: "Insumos Colombia",       cantidadProductos: 14, precioTotal: 520000,  estado: "Devuelta",   productos: [] },
  { id: 14, numeroFacturacion: "FAC-014", fechaCompra: "2026-02-03", proveedor: "Distribuidora Andina",   cantidadProductos: 3,  precioTotal: 150000,  estado: "Completada", productos: [] },
  { id: 15, numeroFacturacion: "FAC-015", fechaCompra: "2026-02-05", proveedor: "Papelería Central",      cantidadProductos: 22, precioTotal: 1350000, estado: "Anulada",    productos: [], motivoAnulacion: "Error en facturación.", fechaAnulacion: "2026-02-06" },
  { id: 16, numeroFacturacion: "FAC-016", fechaCompra: "2026-02-07", proveedor: "Proveedores del Norte",  cantidadProductos: 10, precioTotal: 430000,  estado: "Completada", productos: [] },
  { id: 17, numeroFacturacion: "FAC-017", fechaCompra: "2026-02-09", proveedor: "Distribuidora Tech",     cantidadProductos: 13, precioTotal: 670000,  estado: "Devuelta",   productos: [] },
  { id: 18, numeroFacturacion: "FAC-018", fechaCompra: "2026-02-11", proveedor: "Office Supplies SAS",    cantidadProductos: 17, precioTotal: 910000,  estado: "Completada", productos: [] },
  { id: 19, numeroFacturacion: "FAC-019", fechaCompra: "2026-02-13", proveedor: "Insumos Colombia",       cantidadProductos: 2,  precioTotal: 95000,   estado: "Devuelta",   productos: [] },
  { id: 20, numeroFacturacion: "FAC-020", fechaCompra: "2026-02-15", proveedor: "Importadora Global",     cantidadProductos: 19, precioTotal: 1100000, estado: "Completada", productos: [] },
  { id: 21, numeroFacturacion: "FAC-021", fechaCompra: "2026-02-16", proveedor: "Papelería Central",      cantidadProductos: 16, precioTotal: 740000,  estado: "Anulada",    productos: [], motivoAnulacion: "Pedido duplicado.", fechaAnulacion: "2026-02-17" },
  { id: 22, numeroFacturacion: "FAC-022", fechaCompra: "2026-02-17", proveedor: "Distribuidora Andina",   cantidadProductos: 12, precioTotal: 480000,  estado: "Completada", productos: [] },
  { id: 23, numeroFacturacion: "FAC-023", fechaCompra: "2026-02-18", proveedor: "Proveedores del Norte",  cantidadProductos: 6,  precioTotal: 310000,  estado: "Devuelta",   productos: [] },
  { id: 24, numeroFacturacion: "FAC-024", fechaCompra: "2026-02-19", proveedor: "Office Supplies SAS",    cantidadProductos: 21, precioTotal: 1420000, estado: "Completada", productos: [] },
  { id: 25, numeroFacturacion: "FAC-025", fechaCompra: "2026-02-20", proveedor: "Insumos Colombia",       cantidadProductos: 9,  precioTotal: 370000,  estado: "Devuelta",   productos: [] },
  { id: 26, numeroFacturacion: "FAC-026", fechaCompra: "2026-02-21", proveedor: "Distribuidora Tech",     cantidadProductos: 25, precioTotal: 1680000, estado: "Completada", productos: [] },
];

// ─── Sembrar con control de versión ───────────────────────────────────────────
const seedPurchases = () => {
  try {
    const currentVersion = localStorage.getItem(`${STORAGE_KEY}_seed_version`);
    const stored         = localStorage.getItem(STORAGE_KEY);
    const parsed         = stored ? JSON.parse(stored) : [];

    if (parsed.length === 0 || currentVersion !== SEED_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PURCHASES));
      localStorage.setItem(`${STORAGE_KEY}_seed_version`, SEED_VERSION);
    }
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PURCHASES));
    localStorage.setItem(`${STORAGE_KEY}_seed_version`, SEED_VERSION);
  }
};

seedPurchases();

// ─── Servicio de Compras ──────────────────────────────────────────────────────
export const PurchasesDB = {

  list() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  _save(purchases) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
  },

  // Crear nueva compra
  create(data) {
    const purchases = this.list();
    const newId     = purchases.length > 0 ? Math.max(...purchases.map((p) => p.id)) + 1 : 1;

    const newPurchase = {
      id:                  newId,
      numeroFacturacion:   data.numeroFacturacion,
      fechaCompra:         data.fechaCompra,
      proveedor:           data.proveedor,
      cantidadProductos:   data.cantidadProductos,
      precioTotal:         data.precioTotal,
      estado:              'Completada',
      productos:           data.productos ?? [],
    };

    this._save([...purchases, newPurchase]);
    return newPurchase;
  },

  // Anular compra
  annul(id, motivo) {
    const purchases = this.list();
    const updated   = purchases.map((p) =>
      p.id === id
        ? {
            ...p,
            estado:          'Anulada',
            motivoAnulacion: motivo,
            fechaAnulacion:  new Date().toISOString().split('T')[0],
          }
        : p
    );
    this._save(updated);
    return updated;
  },

  // Eliminar compra
  delete(id) {
    const purchases = this.list().filter((p) => p.id !== id);
    this._save(purchases);
    return purchases;
  },
};

export default PurchasesDB;