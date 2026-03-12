import ProductsService from '../../../purchases/products/services/productsServices';

const SALES_KEY = 'pm_sales';
const USERS_KEY = 'pm_users';

// ─── Formateador de precio ────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(v);

// ─── Helper: construir item de venta ─────────────────────────────────────────
const mkItem = (prod, cantidad, descripcion = '') => ({ product: prod, cantidad, descripcion });

// ─── Cálculo de total para el seed (getter) ───────────────────────────────────
const calcTotal = (items) => {
  const subtotal = items.reduce((a, i) => a + i.product.precioDetalle * i.cantidad, 0);
  return fmt(subtotal + Math.round(subtotal * 0.19));
};

// ─── Control de versión del seed ──────────────────────────────────────────────
const SEED_VERSION = 'sales_v3';

// ─── Seed dinámico: usa los productos reales registrados en ProductsService ───
// Se ejecuta en tiempo de arranque, cuando ProductsService ya sembró su propio seed.
const seedSales = () => {
  try {
    const currentVersion = localStorage.getItem(`${SALES_KEY}_seed_version`);
    const stored         = localStorage.getItem(SALES_KEY);
    const parsed         = stored ? JSON.parse(stored) : [];

    if (parsed.length > 0 && currentVersion === SEED_VERSION) return; // ya sembrado

    // Tomamos los productos reales desde ProductsService
    const p = (id) => ProductsService.findById(id);

    const SEED_SALES = [
      {
        id: 1, factura: '382749105', fecha: '05/01/2025',
        clienteId: 4, vendedorId: 2,
        cliente: 'Marcela Alejandra Gómez Ríos', vendedor: 'Laura Milena Restrepo Cardona',
        metodoPago: 'Efectivo', estado: 'Aprobada',
        entrega: 'Cliente lo recoge', direccion: '',
        items: [
          mkItem(p(1), 3, '2 libretas de pasta dura azul y 1 de pasta roja'),
          mkItem(p(4), 2),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '05/01/2025',
      },
      {
        id: 2, factura: '519203847', fecha: '10/01/2025',
        clienteId: 5, vendedorId: 3,
        cliente: 'Carlos Eduardo Vargas Herrera', vendedor: 'Andrés Felipe Martínez Salazar',
        metodoPago: 'Transferencia', estado: 'Aprobada',
        entrega: 'Domicilio', direccion: 'Calle 45 # 23-10, Barrio La Estrella, Medellín',
        items: [
          mkItem(p(3), 5, 'Todas deben ser de la marca Navigator, sin sustitutos'),
          mkItem(p(6), 2),
          mkItem(p(9), 4, '2 set de colores cálidos y 2 de colores fríos'),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '10/01/2025',
      },
      {
        id: 3, factura: '674821093', fecha: '15/01/2025',
        clienteId: 7, vendedorId: 9,
        cliente: 'Juan Sebastián Torres Mendoza', vendedor: 'Miguel Ángel Castillo Duque',
        metodoPago: 'Crédito', estado: 'Aprobada',
        entrega: 'Cliente lo recoge', direccion: '',
        items: [
          mkItem(p(2), 10),
          mkItem(p(5), 3, '2 cajas para niña (tonos pastel) y 1 para niño (tonos vivos)'),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '15/01/2025',
      },
      {
        id: 4, factura: '293847561', fecha: '20/01/2025',
        clienteId: 10, vendedorId: 2,
        cliente: 'Salomé Arias Quintero', vendedor: 'Laura Milena Restrepo Cardona',
        metodoPago: 'Efectivo', estado: 'Anulada',
        entrega: 'Domicilio', direccion: 'Carrera 70 # 12-55, Barrio Conquistadores, Medellín',
        items: [
          mkItem(p(7), 2),
          mkItem(p(8), 1),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '20/01/2025',
      },
      {
        id: 5, factura: '847392015', fecha: '25/01/2025',
        clienteId: 11, vendedorId: 15,
        cliente: 'Alejandro José Patiño Londoño', vendedor: 'Daniel Esteban Ramírez Posada',
        metodoPago: 'Transferencia', estado: 'Esp. aprobación',
        entrega: 'Cliente lo recoge', direccion: '',
        items: [
          mkItem(p(10), 6, '3 paquetes de rayas y 3 de cuadros'),
          mkItem(p(4),  4),
          mkItem(p(3),  8, '5 cuadernos para mujer y 3 para hombre'),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '25/01/2025',
      },
      {
        id: 6, factura: '103948572', fecha: '02/02/2025',
        clienteId: 13, vendedorId: 3,
        cliente: 'Santiago Esteban Jiménez Mora', vendedor: 'Andrés Felipe Martínez Salazar',
        metodoPago: 'Efectivo', estado: 'Aprobada',
        entrega: 'Domicilio', direccion: 'Av. El Poblado # 15-30, Piso 2, Medellín',
        items: [
          mkItem(p(9), 5),
          mkItem(p(6), 3),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '02/02/2025',
      },
      {
        id: 7, factura: '560294817', fecha: '07/02/2025',
        clienteId: 14, vendedorId: 19,
        cliente: 'Isabella Fernanda López Arango', vendedor: 'Tomás Alejandro Herrera Zuluaga',
        metodoPago: 'Crédito', estado: 'Desaprobada',
        entrega: 'Cliente lo recoge', direccion: '',
        items: [
          mkItem(p(3), 2),
          mkItem(p(4), 3),
          mkItem(p(5), 1),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '07/02/2025',
      },
      {
        id: 8, factura: '728405193', fecha: '12/02/2025',
        clienteId: 16, vendedorId: 12,
        cliente: 'Camila Andrea Sánchez Vélez', vendedor: 'Natalia Paola Ospina Cano',
        metodoPago: 'Transferencia', estado: 'Aprobada',
        entrega: 'Domicilio', direccion: 'Calle 10 # 43-20, Barrio El Estadio, Medellín',
        items: [
          mkItem(p(1), 5, '3 con espiral y 2 de pasta dura'),
          mkItem(p(2), 8),
          mkItem(p(8), 10),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '12/02/2025',
      },
      {
        id: 9, factura: '394817205', fecha: '17/02/2025',
        clienteId: 17, vendedorId: 9,
        cliente: 'Sebastián David Gutiérrez Mejía', vendedor: 'Miguel Ángel Castillo Duque',
        metodoPago: 'Efectivo', estado: 'Desaprobada',
        entrega: 'Cliente lo recoge', direccion: '',
        items: [
          mkItem(p(6), 4),
          mkItem(p(9), 2),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '17/02/2025',
      },
      {
        id: 10, factura: '612038475', fecha: '20/02/2025',
        clienteId: 20, vendedorId: 2,
        cliente: 'Manuela Sofía Álvarez Montoya', vendedor: 'Laura Milena Restrepo Cardona',
        metodoPago: 'Transferencia', estado: 'Aprobada',
        entrega: 'Domicilio', direccion: 'Transversal 39 # 72-15, Barrio Laureles, Medellín',
        items: [
          mkItem(p(4), 3),
          mkItem(p(3), 5, '3 cuadernos universitarios con índice y 2 sin índice'),
          mkItem(p(9), 6, '4 pegantes grandes y 2 pequeños'),
          mkItem(p(6), 2),
        ].filter((i) => i.product !== null),
        get total() { return calcTotal(this.items); },
        registradoDesde: '20/02/2025',
      },
    ];

    localStorage.setItem(SALES_KEY, JSON.stringify(SEED_SALES));
    localStorage.setItem(`${SALES_KEY}_seed_version`, SEED_VERSION);
  } catch (e) {
    console.error('[SalesDB] Error al sembrar ventas:', e);
  }
};

seedSales();

// ─── Servicio de Ventas ───────────────────────────────────────────────────────
export const SalesDB = {

  // ── Productos reales (delegado a ProductsService) ─────────────────────────
  // Los módulos de ventas consumen productos a través de SalesDB,
  // sin necesidad de importar ProductsService directamente.
  getProducts() {
    return ProductsService.list();
  },

  getProductById(id) {
    return ProductsService.findById(id);
  },

  // ── Ventas ────────────────────────────────────────────────────────────────
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

  // Usa precioDetalle del producto real
  _calcTotals(items) {
    const subtotal = items.reduce((acc, i) => acc + i.product.precioDetalle * i.cantidad, 0);
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
    ProductsService.decrementStock(items);
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
    ProductsService.restoreStock(originalItems);
    ProductsService.decrementStock(items);
    return updated;
  },

  // ── Anular venta ──────────────────────────────────────────────────────────
  anular(saleId, motivo = '') {
    const sales = this.list();
    const sale  = sales.find((s) => s.id === saleId);
    const updated = sales.map((s) =>
      s.id === saleId
        ? {
            ...s,
            estado:          'Anulada',
            motivoAnulacion: motivo.trim() || 'Sin motivo registrado.',
            fechaAnulacion:  new Date().toLocaleDateString('es-CO', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            }),
          }
        : s
    );
    this._save(updated);
    if (sale?.items) ProductsService.restoreStock(sale.items);
    return updated;
  },
};

export default SalesDB;