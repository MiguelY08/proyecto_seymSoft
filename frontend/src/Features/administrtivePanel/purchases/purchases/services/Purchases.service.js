import { ProductsService } from "../../products/services/productsServices";

const STORAGE_KEY  = "pm_purchases";
const SEED_VERSION = "purchases_v3"; // ← bumped: productos desde ProductsService

// ─── Helper de cálculo de totales ────────────────────────────────────────────
const calcTotal = (productos) =>
  productos.reduce((sum, p) => {
    const subtotal = p.valorUnit * p.cantidad;
    return sum + subtotal + Math.round(subtotal * (p.iva / 100));
  }, 0);

/**
 * Construye un producto de compra a partir del catálogo real.
 * Usa precioMayorista como valorUnit (precio de costo al proveedor).
 *
 * @param {string} codBarras  - código de barras del producto en ProductsService
 * @param {number} cantidad   - unidades compradas
 * @returns {Object|null}
 */
const fromCatalog = (codBarras, cantidad) => {
  const producto = ProductsService.list().find((p) => p.codBarras === codBarras);
  if (!producto) return null;
  return {
    nombre:       producto.nombre,
    codigoBarras: producto.codBarras,
    valorUnit:    producto.precioMayorista,
    iva:          19,
    cantidad,
  };
};

// ─── Alias cortos para el seed ────────────────────────────────────────────────
// Barras de los 10 productos del catálogo
const BAR = {
  libreta:   "7701234000011",  // Libreta con Lapicero         – precioMayorista: 4200
  silicona:  "7701234000022",  // Silicona Líquida ET131        – precioMayorista: 2400
  resma:     "7701234000033",  // Resma Papel Bond A4 500 Hojas – precioMayorista: 15800
  boligrafo: "7701234000044",  // Bolígrafo Kilométrico x12     – precioMayorista: 6900
  colores:   "7701234000055",  // Caja de Colores 24 Und        – precioMayorista: 10000
  corrector: "7701234000066",  // Corrector Líquido Faster      – precioMayorista: 2800
  carpeta:   "7701234000077",  // Carpeta Argollada Oficio      – precioMayorista: 8200
  tijeras:   "7701234000088",  // Tijeras Escolar Punta Roma    – precioMayorista: 3500
  marcador:  "7701234000099",  // Marcadores Borrables x6       – precioMayorista: 9600
  block:     "7701234000100",  // Block Cuadriculado 50 Hojas   – precioMayorista: 3100
};

const p = (key, cantidad) => fromCatalog(BAR[key], cantidad);

// ─── Seed de compras ──────────────────────────────────────────────────────────
// FAC-001 y FAC-003 tienen productos que coinciden con el seed de devoluciones:
//   FAC-001-1 devuelve: Libreta (7701234000011)
//   FAC-003-1 devuelve: Bolígrafo (7701234000044) y Block (7701234000100)
const buildSeed = () => {
  const purchases = [
    {
      id: 1,  numeroFacturacion: "FAC-001", fechaCompra: "2026-01-02",
      proveedor: "Papelería Central", estado: "Completada",
      productos: [p("libreta", 12), p("boligrafo", 20), p("corrector", 8)].filter(Boolean),
    },
    {
      id: 2,  numeroFacturacion: "FAC-002", fechaCompra: "2026-01-05",
      proveedor: "Distribuidora Tech", estado: "Completada",
      productos: [p("boligrafo", 10), p("carpeta", 5), p("marcador", 8)].filter(Boolean),
    },
    {
      id: 3,  numeroFacturacion: "FAC-003", fechaCompra: "2026-01-08",
      proveedor: "Office Supplies SAS", estado: "Completada",
      productos: [p("boligrafo", 10), p("block", 8), p("resma", 5), p("silicona", 12)].filter(Boolean),
    },
    {
      id: 4,  numeroFacturacion: "FAC-004", fechaCompra: "2026-01-10",
      proveedor: "Importadora Global", estado: "Anulada",
      motivoAnulacion: "Productos recibidos en mal estado.", fechaAnulacion: "2026-01-11",
      productos: [p("colores", 6), p("tijeras", 8)].filter(Boolean),
    },
    {
      id: 5,  numeroFacturacion: "FAC-005", fechaCompra: "2026-01-12",
      proveedor: "Papelería Central", estado: "Completada",
      productos: [p("resma", 8), p("libreta", 15), p("boligrafo", 30)].filter(Boolean),
    },
    {
      id: 6,  numeroFacturacion: "FAC-006", fechaCompra: "2026-01-15",
      proveedor: "Distribuidora Andina", estado: "Completada",
      productos: [p("carpeta", 7), p("marcador", 6), p("corrector", 10)].filter(Boolean),
    },
    {
      id: 7,  numeroFacturacion: "FAC-007", fechaCompra: "2026-01-18",
      proveedor: "Insumos Colombia", estado: "Completada",
      productos: [p("block", 20), p("silicona", 18), p("libreta", 12), p("boligrafo", 50)].filter(Boolean),
    },
    {
      id: 8,  numeroFacturacion: "FAC-008", fechaCompra: "2026-01-20",
      proveedor: "Proveedores del Norte", estado: "Completada",
      productos: [p("boligrafo", 6), p("corrector", 9), p("tijeras", 5)].filter(Boolean),
    },
    {
      id: 9,  numeroFacturacion: "FAC-009", fechaCompra: "2026-01-22",
      proveedor: "Papelería Central", estado: "Anulada",
      motivoAnulacion: "Proveedor no entregó a tiempo.", fechaAnulacion: "2026-01-23",
      productos: [p("libreta", 4), p("boligrafo", 10)].filter(Boolean),
    },
    {
      id: 10, numeroFacturacion: "FAC-010", fechaCompra: "2026-01-25",
      proveedor: "Distribuidora Tech", estado: "Completada",
      productos: [p("resma", 6), p("carpeta", 8), p("marcador", 5), p("colores", 4)].filter(Boolean),
    },
    {
      id: 11, numeroFacturacion: "FAC-011", fechaCompra: "2026-01-27",
      proveedor: "Office Supplies SAS", estado: "Completada",
      productos: [p("silicona", 12), p("block", 10), p("corrector", 6)].filter(Boolean),
    },
    {
      id: 12, numeroFacturacion: "FAC-012", fechaCompra: "2026-01-29",
      proveedor: "Importadora Global", estado: "Completada",
      productos: [p("libreta", 10), p("tijeras", 12), p("libreta", 8), p("boligrafo", 20)].filter(Boolean),
    },
    {
      id: 13, numeroFacturacion: "FAC-013", fechaCompra: "2026-02-01",
      proveedor: "Insumos Colombia", estado: "Completada",
      productos: [p("boligrafo", 14), p("corrector", 8), p("block", 12)].filter(Boolean),
    },
    {
      id: 14, numeroFacturacion: "FAC-014", fechaCompra: "2026-02-03",
      proveedor: "Distribuidora Andina", estado: "Completada",
      productos: [p("carpeta", 5), p("marcador", 6)].filter(Boolean),
    },
    {
      id: 15, numeroFacturacion: "FAC-015", fechaCompra: "2026-02-05",
      proveedor: "Papelería Central", estado: "Anulada",
      motivoAnulacion: "Error en facturación.", fechaAnulacion: "2026-02-06",
      productos: [p("resma", 10), p("libreta", 15), p("boligrafo", 40)].filter(Boolean),
    },
    {
      id: 16, numeroFacturacion: "FAC-016", fechaCompra: "2026-02-07",
      proveedor: "Proveedores del Norte", estado: "Completada",
      productos: [p("colores", 6), p("tijeras", 8), p("silicona", 10)].filter(Boolean),
    },
    {
      id: 17, numeroFacturacion: "FAC-017", fechaCompra: "2026-02-09",
      proveedor: "Distribuidora Tech", estado: "Completada",
      productos: [p("libreta", 12), p("boligrafo", 8), p("corrector", 6), p("block", 10)].filter(Boolean),
    },
    {
      id: 18, numeroFacturacion: "FAC-018", fechaCompra: "2026-02-11",
      proveedor: "Office Supplies SAS", estado: "Completada",
      productos: [p("resma", 8), p("carpeta", 10), p("marcador", 6), p("boligrafo", 20)].filter(Boolean),
    },
    {
      id: 19, numeroFacturacion: "FAC-019", fechaCompra: "2026-02-13",
      proveedor: "Insumos Colombia", estado: "Completada",
      productos: [p("libreta", 6), p("corrector", 4)].filter(Boolean),
    },
    {
      id: 20, numeroFacturacion: "FAC-020", fechaCompra: "2026-02-15",
      proveedor: "Importadora Global", estado: "Completada",
      productos: [p("tijeras", 10), p("silicona", 12), p("block", 15), p("colores", 8)].filter(Boolean),
    },
    {
      id: 21, numeroFacturacion: "FAC-021", fechaCompra: "2026-02-16",
      proveedor: "Papelería Central", estado: "Anulada",
      motivoAnulacion: "Pedido duplicado.", fechaAnulacion: "2026-02-17",
      productos: [p("resma", 8), p("libreta", 12), p("boligrafo", 24)].filter(Boolean),
    },
    {
      id: 22, numeroFacturacion: "FAC-022", fechaCompra: "2026-02-17",
      proveedor: "Distribuidora Andina", estado: "Completada",
      productos: [p("libreta", 8), p("boligrafo", 6), p("carpeta", 5), p("marcador", 4)].filter(Boolean),
    },
    {
      id: 23, numeroFacturacion: "FAC-023", fechaCompra: "2026-02-18",
      proveedor: "Proveedores del Norte", estado: "Completada",
      productos: [p("corrector", 8), p("block", 10), p("silicona", 6)].filter(Boolean),
    },
    {
      id: 24, numeroFacturacion: "FAC-024", fechaCompra: "2026-02-19",
      proveedor: "Office Supplies SAS", estado: "Completada",
      productos: [p("resma", 10), p("tijeras", 12), p("libreta", 15), p("boligrafo", 30)].filter(Boolean),
    },
    {
      id: 25, numeroFacturacion: "FAC-025", fechaCompra: "2026-02-20",
      proveedor: "Insumos Colombia", estado: "Completada",
      productos: [p("colores", 6), p("marcador", 8), p("boligrafo", 5)].filter(Boolean),
    },
    {
      id: 26, numeroFacturacion: "FAC-026", fechaCompra: "2026-02-21",
      proveedor: "Distribuidora Tech", estado: "Completada",
      productos: [p("libreta", 12), p("carpeta", 10), p("corrector", 8), p("block", 15), p("boligrafo", 25)].filter(Boolean),
    },
  ];

  // Calcular cantidadProductos y precioTotal automáticamente
  return purchases.map((c) => ({
    ...c,
    cantidadProductos: c.productos.length,
    precioTotal:       calcTotal(c.productos),
  }));
};

// ─── Sembrar con control de versión ───────────────────────────────────────────
const seedPurchases = () => {
  try {
    const currentVersion = localStorage.getItem(`${STORAGE_KEY}_seed_version`);
    const stored         = localStorage.getItem(STORAGE_KEY);
    const parsed         = stored ? JSON.parse(stored) : [];

    if (parsed.length === 0 || currentVersion !== SEED_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSeed()));
      localStorage.setItem(`${STORAGE_KEY}_seed_version`, SEED_VERSION);
    }
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSeed()));
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

    const productos = data.productos ?? [];
    const newPurchase = {
      id:                newId,
      numeroFacturacion: data.numeroFacturacion,
      fechaCompra:       data.fechaCompra,
      proveedor:         data.proveedor,
      cantidadProductos: productos.length,
      precioTotal:       data.precioTotal ?? calcTotal(productos),
      estado:            "Completada",
      productos,
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
            estado:          "Anulada",
            motivoAnulacion: motivo,
            fechaAnulacion:  new Date().toISOString().split("T")[0],
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