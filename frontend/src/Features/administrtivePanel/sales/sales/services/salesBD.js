import { ProductsDB } from './productsBD';

const SALES_KEY = 'pm_sales';
const USERS_KEY = 'pm_users';

// ─── Formateador de precio ────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(v);

// ─── Helper: construir item de venta a partir de producto semilla ─────────────
const mkItem = (prod, cantidad) => ({ product: prod, cantidad });

// ─── Productos de la semilla (referencia estática para las ventas de ejemplo) ─
const P = [
  null, // índice 0 vacío para alinear con id 1-based
  { id: 1,  nombre: 'Libreta con Lapicero',            precioDetal: 5000,  stock: 200 },
  { id: 2,  nombre: 'Silicona Líquida ET131 X',         precioDetal: 2900,  stock: 500 },
  { id: 3,  nombre: 'Resma Papel Bond A4 500 Hojas',    precioDetal: 18500, stock: 350 },
  { id: 4,  nombre: 'Bolígrafo Kilométrico x12',        precioDetal: 8400,  stock: 800 },
  { id: 5,  nombre: 'Caja de Colores 24 Und',           precioDetal: 12000, stock: 150 },
  { id: 6,  nombre: 'Corrector Líquido Faster',         precioDetal: 3500,  stock: 420 },
  { id: 7,  nombre: 'Carpeta Argollada Oficio',         precioDetal: 9800,  stock: 180 },
  { id: 8,  nombre: 'Tijeras Escolar Punta Roma',       precioDetal: 4200,  stock: 300 },
  { id: 9,  nombre: 'Marcadores Borrables x6',          precioDetal: 11500, stock: 240 },
  { id: 10, nombre: 'Block Cuadriculado 50 Hojas',      precioDetal: 3800,  stock: 600 },
  { id: 11, nombre: 'Resaltadores Neon x5',             precioDetal: 7500,  stock: 380 },
  { id: 12, nombre: 'Cuaderno Universitario 100 Hojas', precioDetal: 6800,  stock: 450 },
  { id: 13, nombre: 'Pegante en Barra UHU 21g',         precioDetal: 2500,  stock: 700 },
  { id: 14, nombre: 'Cinta Transparente 3M x3',         precioDetal: 4900,  stock: 260 },
  { id: 15, nombre: 'Sacapuntas Metálico Doble',        precioDetal: 1800,  stock: 550 },
];

const calcTotal = (items) => {
  const subtotal = items.reduce((a, i) => a + i.product.precioDetal * i.cantidad, 0);
  return fmt(subtotal + Math.round(subtotal * 0.19));
};

// ─── 10 ventas de ejemplo ─────────────────────────────────────────────────────
const SEED_SALES = [
  {
    id: 1, factura: '382749105', fecha: '05/01/2025',
    clienteId: 4,  vendedorId: 2,
    cliente:  'Marcela Alejandra Gómez Ríos',   vendedor: 'Laura Milena Restrepo Cardona',
    metodoPago: 'Efectivo',    estado: 'Aprobada',
    entrega: 'Cliente lo recoge', direccion: '',
    items: [mkItem(P[1], 3), mkItem(P[4], 2)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '05/01/2025',
  },
  {
    id: 2, factura: '519203847', fecha: '10/01/2025',
    clienteId: 5,  vendedorId: 3,
    cliente:  'Carlos Eduardo Vargas Herrera',   vendedor: 'Andrés Felipe Martínez Salazar',
    metodoPago: 'Transferencia', estado: 'Aprobada',
    entrega: 'Domicilio', direccion: 'Calle 45 # 23-10, Barrio La Estrella, Medellín',
    items: [mkItem(P[3], 5), mkItem(P[6], 2), mkItem(P[9], 4)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '10/01/2025',
  },
  {
    id: 3, factura: '674821093', fecha: '15/01/2025',
    clienteId: 7,  vendedorId: 9,
    cliente:  'Juan Sebastián Torres Mendoza',   vendedor: 'Miguel Ángel Castillo Duque',
    metodoPago: 'Crédito',     estado: 'Créd. aprobado',
    entrega: 'Cliente lo recoge', direccion: '',
    items: [mkItem(P[2], 10), mkItem(P[5], 3)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '15/01/2025',
  },
  {
    id: 4, factura: '293847561', fecha: '20/01/2025',
    clienteId: 10, vendedorId: 2,
    cliente:  'Salomé Arias Quintero',           vendedor: 'Laura Milena Restrepo Cardona',
    metodoPago: 'Efectivo',    estado: 'Anulada',
    entrega: 'Domicilio', direccion: 'Carrera 70 # 12-55, Barrio Conquistadores, Medellín',
    items: [mkItem(P[7], 2), mkItem(P[8], 1)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '20/01/2025',
  },
  {
    id: 5, factura: '847392015', fecha: '25/01/2025',
    clienteId: 11, vendedorId: 15,
    cliente:  'Alejandro José Patiño Londoño',   vendedor: 'Daniel Esteban Ramírez Posada',
    metodoPago: 'Transferencia', estado: 'Esp. aprobación',
    entrega: 'Cliente lo recoge', direccion: '',
    items: [mkItem(P[10], 6), mkItem(P[11], 4), mkItem(P[12], 8)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '25/01/2025',
  },
  {
    id: 6, factura: '103948572', fecha: '02/02/2025',
    clienteId: 13, vendedorId: 3,
    cliente:  'Santiago Esteban Jiménez Mora',   vendedor: 'Andrés Felipe Martínez Salazar',
    metodoPago: 'Efectivo',    estado: 'Aprobada',
    entrega: 'Domicilio', direccion: 'Av. El Poblado # 15-30, Piso 2, Medellín',
    items: [mkItem(P[13], 5), mkItem(P[14], 3)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '02/02/2025',
  },
  {
    id: 7, factura: '560294817', fecha: '07/02/2025',
    clienteId: 14, vendedorId: 19,
    cliente:  'Isabella Fernanda López Arango',  vendedor: 'Tomás Alejandro Herrera Zuluaga',
    metodoPago: 'Crédito',     estado: 'Créd. denegado',
    entrega: 'Cliente lo recoge', direccion: '',
    items: [mkItem(P[3], 2), mkItem(P[4], 3), mkItem(P[5], 1)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '07/02/2025',
  },
  {
    id: 8, factura: '728405193', fecha: '12/02/2025',
    clienteId: 16, vendedorId: 12,
    cliente:  'Camila Andrea Sánchez Vélez',     vendedor: 'Natalia Paola Ospina Cano',
    metodoPago: 'Transferencia', estado: 'Aprobada',
    entrega: 'Domicilio', direccion: 'Calle 10 # 43-20, Barrio El Estadio, Medellín',
    items: [mkItem(P[1], 5), mkItem(P[2], 8), mkItem(P[15], 10)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '12/02/2025',
  },
  {
    id: 9, factura: '394817205', fecha: '17/02/2025',
    clienteId: 17, vendedorId: 9,
    cliente:  'Sebastián David Gutiérrez Mejía', vendedor: 'Miguel Ángel Castillo Duque',
    metodoPago: 'Efectivo',    estado: 'Desaprobada',
    entrega: 'Cliente lo recoge', direccion: '',
    items: [mkItem(P[6], 4), mkItem(P[9], 2)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '17/02/2025',
  },
  {
    id: 10, factura: '612038475', fecha: '20/02/2025',
    clienteId: 20, vendedorId: 2,
    cliente:  'Manuela Sofía Álvarez Montoya',   vendedor: 'Laura Milena Restrepo Cardona',
    metodoPago: 'Transferencia', estado: 'Aprobada',
    entrega: 'Domicilio', direccion: 'Transversal 39 # 72-15, Barrio Laureles, Medellín',
    items: [mkItem(P[11], 3), mkItem(P[12], 5), mkItem(P[13], 6), mkItem(P[14], 2)],
    get total() { return calcTotal(this.items); },
    registradoDesde: '20/02/2025',
  },
];

// ─── Versión de la semilla — incrementar si se modifica SEED_SALES ────────────
const SEED_VERSION = 'sales_v1';

// ─── Sembrar ventas si no existe, está vacía o la versión no coincide ─────────
const seedSales = () => {
  try {
    const currentVersion = localStorage.getItem(`${SALES_KEY}_seed_version`);
    const stored         = localStorage.getItem(SALES_KEY);
    const parsed         = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0 || currentVersion !== SEED_VERSION) {
      localStorage.setItem(SALES_KEY, JSON.stringify(SEED_SALES));
      localStorage.setItem(`${SALES_KEY}_seed_version`, SEED_VERSION);
    }
  } catch {
    localStorage.setItem(SALES_KEY, JSON.stringify(SEED_SALES));
    localStorage.setItem(`${SALES_KEY}_seed_version`, SEED_VERSION);
  }
};

seedSales();

// ─── Servicio de Ventas ───────────────────────────────────────────────────────
export const SalesDB = {

  list() {
    try {
      const stored = localStorage.getItem(SALES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  _save(sales) {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  },

  _loadUsers() {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  _calcTotals(items) {
    const subtotal = items.reduce((acc, i) => acc + i.product.precioDetal * i.cantidad, 0);
    const iva      = Math.round(subtotal * 0.19);
    return { subtotal, iva, total: subtotal + iva };
  },

  // ── Crear venta ───────────────────────────────────────────────────────────
  create(form, items, facturaNo) {
    const sales    = this.list();
    const users    = this._loadUsers();
    const cliente  = users.find((u) => String(u.id) === String(form.clienteId));
    const vendedor = users.find((u) => String(u.id) === String(form.vendedorId));
    const { total } = this._calcTotals(items);

    const newId   = sales.length > 0 ? Math.max(...sales.map((s) => s.id)) + 1 : 1;
    const newSale = {
      id:              newId,
      factura:         facturaNo,
      fecha:           new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      clienteId:       form.clienteId,
      vendedorId:      form.vendedorId,
      cliente:         cliente?.nombre  ?? '',
      vendedor:        vendedor?.nombre ?? '',
      metodoPago:      form.metodoPago,
      estado:          form.estado,
      entrega:         form.entrega,
      direccion:       form.direccion,
      items,
      total:           fmt(total),
      registradoDesde: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };

    this._save([...sales, newSale]);
    ProductsDB.decrementStock(items);
    return newSale;
  },

  // ── Actualizar venta ──────────────────────────────────────────────────────
  update(saleId, form, items, originalItems) {
    const sales    = this.list();
    const users    = this._loadUsers();
    const cliente  = users.find((u) => String(u.id) === String(form.clienteId));
    const vendedor = users.find((u) => String(u.id) === String(form.vendedorId));
    const { total } = this._calcTotals(items);

    const updated = sales.map((s) =>
      s.id === saleId
        ? {
            ...s,
            clienteId:  form.clienteId,
            vendedorId: form.vendedorId,
            cliente:    cliente?.nombre  ?? '',
            vendedor:   vendedor?.nombre ?? '',
            metodoPago: form.metodoPago,
            estado:     form.estado,
            entrega:    form.entrega,
            direccion:  form.direccion,
            items,
            total:      fmt(total),
          }
        : s
    );
    this._save(updated);
    ProductsDB.restoreStock(originalItems);
    ProductsDB.decrementStock(items);
    return updated;
  },

  // ── Anular venta ──────────────────────────────────────────────────────────
  anular(saleId) {
    const sales = this.list();
    const sale  = sales.find((s) => s.id === saleId);
    const updated = sales.map((s) =>
      s.id === saleId ? { ...s, estado: 'Anulada' } : s
    );
    this._save(updated);
    if (sale?.items) ProductsDB.restoreStock(sale.items);
    return updated;
  },
};

export default SalesDB;