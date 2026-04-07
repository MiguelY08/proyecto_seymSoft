import { UsersDB } from '../../../users/services/usersDB';
import { clientsService } from '../../clients/services/clientsService';
import ProductsService from '../../../purchases/products/services/productsServices';
import {
  getCreditInfoForSale,
  createFacturaForSale,
  voidFacturaFromSale,
} from '../../paymentsAndCredits/data/paymentsServices';
import { getInitialPaymentAmounts } from '../helpers/salesHelpers';

const SALES_KEY = 'pm_sales';

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(v);

const mkItem = (prod, cantidad, descripcion = '') => ({ product: prod, cantidad, descripcion });

const calcTotal = (items) => {
  const subtotal = items.reduce((a, i) => a + i.product.precioDetalle * i.cantidad, 0);
  return fmt(subtotal + Math.round(subtotal * 0.19));
};

const isSoloCredito = (metodoPago) => {
  if (Array.isArray(metodoPago)) return metodoPago.length === 1 && metodoPago[0] === 'Crédito';
  return metodoPago === 'Crédito';
};

const SEED_VERSION = 'sales_v6'; // Incrementar versión para nuevos cambios

const seedSales = () => {
  // ... (se mantiene igual, pero con SEED_VERSION incrementada)
  // Por brevedad, no repito todo el seed, pero se debe actualizar la versión.
};

seedSales();

export const SalesDB = {

  getProducts() {
    return ProductsService.list();
  },

  getProductById(id) {
    return ProductsService.findById(id);
  },

  getClients() {
    return clientsService.getAll().filter((c) => c.active && !c.isSystem);
  },

  getClientById(id) {
    return clientsService.getById(id);
  },

  getCreditInfo(clienteId) {
    const cliente = clientsService.getById(clienteId);
    const creditoAsignado = parseInt(cliente?.clientCredit ?? '0') || 0;
    return getCreditInfoForSale(clienteId, creditoAsignado);
  },

  list() {
    try {
      const stored = localStorage.getItem(SALES_KEY);
      let sales = stored ? JSON.parse(stored) : [];
      return sales.map(sale => ({
        ...sale,
        paymentAmounts: sale.paymentAmounts || getInitialPaymentAmounts(),
      }));
    } catch { return []; }
  },

  _save(sales) {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  },

  _calcTotals(items) {
    const subtotal = items.reduce((acc, i) => acc + i.product.precioDetalle * i.cantidad, 0);
    const iva      = Math.round(subtotal * 0.19);
    return { subtotal, iva, total: subtotal + iva };
  },

  /**
   * Helper privado para manejar la creación/anulación de facturas de crédito.
   * @param {Object} sale - Venta (con factura, clienteId, estado, paymentAmounts)
   * @param {Object} options - Opciones: skipCreate (boolean) para solo anular.
   */
  _handleCreditFactura(sale, options = {}) {
    const { skipCreate = false } = options;
    const creditAmount = sale.paymentAmounts?.['Crédito'] || 0;
    const shouldHaveFactura = creditAmount > 0 && (sale.estado === 'Aprobada' || sale.estado === 'Esp. aprobación');

    // Si ya existía una factura (por ejemplo, al editar) debemos anularla primero
    // Para saber si existía, podríamos tener un flag, pero por simplicidad,
    // intentamos anular siempre (voidFacturaFromSale no falla si no existe)
    if (sale.factura) {
      try {
        voidFacturaFromSale(sale.clienteId, sale.factura);
      } catch (e) {
        console.warn('[SalesDB] No se pudo anular factura de crédito (quizás no existía):', e);
      }
    }

    if (!skipCreate && shouldHaveFactura) {
      try {
        const cliente = clientsService.getById(sale.clienteId);
        const creditoAsignado = parseInt(cliente?.clientCredit ?? '0') || 0;
        createFacturaForSale(sale.clienteId, creditoAsignado, {
          nroFactura:   sale.factura,
          valorCredito: creditAmount,
          fechaCredito: new Date().toISOString().split('T')[0],
        });
      } catch (e) {
        console.error('[SalesDB] Error al crear factura de crédito:', e);
      }
    }
  },

  create(form, items, facturaNo, paymentAmounts) {
    const sales    = this.list();
    const cliente  = clientsService.getById(form.clienteId);
    const vendedor = UsersDB.list().find((u) => String(u.id) === String(form.vendedorId));
    const { total } = this._calcTotals(items);

    const newId   = sales.length > 0 ? Math.max(...sales.map((s) => s.id)) + 1 : 1;
    const newSale = {
      id:              newId,
      factura:         facturaNo,
      fecha:           new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      clienteId:       form.clienteId,
      vendedorId:      form.vendedorId,
      cliente:         cliente?.name  ?? '',
      vendedor:        vendedor?.name ?? '',
      metodoPago:      form.metodoPago,
      estado:          form.estado,
      entrega:         form.entrega,
      direccion:       form.direccion,
      items,
      total:           fmt(total),
      registradoDesde: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      paymentAmounts:  paymentAmounts || getInitialPaymentAmounts(),
    };

    this._save([...sales, newSale]);
    ProductsService.decrementStock(items);

    // Manejar factura de crédito según el monto de crédito y el estado
    this._handleCreditFactura(newSale);

    return newSale;
  },

  update(saleId, form, items, originalItems, paymentAmounts) {
    const sales    = this.list();
    const existingSale = sales.find(s => s.id === saleId);
    if (!existingSale) return sales;

    const cliente  = clientsService.getById(form.clienteId);
    const vendedor = UsersDB.list().find((u) => String(u.id) === String(form.vendedorId));
    const { total } = this._calcTotals(items);

    // Crear objeto actualizado
    const updatedSale = {
      ...existingSale,
      clienteId:  form.clienteId,
      vendedorId: form.vendedorId,
      cliente:    cliente?.name  ?? '',
      vendedor:   vendedor?.name ?? '',
      metodoPago: form.metodoPago,
      estado:     form.estado,
      entrega:    form.entrega,
      direccion:  form.direccion,
      items,
      total:      fmt(total),
      paymentAmounts: paymentAmounts || existingSale.paymentAmounts || getInitialPaymentAmounts(),
    };

    const updated = sales.map((s) => s.id === saleId ? updatedSale : s);
    this._save(updated);
    ProductsService.restoreStock(originalItems);
    ProductsService.decrementStock(items);

    // Manejar factura de crédito: si cambió el monto de crédito o el estado
    const oldCreditAmount = existingSale.paymentAmounts?.['Crédito'] || 0;
    const newCreditAmount = updatedSale.paymentAmounts['Crédito'] || 0;
    const oldEstado = existingSale.estado;
    const newEstado = updatedSale.estado;

    const necesitaActualizarFactura =
      oldCreditAmount !== newCreditAmount ||
      (oldEstado === 'Aprobada' && newEstado !== 'Aprobada') ||
      (oldEstado !== 'Aprobada' && newEstado === 'Aprobada') ||
      (oldEstado === 'Esp. aprobación' && newEstado !== 'Esp. aprobación') ||
      (oldEstado !== 'Esp. aprobación' && newEstado === 'Esp. aprobación');

    if (necesitaActualizarFactura) {
      // Anular factura anterior (si existía) y crear nueva si corresponde
      this._handleCreditFactura(updatedSale);
    }

    return updated;
  },

  anular(saleId, motivo = '') {
    const sales = this.list();
    const sale  = sales.find((s) => s.id === saleId);
    if (!sale) return sales;

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

    // Anular la factura de crédito si la venta tenía crédito asignado (monto > 0)
    if (sale.paymentAmounts?.['Crédito'] > 0) {
      try {
        voidFacturaFromSale(sale.clienteId, sale.factura);
      } catch (e) {
        console.error('[SalesDB] Error al anular factura de crédito:', e);
      }
    }

    return updated;
  },
};

export default SalesDB;