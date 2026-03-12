const PRODUCTS_KEY = 'pm_products';
const SEED_VERSION = 'products_v4';  // ← bumped: fuerza reseed con categorías corregidas
const VERSION_KEY  = 'pm_products_version';

// ─── Nombres de categoría alineados con categoriesService.js ─────────────────
// Activas:   "Oficina" | "Útiles Escolares" | "Arte y Manualidades"
// Inactivas: "Escritura y Corrección" | "Tecnología"  (no se usan en seed)

const SEED_PRODUCTS = [
  {
    id: 1, activo: true,
    nombre: 'Libreta con Lapicero', codBarras: '7701234000011', referencia: 'REF-001',
    proveedor: 'Papelera El Punto S.A.S',
    categorias: ['Útiles Escolares'],
    descripcion: '', imagen: null,
    stock: 200, cantidadXPaca: 12,
    precioDetalle: 5000,  precioDetallePaca: 4500,
    precioMayorista: 4200, precioMayoristaPaca: 3800,
    precioColegas: 3800,  precioColegasPaca: 3400,
    precioPacas: 3500,    precioPacasPaca: 3000,
  },
  {
    id: 2, activo: true,
    nombre: 'Silicona Líquida ET131', codBarras: '7701234000022', referencia: 'REF-002',
    proveedor: 'Distribuciones Andina Ltda.',
    categorias: ['Arte y Manualidades'],
    descripcion: '', imagen: null,
    stock: 500, cantidadXPaca: 24,
    precioDetalle: 2900,  precioDetallePaca: 2600,
    precioMayorista: 2400, precioMayoristaPaca: 2100,
    precioColegas: 2100,  precioColegasPaca: 1800,
    precioPacas: 1900,    precioPacasPaca: 1600,
  },
  {
    id: 3, activo: true,
    nombre: 'Resma Papel Bond A4 500 Hojas', codBarras: '7701234000033', referencia: 'REF-003',
    proveedor: 'Industrias Bolívar S.A.',
    categorias: ['Oficina'],
    descripcion: '', imagen: null,
    stock: 350, cantidadXPaca: 5,
    precioDetalle: 18500, precioDetallePaca: 17000,
    precioMayorista: 15800, precioMayoristaPaca: 14500,
    precioColegas: 14000, precioColegasPaca: 12800,
    precioPacas: 12500,   precioPacasPaca: 11000,
  },
  {
    id: 4, activo: true,
    nombre: 'Bolígrafo Kilométrico x12', codBarras: '7701234000044', referencia: 'REF-004',
    proveedor: 'Comercializadora Sur Ltda.',
    categorias: ['Útiles Escolares', 'Oficina'],
    descripcion: '', imagen: null,
    stock: 800, cantidadXPaca: 12,
    precioDetalle: 8400,  precioDetallePaca: 7600,
    precioMayorista: 6900, precioMayoristaPaca: 6200,
    precioColegas: 6000,  precioColegasPaca: 5400,
    precioPacas: 5500,    precioPacasPaca: 4800,
  },
  {
    id: 5, activo: true,
    nombre: 'Caja de Colores 24 Und', codBarras: '7701234000055', referencia: 'REF-005',
    proveedor: 'Papelera El Punto S.A.S',
    categorias: ['Arte y Manualidades', 'Útiles Escolares'],
    descripcion: '', imagen: null,
    stock: 150, cantidadXPaca: 12,
    precioDetalle: 12000, precioDetallePaca: 10800,
    precioMayorista: 10000, precioMayoristaPaca: 9000,
    precioColegas: 9000,  precioColegasPaca: 8100,
    precioPacas: 8000,    precioPacasPaca: 7000,
  },
  {
    id: 6, activo: true,
    nombre: 'Corrector Líquido Faster', codBarras: '7701234000066', referencia: 'REF-006',
    proveedor: 'Distribuciones Andina Ltda.',
    categorias: ['Oficina', 'Útiles Escolares'],
    descripcion: '', imagen: null,
    stock: 420, cantidadXPaca: 12,
    precioDetalle: 3500,  precioDetallePaca: 3100,
    precioMayorista: 2800, precioMayoristaPaca: 2500,
    precioColegas: 2500,  precioColegasPaca: 2200,
    precioPacas: 2200,    precioPacasPaca: 1900,
  },
  {
    id: 7, activo: true,
    nombre: 'Carpeta Argollada Oficio', codBarras: '7701234000077', referencia: 'REF-007',
    proveedor: 'Comercializadora Central S.A.S',
    categorias: ['Oficina'],
    descripcion: '', imagen: null,
    stock: 180, cantidadXPaca: 6,
    precioDetalle: 9800,  precioDetallePaca: 8800,
    precioMayorista: 8200, precioMayoristaPaca: 7400,
    precioColegas: 7400,  precioColegasPaca: 6600,
    precioPacas: 6800,    precioPacasPaca: 6000,
  },
  {
    id: 8, activo: true,
    nombre: 'Tijeras Escolar Punta Roma', codBarras: '7701234000088', referencia: 'REF-008',
    proveedor: 'Industrias Bolívar S.A.',
    categorias: ['Útiles Escolares', 'Arte y Manualidades'],
    descripcion: '', imagen: null,
    stock: 300, cantidadXPaca: 12,
    precioDetalle: 4200,  precioDetallePaca: 3800,
    precioMayorista: 3500, precioMayoristaPaca: 3100,
    precioColegas: 3100,  precioColegasPaca: 2800,
    precioPacas: 2800,    precioPacasPaca: 2400,
  },
  {
    id: 9, activo: true,
    nombre: 'Marcadores Borrables x6', codBarras: '7701234000099', referencia: 'REF-009',
    proveedor: 'Papelera El Punto S.A.S',
    categorias: ['Oficina', 'Arte y Manualidades'],
    descripcion: '', imagen: null,
    stock: 240, cantidadXPaca: 6,
    precioDetalle: 11500, precioDetallePaca: 10400,
    precioMayorista: 9600, precioMayoristaPaca: 8600,
    precioColegas: 8600,  precioColegasPaca: 7700,
    precioPacas: 7800,    precioPacasPaca: 6900,
  },
  {
    id: 10, activo: true,
    nombre: 'Block Cuadriculado 50 Hojas', codBarras: '7701234000100', referencia: 'REF-010',
    proveedor: 'Distribuciones Andina Ltda.',
    categorias: ['Útiles Escolares'],       // 'Papelería Básica' no existe en categoriesService
    descripcion: '', imagen: null,
    stock: 600, cantidadXPaca: 12,
    precioDetalle: 3800,  precioDetallePaca: 3400,
    precioMayorista: 3100, precioMayoristaPaca: 2800,
    precioColegas: 2800,  precioColegasPaca: 2500,
    precioPacas: 2500,    precioPacasPaca: 2100,
  },
];

// ─── Control de versión — resembla solo si cambió la versión ─────────────────
const seedProducts = () => {
  try {
    if (localStorage.getItem(VERSION_KEY) !== SEED_VERSION) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
      localStorage.setItem(VERSION_KEY, SEED_VERSION);
    }
  } catch {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(VERSION_KEY, SEED_VERSION);
  }
};

seedProducts();

// ─── Servicio ─────────────────────────────────────────────────────────────────
export const ProductsService = {

  /** Devuelve todos los productos */
  list() {
    try {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  /** Busca un producto por id */
  findById(id) {
    return this.list().find((p) => p.id === id) ?? null;
  },

  /** Persiste el array completo */
  _save(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  /**
   * Crea un producto nuevo.
   * Los valores numéricos llegan como string desde el form → se convierten aquí.
   */
  create(data) {
    const products = this.list();
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct = {
      ...data,
      id:                  newId,
      activo:              true,
      precioDetalle:       Number(data.precioDetalle),
      precioDetallePaca:   Number(data.precioDetallePaca)   || 0,
      precioMayorista:     Number(data.precioMayorista),
      precioMayoristaPaca: Number(data.precioMayoristaPaca) || 0,
      precioColegas:       Number(data.precioColegas),
      precioColegasPaca:   Number(data.precioColegasPaca)   || 0,
      precioPacas:         Number(data.precioPacas),
      precioPacasPaca:     Number(data.precioPacasPaca)     || 0,
      stock:               Number(data.stock),
      cantidadXPaca:       Number(data.cantidadXPaca)       || 0,
    };
    this._save([...products, newProduct]);
    return newProduct;
  },

  /**
   * Actualiza un producto existente.
   * Los valores numéricos llegan como string desde el form → se convierten aquí.
   */
  update(data) {
    const products = this.list();
    const updated = products.map((p) =>
      p.id === data.id
        ? {
            ...p,
            ...data,
            precioDetalle:       Number(data.precioDetalle),
            precioDetallePaca:   Number(data.precioDetallePaca)   || 0,
            precioMayorista:     Number(data.precioMayorista),
            precioMayoristaPaca: Number(data.precioMayoristaPaca) || 0,
            precioColegas:       Number(data.precioColegas),
            precioColegasPaca:   Number(data.precioColegasPaca)   || 0,
            precioPacas:         Number(data.precioPacas),
            precioPacasPaca:     Number(data.precioPacasPaca)     || 0,
            stock:               Number(data.stock),
            cantidadXPaca:       Number(data.cantidadXPaca)       || 0,
          }
        : p
    );
    this._save(updated);
    return updated.find((p) => p.id === data.id);
  },

  /** Descuenta stock al confirmar una venta */
  decrementStock(items) {
    try {
      const products = this.list();
      const updated = products.map((p) => {
        const item = items.find((i) => i.product.id === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.cantidad) } : p;
      });
      this._save(updated);
    } catch { /* silencioso */ }
  },

  /** Restaura stock al anular una venta */
  restoreStock(items) {
    try {
      const products = this.list();
      const updated = products.map((p) => {
        const item = items.find((i) => i.product.id === p.id);
        return item ? { ...p, stock: p.stock + item.cantidad } : p;
      });
      this._save(updated);
    } catch { /* silencioso */ }
  },
};

export default ProductsService;