const PRODUCTS_KEY = 'pm_products';

// ─── Catálogo de productos de papelería ───────────────────────────────────────
const SEED_PRODUCTS = [
  { id: 1,  nombre: 'Libreta con Lapicero',            proveedor: 'Papelera El Punto S.A.S',        precioDetal: 5000,  precioMayorista: 4200,  stock: 200, categorias: ['Papelería', 'Útiles escolares'] },
  { id: 2,  nombre: 'Silicona Líquida ET131 X',         proveedor: 'Distribuciones Andina Ltda.',     precioDetal: 2900,  precioMayorista: 2400,  stock: 500, categorias: ['Arte y manualidades'] },
  { id: 3,  nombre: 'Resma Papel Bond A4 500 Hojas',    proveedor: 'Industrias Bolívar S.A.',         precioDetal: 18500, precioMayorista: 15800, stock: 350, categorias: ['Oficina', 'Papelería'] },
  { id: 4,  nombre: 'Bolígrafo Kilométrico x12',        proveedor: 'Comercializadora Sur Ltda.',      precioDetal: 8400,  precioMayorista: 6900,  stock: 800, categorias: ['Útiles escolares', 'Oficina'] },
  { id: 5,  nombre: 'Caja de Colores 24 Und',           proveedor: 'Papelera El Punto S.A.S',        precioDetal: 12000, precioMayorista: 10000, stock: 150, categorias: ['Arte y manualidades', 'Útiles escolares'] },
  { id: 6,  nombre: 'Corrector Líquido Faster',         proveedor: 'Distribuciones Andina Ltda.',     precioDetal: 3500,  precioMayorista: 2800,  stock: 420, categorias: ['Oficina', 'Útiles escolares'] },
  { id: 7,  nombre: 'Carpeta Argollada Oficio',         proveedor: 'Comercializadora Central S.A.S',  precioDetal: 9800,  precioMayorista: 8200,  stock: 180, categorias: ['Oficina'] },
  { id: 8,  nombre: 'Tijeras Escolar Punta Roma',       proveedor: 'Industrias Bolívar S.A.',         precioDetal: 4200,  precioMayorista: 3500,  stock: 300, categorias: ['Útiles escolares', 'Arte y manualidades'] },
  { id: 9,  nombre: 'Marcadores Borrables x6',          proveedor: 'Papelera El Punto S.A.S',        precioDetal: 11500, precioMayorista: 9600,  stock: 240, categorias: ['Oficina', 'Arte y manualidades'] },
  { id: 10, nombre: 'Block Cuadriculado 50 Hojas',      proveedor: 'Distribuciones Andina Ltda.',     precioDetal: 3800,  precioMayorista: 3100,  stock: 600, categorias: ['Útiles escolares', 'Papelería'] },
  { id: 11, nombre: 'Resaltadores Neon x5',             proveedor: 'Comercializadora Sur Ltda.',      precioDetal: 7500,  precioMayorista: 6200,  stock: 380, categorias: ['Oficina', 'Útiles escolares'] },
  { id: 12, nombre: 'Cuaderno Universitario 100 Hojas', proveedor: 'Industrias Bolívar S.A.',         precioDetal: 6800,  precioMayorista: 5600,  stock: 450, categorias: ['Útiles escolares', 'Papelería'] },
  { id: 13, nombre: 'Pegante en Barra UHU 21g',         proveedor: 'Distribuciones Andina Ltda.',     precioDetal: 2500,  precioMayorista: 2000,  stock: 700, categorias: ['Arte y manualidades', 'Útiles escolares'] },
  { id: 14, nombre: 'Cinta Transparente 3M x3',         proveedor: 'Comercializadora Central S.A.S',  precioDetal: 4900,  precioMayorista: 4100,  stock: 260, categorias: ['Oficina', 'Papelería'] },
  { id: 15, nombre: 'Sacapuntas Metálico Doble',        proveedor: 'Papelera El Punto S.A.S',        precioDetal: 1800,  precioMayorista: 1400,  stock: 550, categorias: ['Útiles escolares'] },
  { id: 16, nombre: 'Regla Plástica 30 cm',             proveedor: 'Industrias Bolívar S.A.',         precioDetal: 1500,  precioMayorista: 1100,  stock: 480, categorias: ['Útiles escolares', 'Oficina'] },
  { id: 17, nombre: 'Borrador Blanco Nata x2',          proveedor: 'Comercializadora Sur Ltda.',      precioDetal: 1200,  precioMayorista: 900,   stock: 900, categorias: ['Útiles escolares'] },
  { id: 18, nombre: 'Compás Escolar con Lápiz',         proveedor: 'Comercializadora Central S.A.S',  precioDetal: 8900,  precioMayorista: 7400,  stock: 120, categorias: ['Útiles escolares', 'Arte y manualidades'] },
  { id: 19, nombre: 'Plastilina x12 Colores 120g',      proveedor: 'Papelera El Punto S.A.S',        precioDetal: 5500,  precioMayorista: 4600,  stock: 310, categorias: ['Arte y manualidades', 'Útiles escolares'] },
  { id: 20, nombre: 'Folder Manila Carta x25',          proveedor: 'Distribuciones Andina Ltda.',     precioDetal: 6200,  precioMayorista: 5100,  stock: 400, categorias: ['Oficina', 'Papelería'] },
];

// ─── Validar que los datos existentes tienen el esquema correcto ──────────────
// Si el primer registro no tiene 'precioDetal' o 'stock' numérico,
// los datos son de otro módulo (ej. compras) y hay que resembrar.
const hasValidSchema = (products) => {
  if (!products || products.length === 0) return false;
  const first = products[0];
  return (
    typeof first.precioDetal === 'number' &&
    typeof first.stock       === 'number' &&
    Array.isArray(first.categorias)
  );
};

const seedProducts = () => {
  try {
    const stored  = localStorage.getItem(PRODUCTS_KEY);
    const parsed  = stored ? JSON.parse(stored) : [];
    if (!hasValidSchema(parsed)) {
      // Datos inexistentes o de esquema incompatible → sobreescribir
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
    }
  } catch {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
  }
};

seedProducts();

// ─── Servicio de Productos ────────────────────────────────────────────────────
export const ProductsDB = {

  list() {
    try {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  findById(id) {
    return this.list().find((p) => p.id === id) ?? null;
  },

  _save(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  // Descontar stock al confirmar una venta
  decrementStock(items) {
    try {
      const products = this.list();
      const updated  = products.map((p) => {
        const item = items.find((i) => i.product.id === p.id);
        if (!item) return p;
        return { ...p, stock: Math.max(0, p.stock - item.cantidad) };
      });
      this._save(updated);
    } catch { /* silencioso */ }
  },

  // Restaurar stock al anular una venta
  restoreStock(items) {
    try {
      const products = this.list();
      const updated  = products.map((p) => {
        const item = items.find((i) => i.product.id === p.id);
        if (!item) return p;
        return { ...p, stock: p.stock + item.cantidad };
      });
      this._save(updated);
    } catch { /* silencioso */ }
  },
};

export default ProductsDB;