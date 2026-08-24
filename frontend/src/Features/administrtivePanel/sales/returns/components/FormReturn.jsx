/**
 * Archivo: FormReturn.jsx
 * 
 * Formulario modal para crear o editar devoluciones de ventas.
 * 
 * EN MODO EDICIÓN: Solo se puede modificar:
 * - Estado general de la devolución
 * - Estado de cada producto individualmente
 * 
 * Todos los demás campos están deshabilitados con mensaje informativo.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronDown, ChevronLeft, Minus, Plus, Image, Search, Loader, Lock, ClipboardList } from 'lucide-react';
import Evidence from './Evidence';
import FormSelect from '../../../../shared/FormSelect';
import { useAlert } from '../../../../shared/alerts/useAlert';
import {
  getProductStatesForMethod,
  getInitialStateForMethod,
  calculateGeneralStatus
} from '../utils/returnsHelpers';
import { getAvailableInvoices, getReturnableSales } from '../data/returnsService';
import { clientsService } from '../../clients/services/clientsService';

// ======================= DATOS DE REFERENCIA =======================

const onlyDigits = (value, maxLength = 4) =>
  String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

const ADDRESS_MAX_LENGTH = 120;
const GENERAL_DESCRIPTION_MAX_LENGTH = 500;
const REASON_DESCRIPTION_MAX_LENGTH = 255;

const PRODUCTOS_VENTA = [];

const MOTIVOS = [
  'DEFECTUOSO',
  'PRODUCTO_EQUIVOCADO',
  'PRODUCTO_INCOMPLETO',
  'MAL_ESTADO',
  'PRODUCTO_USADO',
  'OTRO'
];

const METODOS = ['Reemplazo', 'Reembolso', 'Saldo a favor'];

const ESTADOS_P = ['En Proceso', 'Procesada', 'Anulado'];

const MOTIVOS_LABELS = {
  'DEFECTUOSO': 'Producto defectuoso',
  'PRODUCTO_EQUIVOCADO': 'Producto equivocado',
  'PRODUCTO_INCOMPLETO': 'Producto incompleto',
  'MAL_ESTADO': 'Producto en mal estado',
  'PRODUCTO_USADO': 'Producto usado',
  'OTRO': 'Otro motivo'
};

const MOTIVO_OPTIONS = MOTIVOS.map((value) => ({
  value,
  label: MOTIVOS_LABELS[value],
}));
const METODO_OPTIONS = METODOS.map((value) => ({ value, label: value }));
const ESTADO_GENERAL_OPTIONS = ESTADOS_P.map((value) => ({ value, label: value }));

const formatCOP = (v) => new Intl.NumberFormat('es-CO').format(v);

const formatReasonLabel = (reason) => {
  if (!reason) return 'Sin motivo';
  const label = MOTIVOS_LABELS[reason] || String(reason).replace(/[_-]+/g, ' ');
  const normalized = label.trim().toLocaleLowerCase('es-CO');
  return normalized.charAt(0).toLocaleUpperCase('es-CO') + normalized.slice(1);
};

const RETURN_SELECT_CLASS = 'h-10 py-0 rounded-lg text-sm font-medium';

const getReasonId = (reasonName) => {
  const reasonMap = {
    'DEFECTUOSO': 5,
    'PRODUCTO_EQUIVOCADO': 6,
    'PRODUCTO_INCOMPLETO': 7,
    'MAL_ESTADO': 8,
    'PRODUCTO_USADO': 9,
    'OTRO': 4
  };
  return reasonMap[reasonName] || 4;
};

const getMethodId = (methodName) => {
  const methodMap = {
    'Reemplazo': 1,
    'Reembolso': 2,
    'Saldo a favor': 3
  };
  return methodMap[methodName] || 1;
};

const getStatusId = (statusName) => {
  const statusMap = {
    'Pend. envio': 1,
    'Pend. reemplazo': 2,
    'Pend. reembolso': 3,
    'Listo': 4,
    'Anulado': 5,
    'En Proceso': 6,
    'Procesada': 7
  };
  return statusMap[statusName] || 7;
};

// ======================= COMPONENTES AUXILIARES =======================

function ProductoImg({ src, size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  if (src) return <img src={src} alt="" className={`${dim} rounded-lg object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0`}>
      <Image className="w-4 h-4 text-gray-300" />
    </div>
  );
}

const isFinalProductStatus = (status) =>
  String(status || '').trim().toLowerCase() === 'listo';

function BlockedFieldHint({ title = 'Campo bloqueado' }) {
  return (
    <span
      title={title}
      className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
    >
      <Lock className="h-3 w-3" />
    </span>
  );
}

function EstadoBadgeSelect({ value, onChange, metodo, sharedStyle = true, disabled = false }) {
  const [open, setOpen] = useState(false);
  const isDisabled = disabled || !metodo;

  if (sharedStyle) {
    const options = metodo
      ? getProductStatesForMethod(metodo).map((estado) => ({
          value: estado,
          label: estado,
        }))
      : [];

    return (
      <FormSelect
        value={value || ''}
        options={options}
        onChange={onChange}
        disabled={isDisabled}
        placeholder={metodo ? 'Selecciona un estado' : 'Selecciona método primero'}
        ariaLabel="Estado del producto"
        className={`${RETURN_SELECT_CLASS} ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
        placement="bottom"
      />
    );
  }

  if (isDisabled) {
    return (
      <div className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-gray-100 text-gray-400 border-gray-200">
        {value || 'Selecciona método primero'}
      </div>
    );
  }
  
  const validStates = getProductStatesForMethod(metodo);
  
  const colorMap = {
    'Pend. envio': 'bg-orange-100 text-orange-600 border-orange-300',
    'Pend. reemplazo': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Pend. reembolso': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Listo': 'bg-green-100 text-green-700 border-green-300',
    'Aprobada': 'bg-green-100 text-green-700 border-green-300',
  };
  
  const color = colorMap[value] ?? 'bg-orange-100 text-orange-600 border-orange-300';
  
  return (
    <div className="relative" style={{ position: 'relative', zIndex: 9999 }}>
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${color}`}
      >
        {value}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {open && (
        <div 
          className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
          style={{ 
            position: 'absolute',
            zIndex: 99999,
            top: '100%',
            left: 0,
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {validStates.map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => {
                onChange(estado);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 transition"
            >
              {estado}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DisabledField({ label, value, required = false }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="block text-xs font-bold text-gray-600">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <BlockedFieldHint />
      </div>
      <div className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 break-words whitespace-pre-wrap">
        {value || '—'}
      </div>
      <p className="text-[10px] text-gray-400 mt-1">
        No se puede modificar en edición
      </p>
    </div>
  );
}

function DisabledTextarea({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="block text-xs font-bold text-gray-600">{label}</label>
        <BlockedFieldHint />
      </div>
      <textarea
        value={value || ''}
        disabled
        rows={4}
        className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-500 resize-none cursor-not-allowed"
      />
      <p className="text-[10px] text-gray-400 mt-1">
        No se puede modificar en edición
      </p>
    </div>
  );
}

function DisabledEvidence({ count }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="block text-xs font-bold text-gray-600">Evidencias</label>
        <BlockedFieldHint />
      </div>
      <div className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 flex items-center justify-between">
        <span>{count === 0 ? 'Sin evidencias' : `${count} archivo(s) adjunto(s)`}</span>
        <Image className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">
        No se puede modificar en edición
      </p>
    </div>
  );
}

function DisabledDeliveryToggle({ isDelivery }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">Domicilio</span>
          <BlockedFieldHint />
        </div>
        <div className={`relative w-12 h-6 rounded-full ${isDelivery ? 'bg-green-500' : 'bg-gray-300'} opacity-50`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${isDelivery ? 'left-[26px]' : 'left-0.5'}`} />
          {isDelivery && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white text-[9px] font-bold">✓</span>}
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-1">
        No se puede modificar en edición
      </p>
    </div>
  );
}

const generateTempId = () => Date.now() + Math.random();

const normalizeSearchText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const normalizeCompactSearchText = (value) =>
  normalizeSearchText(value).replace(/[^a-z0-9]/g, '');

const getInvoiceDateValue = (invoice = {}) => {
  const rawDate = invoice.saleDate || invoice.createdAt || invoice.date || invoice.fechaVenta;
  const time = rawDate ? new Date(rawDate).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

const getInvoiceClientDocument = (invoice = {}) => (
  invoice.clientDocument ||
  invoice.clienteDocumento ||
  invoice.customerDocument ||
  invoice.document ||
  invoice.documentNumber ||
  invoice.clientDocumentNumber ||
  invoice.client_document ||
  invoice.client_document_number ||
  invoice.identification ||
  invoice.clientIdentification ||
  invoice.client_identification ||
  ''
);

const getClientDocument = (client = {}) => (
  client.document ||
  client.documentNumber ||
  client.numberDocument ||
  client.identification ||
  ''
);

const getClientFullName = (client = {}) => (
  client.fullName ||
  [client.firstName, client.lastName].filter(Boolean).join(' ') ||
  ''
).trim();

const findClientsByDocument = async (search) => {
  const compactSearch = normalizeCompactSearchText(search);
  if (compactSearch.length < 3) return [];

  const response = await clientsService.getAll({ page: 1, limit: 10000, search: '' });
  const clients = Array.isArray(response?.data) ? response.data : [];

  return clients.filter((client) => {
    const compactDocument = normalizeCompactSearchText(getClientDocument(client));
    return compactDocument.includes(compactSearch) || compactSearch.includes(compactDocument);
  });
};

const mergeAvailableInvoices = (...groups) => {
  const merged = new Map();

  groups.flat().filter(Boolean).forEach((invoice) => {
    const key = [
      invoice.idSale || invoice.id_sale || invoice.id || '',
      invoice.invoiceNumber || invoice.invoice_number || invoice.noFactura || '',
      invoice.clientId || invoice.client_id || '',
    ].join('-');

    if (!merged.has(key)) {
      merged.set(key, invoice);
    }
  });

  return Array.from(merged.values());
};

const getReturnableProductKey = (product = {}) => [
  normalizeSearchText(product.nombre || product.productName || ''),
  Number(product.cantidad ?? product.quantity ?? 0),
  Number(product.precioUnit ?? product.unitPrice ?? 0),
].join('|');

const normalizeReturnableProducts = (details = []) => {
  const productsByKey = new Map();

  details.forEach((detail, index) => {
    const product = {
      id: detail.idSaleDetail ||
        detail.id_sale_detail ||
        detail.idSaleProduct ||
        detail.id_sale_product ||
        `${detail.idProduct || detail.productName || 'product'}-${detail.idBarcode || detail.barcode || index}`,
      idProduct: detail.idProduct,
      nombre: detail.productName,
      cantidad: detail.quantity,
      precioUnit: detail.unitPrice || 0,
      imagen: detail.imageUrl || null,
      barcode: detail.barcode,
      idBarcode: detail.idBarcode
    };
    const key = getReturnableProductKey(product);

    if (!productsByKey.has(key)) {
      productsByKey.set(key, product);
    }
  });

  return Array.from(productsByKey.values());
};

const parseCurrencyNumber = (value) => {
  if (typeof value === 'number') return value;
  const digits = String(value ?? '').replace(/[^\d.-]/g, '');
  const number = Number(digits);
  return Number.isFinite(number) ? number : 0;
};

const mapSaleToInvoiceOption = (sale = {}) => {
  const idSale =
    sale.idSale ??
    sale.idVending ??
    sale.id_vending ??
    sale.id ??
    '';
  const invoiceNumber =
    sale.invoiceNumber ??
    sale.invoice_number ??
    sale.noFactura ??
    sale.factura ??
    idSale;

  return {
    ...sale,
    idSale,
    invoiceNumber: String(invoiceNumber ?? ''),
    clientId: sale.clientId ?? sale.clienteId ?? sale.idClient ?? sale.customerId ?? '',
    clientName: sale.clientName ?? sale.cliente ?? sale.deliveryRecipientName ?? '',
    employeeName: sale.employeeName ?? sale.asesor ?? sale.vendedor ?? '',
    clientPhone: sale.clientPhone ?? sale.telefono ?? sale.phone ?? '',
    clientDocument: sale.clientDocument ?? sale.clienteDocumento ?? sale.customerDocument ?? '',
    saleDate: sale.saleDate ?? sale.fechaPago ?? sale.createdAt ?? sale.creationDate ?? sale.fecha ?? '',
    total: sale.totalNumerico ?? sale.totalAmount ?? parseCurrencyNumber(sale.total),
  };
};

const getSaleLookupValue = (sale = {}) =>
  String(
    sale.idSale ??
    sale.idVending ??
    sale.id_vending ??
    sale.id ??
    sale.invoiceNumber ??
    sale.invoice_number ??
    sale.factura ??
    ''
  ).trim();

const findInvoiceBySale = (invoices = [], sale = {}) => {
  const lookup = getSaleLookupValue(sale);
  if (!lookup) return null;

  return invoices.find((invoice) => {
    const invoiceSaleId = String(invoice?.idSale ?? invoice?.id_sale ?? '').trim();
    const invoiceNumber = String(invoice?.invoiceNumber ?? invoice?.invoice_number ?? '').trim();
    return invoiceSaleId === lookup || invoiceNumber === lookup;
  }) || null;
};

const isClientHistorySearch = (term, invoice = {}) => {
  const normalizedTerm = normalizeSearchText(term);
  const compactTerm = normalizeCompactSearchText(term);
  if (normalizedTerm.length < 2) return false;

  return [
    invoice.clientName,
    invoice.client_name,
    invoice.clientId,
    invoice.client_id,
    getInvoiceClientDocument(invoice),
  ].some((value) => {
    const normalizedValue = normalizeSearchText(value);
    const compactValue = normalizeCompactSearchText(value);
    return normalizedValue.includes(normalizedTerm) || (
      compactTerm.length >= 2 && compactValue.includes(compactTerm)
    );
  });
};

// ======================= COMPONENTE: PRODUCTO SELECCIONADO (EDICIÓN) =======================

function ProductoSeleccionadoEditMode({ producto, configs, onConfigChange }) {
  const [expanded, setExpanded] = useState(true);
  const maxTotalQuantity = producto?.cantidad || 0;
  const totalQuantityUsed = configs?.reduce((sum, cfg) => sum + (cfg.cantidad || 0), 0) || 0;

  const handleStatusChange = (index, newStatus) => {
    if (isFinalProductStatus(configs[index]?.estado)) return;
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], estado: newStatus };
    onConfigChange(newConfigs);
  };

  if (!producto) return null;

  return (
    <div className="border rounded-lg transition-colors border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-t-xl">
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className="text-[#004D77] hover:text-[#003d61] transition cursor-pointer flex-shrink-0">
          <ChevronLeft className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
        </button>
        <input type="checkbox" checked readOnly disabled
          className="accent-[#004D77] w-4 h-4 cursor-not-allowed flex-shrink-0 opacity-50" />
        <ProductoImg src={producto.imagen} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{producto.nombre}</p>
          <p className="text-[11px] text-gray-500">
            Usados: {totalQuantityUsed} de {maxTotalQuantity} | {configs.length} config(s)
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400">Total</p>
          <p className="text-xs font-bold text-gray-700">${formatCOP(maxTotalQuantity * (producto.precioUnit || 0))}</p>
        </div>
      </div>

      {expanded && (
        <div className="bg-white px-3 py-3 border-t border-gray-100 rounded-b-xl">
          {configs.map((config, index) => (
            <div key={config.id} className={index > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
              {configs.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600">Configuración {index + 1} de {configs.length}</span>
                  <div className="text-gray-400 text-[10px]">Bloqueado</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Motivo</label>
                  <div className="w-full px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    {formatReasonLabel(config.motivo)}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">No se puede modificar en edición</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado<span className="text-red-500">*</span></label>
                  <EstadoBadgeSelect 
                    value={config.estado} 
                    onChange={(v) => handleStatusChange(index, v)}
                    metodo={config.metodo}
                    disabled={isFinalProductStatus(config.estado)}
                  />
                  {isFinalProductStatus(config.estado) && (
                    <p className="mt-1 text-[10px] font-medium text-green-600">
                      Estado final bloqueado
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Método devolución</label>
                  <div className="w-full px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    {config.metodo || '—'}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">No se puede modificar en edición</p>
                  {config.metodo === 'Saldo a favor' && (
                    <p className={`mt-2 text-[11px] font-semibold ${
                      config.creditApplied
                        ? 'text-green-700'
                        : config.applyCredit
                          ? 'text-amber-700'
                          : 'text-gray-500'
                    }`}>
                      {config.creditApplied
                        ? 'Saldo a favor aplicado al cliente'
                        : config.applyCredit
                          ? isFinalProductStatus(config.estado)
                            ? 'Pendiente de acreditar. Se aplicará al guardar cambios'
                            : 'Se aplicará cuando el producto llegue a Listo'
                          : 'No se solicitó aplicar saldo a favor'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                  <div className="w-full px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    {config.cantidad || 1}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">No se puede modificar en edición</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================= COMPONENTE: PRODUCTO SELECCIONADO (CREACIÓN) =======================

function ProductoSeleccionadoCreateMode({ producto, configs, onConfigsChange, onRemove, submitted }) {
  const [expanded, setExpanded] = useState(true);
  const [touched, setTouched] = useState({});
  const maxTotalQuantity = producto?.cantidad || 0;

  const totalQuantityUsed = configs?.reduce((sum, cfg) => sum + (cfg.cantidad || 0), 0) || 0;
  const remainingQuantity = maxTotalQuantity - totalQuantityUsed;

  if (!producto) return null;

  const validateField = (name, value, config = {}) => {
    if (name === 'motivo' && (!value || !value.trim())) return 'Seleccione el motivo de la devolución';
    if (name === 'metodo' && (!value || !value.trim())) return 'Seleccione el método de devolución';
    if (name === 'descripcionMotivo' && config.motivo === 'OTRO') {
      if (!value?.trim()) return 'Describe el motivo de la devolución';
      if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
      if (value.length > 255) return 'La descripción no puede superar 255 caracteres';
    }
    if (name === 'cantidad') {
      const quantity = Number(value);
      if (!Number.isInteger(quantity) || quantity < 1) return 'La cantidad debe ser un número entero mayor a 0';
      if (quantity > maxTotalQuantity) return `No puede superar ${maxTotalQuantity} unidades`;
    }
    return '';
  };

  const handleMetodoChange = (index, newMetodo) => {
    const newConfigs = [...configs];
    const newState = getInitialStateForMethod(newMetodo);
    newConfigs[index] = {
      ...newConfigs[index],
      metodo: newMetodo,
      estado: newState,
      applyCredit: newMetodo === 'Saldo a favor'
        ? true
        : false
    };
    onConfigsChange(newConfigs);
  };

  const handleConfigChange = (index, field, value) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    if (field === 'motivo' && value !== 'OTRO') {
      newConfigs[index].descripcionMotivo = '';
    }
    onConfigsChange(newConfigs);
    setTouched((prev) => ({ ...prev, [`${index}-${field}`]: true }));
  };

  const handleConfigBlur = (index, field) => {
    setTouched(prev => ({ ...prev, [`${index}-${field}`]: true }));
  };

  const handleAddConfig = () => {
    if (remainingQuantity <= 0) return;
    const newConfig = {
      id: generateTempId(),
      motivo: '',
      descripcionMotivo: '',
      estado: 'Pend. envio',
      metodo: '',
      applyCredit: false,
      cantidad: 1
    };
    onConfigsChange([...configs, newConfig]);
  };

  const handleRemoveConfig = (index) => {
    if (configs.length <= 1) {
      onRemove();
      return;
    }
    const newConfigs = configs.filter((_, i) => i !== index);
    onConfigsChange(newConfigs);
  };

  const renderConfigError = (configIndex, field, value, config) => {
    if ((touched[`${configIndex}-${field}`] || submitted) && validateField(field, value, config)) {
      return <p className="mt-0.5 text-xs text-red-600">{validateField(field, value, config)}</p>;
    }
    return null;
  };

  const configFieldClass = (configIndex, field, value, config) => {
    const hasError = (touched[`${configIndex}-${field}`] || submitted) && validateField(field, value, config);
    return `h-10 w-full px-3 py-0 text-sm border rounded-lg outline-none bg-white text-gray-700 transition-colors cursor-pointer ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;
  };

  const configTextareaClass = (configIndex, field, value, config) => {
    const hasError = (touched[`${configIndex}-${field}`] || submitted) && validateField(field, value, config);
    return `w-full min-h-[86px] px-3 py-2.5 text-sm leading-5 border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors resize-none ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;
  };

  return (
    <div className="border rounded-lg transition-colors border-gray-300 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-t-xl">
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className="text-[#004D77] hover:text-[#003d61] transition cursor-pointer flex-shrink-0">
          <ChevronLeft className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
        </button>
        <input type="checkbox" checked readOnly
          className="accent-[#004D77] w-4 h-4 cursor-pointer flex-shrink-0"
          onClick={onRemove} />
        <ProductoImg src={producto.imagen} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{producto.nombre}</p>
          <p className="text-[11px] text-gray-500">
            Usados: {totalQuantityUsed} de {maxTotalQuantity} | {configs.length} config(s)
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400">Total</p>
          <p className="text-xs font-bold text-gray-700">${formatCOP(maxTotalQuantity * (producto.precioUnit || 0))}</p>
        </div>
      </div>

      {expanded && (
        <div className="bg-white px-3 py-3 border-t border-gray-100 rounded-b-xl">
          {configs.map((config, index) => (
            <div key={config.id} className={index > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
              {configs.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600">Configuración {index + 1} de {configs.length}</span>
                  <button type="button" onClick={() => handleRemoveConfig(index)}
                    className="text-gray-400 hover:text-red-500 transition cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Motivo<span className="text-red-500">*</span></label>
                  <FormSelect
                    value={config.motivo}
                    options={MOTIVO_OPTIONS}
                    onChange={(value) => {
                      handleConfigBlur(index, 'motivo');
                      handleConfigChange(index, 'motivo', value);
                    }}
                    error={Boolean((touched[`${index}-motivo`] || submitted) && validateField('motivo', config.motivo, config))}
                    placeholder="Selecciona una opción"
                    ariaLabel="Motivo de devolución"
                    className={RETURN_SELECT_CLASS}
                    placement="bottom"
                  />
                  {renderConfigError(index, 'motivo', config.motivo, config)}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Método devolución<span className="text-red-500">*</span></label>
                  <FormSelect
                    value={config.metodo}
                    options={METODO_OPTIONS}
                    onChange={(value) => {
                      handleConfigBlur(index, 'metodo');
                      handleMetodoChange(index, value);
                    }}
                    error={Boolean((touched[`${index}-metodo`] || submitted) && validateField('metodo', config.metodo, config))}
                    placeholder="Selecciona una opción"
                    ariaLabel="Método de devolución"
                    className={RETURN_SELECT_CLASS}
                    placement="bottom"
                  />
                  {renderConfigError(index, 'metodo', config.metodo, config)}
                  {config.metodo === 'Saldo a favor' && (
                    <p className="mt-2 text-[11px] font-semibold text-green-700">
                      Saldo a favor automático. Se acreditará automáticamente cuando el producto llegue a Listo.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado<span className="text-red-500">*</span></label>
                  <EstadoBadgeSelect 
                    value={config.estado} 
                    onChange={(v) => handleConfigChange(index, 'estado', v)}
                    metodo={config.metodo}
                  />
                  {config.metodo && (
                    <p className="text-[10px] text-gray-400 mt-1">Estados para {config.metodo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad<span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => {
                        const currentValue = Math.max(1, Number(config.cantidad) || 1);
                        const newValue = Math.max(1, currentValue - 1);
                        handleConfigChange(index, 'cantidad', newValue);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={Math.max(1, Number(config.cantidad) || 1)}
                      min={1} 
                      max={remainingQuantity + Math.max(1, Number(config.cantidad) || 1)}
                      onChange={(e) => {
                        const cleanValue = onlyDigits(e.target.value);
                        const typedValue = cleanValue === '' ? 1 : Number(cleanValue);
                        const currentValue = Math.max(1, Number(config.cantidad) || 1);
                        const newValue = Math.min(
                          remainingQuantity + currentValue,
                          Math.max(1, Number.isFinite(typedValue) ? typedValue : 1)
                        );
                        handleConfigChange(index, 'cantidad', newValue);
                      }}
                      onBlur={() => handleConfigBlur(index, 'cantidad')}
                      className={configFieldClass(index, 'cantidad', config.cantidad, config).replace('w-full', 'w-16 text-center')} />
                    <button 
                      type="button" 
                      onClick={() => {
                        const currentValue = Math.max(1, Number(config.cantidad) || 1);
                        const newValue = Math.min(remainingQuantity + currentValue, currentValue + 1);
                        handleConfigChange(index, 'cantidad', newValue);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Max disponible: {remainingQuantity + Math.max(1, Number(config.cantidad) || 1)}
                  </span>
                  {renderConfigError(index, 'cantidad', config.cantidad, config)}
                </div>
              </div>

              {config.motivo === 'OTRO' && (
                <div className="mt-3 col-span-2 rounded-lg border border-gray-100 bg-gray-50/60 p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Descripción del motivo<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={config.descripcionMotivo || ''}
                    onChange={(e) => handleConfigChange(index, 'descripcionMotivo', e.target.value.slice(0, REASON_DESCRIPTION_MAX_LENGTH))}
                    onBlur={() => handleConfigBlur(index, 'descripcionMotivo')}
                    maxLength={REASON_DESCRIPTION_MAX_LENGTH}
                    placeholder="Explica brevemente el motivo de la devolución"
                    rows={3}
                    className={configTextareaClass(index, 'descripcionMotivo', config.descripcionMotivo || '', config)}
                  />
                  <div className="mt-1.5 flex items-start justify-between gap-3">
                    <div className="min-h-[18px]">
                      {renderConfigError(index, 'descripcionMotivo', config.descripcionMotivo || '', config)}
                    </div>
                    <span className="ml-auto text-[10px] text-gray-400">
                      {(config.descripcionMotivo || '').length}/{REASON_DESCRIPTION_MAX_LENGTH}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {remainingQuantity > 0 && (
            <button
              type="button"
              onClick={handleAddConfig}
              className="mt-4 w-full py-2 border border-dashed border-[#004D77] rounded-lg text-[#004D77] text-xs font-semibold hover:bg-[#004D77]/5 transition cursor-pointer"
            >
              + Agregar otra configuración ({remainingQuantity} unidades restantes)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ======================= COMPONENTE PRINCIPAL =======================

function FormReturn({ isOpen, onClose, returnData = null, preselectedSale = null, onSave }) {
  const isEdit = Boolean(returnData);
  const { showConfirm, showError, showSuccess } = useAlert();

  // ==================== ESTADOS ====================
  const [noFactura, setNoFactura] = useState('');
  const [cliente, setCliente] = useState('');
  const [idVentaSeleccionada, setIdVentaSeleccionada] = useState(null);
  const [asesor, setAsesor] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estadoGral, setEstadoGral] = useState('Pendiente');
  const [evidencias, setEvidencias] = useState([]);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [deletedEvidenceIds, setDeletedEvidenceIds] = useState([]);
  const [domicilio, setDomicilio] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [seleccionados, setSeleccionados] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  
  // ==================== ESTADOS PARA BUSCADOR DE FACTURAS ====================
  const [facturasDisponibles, setFacturasDisponibles] = useState([]);
  const [searchTermFactura, setSearchTermFactura] = useState('');
  const [showDropdownFactura, setShowDropdownFactura] = useState(false);
  const [cargandoFacturas, setCargandoFacturas] = useState(false);
  const facturaInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const facturaSearchTimeoutRef = useRef(null);
  const facturaRequestIdRef = useRef(0);
  const preselectedSaleKeyRef = useRef('');

  // ==================== VALIDACIÓN ====================
  const [errors, setErrors] = useState({
    noFactura: '',
    cliente: '',
    asesor: '',
    direccion: '',
    evidencias: '',
    productos: ''
  });
  const [touched, setTouched] = useState({
    noFactura: false,
    cliente: false,
    asesor: false,
    direccion: false,
    evidencias: false
  });

  // ==================== EFECTOS ====================
useEffect(() => {
  if (returnData) {
    setNoFactura(returnData.invoiceNumber ?? returnData.numeroFactura ?? returnData.noFactura ?? '');
    setCliente(returnData.clientName ?? returnData.cliente ?? '');
    setIdVentaSeleccionada(returnData.idSale ?? returnData.id_sale ?? returnData.id);
    setAsesor(returnData.employeeName ?? returnData.asesor ?? '');
    setTelefono(returnData.clientPhone ?? returnData.telefono ?? '');
    setEstadoGral(returnData.status ?? returnData.estado ?? 'En Proceso');
    setDescripcion(returnData.description ?? returnData.descripcion ?? '');
    setDomicilio(returnData.hasDelivery ?? returnData.domicilio ?? false);
    setDireccion(returnData.deliveryAddress ?? returnData.direccion ?? '');
    setEvidencias(returnData.evidences ?? returnData.evidencias ?? []);
    setEvidenceDescription(returnData.evidenceDescription || '');

    const productosDisponiblesList = [];
    const seleccionadosIniciales = {};
    const returnDetails = returnData.details || returnData.productosDevueltos || [];

    if (returnDetails.length > 0) {
      returnDetails.forEach(p => {
        const detailId = p.idSaleReturnDetail || p.id;
        if (!detailId) return;

        productosDisponiblesList.push({
          id: detailId,
          nombre: p.productName || p.nombre,
          cantidad: p.quantity || p.cantidad || 1,
          precioUnit: p.unitPrice || p.precioUnit || 0,
          imagen: p.imageUrl || p.imagen || null,
          barcode: p.barcode,
          idBarcode: p.idBarcode
        });

        if (!seleccionadosIniciales[detailId]) {
          seleccionadosIniciales[detailId] = [];
        }

        seleccionadosIniciales[detailId].push({
          id: detailId,
          motivo: p.reason || p.motivo || '',
          descripcionMotivo: p.description || p.descripcionMotivo || '',
          estado: p.status || p.estado || 'Pend. envio',
          metodo: p.method || p.metodo || '',
          applyCredit: (p.method || p.metodo || '') === 'Saldo a favor' ? true : p.applyCredit === true,
          creditApplied: p.creditApplied === true,
          cantidad: p.quantity || p.cantidad || 1
        });
      });
    }

    setProductosDisponibles(productosDisponiblesList);
    setCargandoProductos(false);
    setSeleccionados(seleccionadosIniciales);
  } else {
    setNoFactura(''); setCliente(''); setIdVentaSeleccionada(null);
    setAsesor(''); setTelefono('');
    setEstadoGral('En Proceso');
    setEvidencias([]);
    setEvidenceDescription('');
    setDeletedEvidenceIds([]);
    setDomicilio(false);
    setDireccion('');
    setDescripcion('');
    setSeleccionados({});
    setProductosDisponibles([]);
    setCargandoProductos(false);
    setFacturasDisponibles([]);
    setSearchTermFactura('');
    setShowDropdownFactura(false);
  }
  setSubmitted(false);
  setErrors({
    noFactura: '',
    cliente: '',
    asesor: '',
    direccion: '',
    evidencias: '',
    productos: ''
  });
  setTouched({
    noFactura: false,
    cliente: false,
    asesor: false,
    direccion: false,
    evidencias: false
  });
}, [returnData, isOpen]);

  // ==================== CARGAR FACTURAS ====================
  const cargarFacturas = async (search = '') => {
    const requestId = facturaRequestIdRef.current + 1;
    facturaRequestIdRef.current = requestId;

    try {
      setCargandoFacturas(true);
      const normalizedSearch = String(search ?? '').trim();
      const facturas = await getAvailableInvoices(normalizedSearch);
      const documentClients = normalizedSearch
        ? await findClientsByDocument(normalizedSearch)
        : [];
      const invoicesByDocument = await Promise.all(
        documentClients
          .map(getClientFullName)
          .filter(Boolean)
          .map((clientName) => getAvailableInvoices(clientName))
      );
      if (requestId !== facturaRequestIdRef.current) return;

      const normalizedInvoices = mergeAvailableInvoices(
        Array.isArray(facturas) ? facturas : [],
        ...invoicesByDocument.map((items) => Array.isArray(items) ? items : [])
      );
      setFacturasDisponibles(normalizedInvoices);
      setShowDropdownFactura(normalizedInvoices.length > 0);
    } catch {
      if (requestId !== facturaRequestIdRef.current) return;
      setFacturasDisponibles([]);
      setShowDropdownFactura(false);
    } finally {
      if (requestId === facturaRequestIdRef.current) {
        setCargandoFacturas(false);
      }
    }
  };

  // ==================== SELECCIONAR FACTURA ====================
  const seleccionarFactura = async (factura) => {
    if (!factura) return;

    setProductosDisponibles([]);
    setSeleccionados({});

    setNoFactura(factura.invoiceNumber);
    setCliente(factura.clientName);
    setIdVentaSeleccionada(factura.idSale);
    setAsesor(factura.employeeName || '');
    setTelefono(factura.clientPhone || '');
    setSearchTermFactura(`${factura.invoiceNumber} - ${factura.clientName}`);
    setShowDropdownFactura(false);
    setTouched(prev => ({ ...prev, noFactura: true, cliente: true, asesor: true }));
    setErrors(prev => ({
      ...prev,
      noFactura: '',
      cliente: validateField('cliente', factura.clientName || ''),
      asesor: validateField('asesor', factura.employeeName || ''),
    }));

    try {
      setCargandoProductos(true);
      const saleDetails = await getReturnableSales(factura.clientId);
      const sale = saleDetails.find(s => String(s.invoiceNumber) === String(factura.invoiceNumber));
      
      if (sale && sale.details && sale.details.length > 0) {
        const productos = normalizeReturnableProducts(sale.details);
        
        setProductosDisponibles(productos);
        setSeleccionados({});
        
        if (productos.length === 0) {
          showError('Sin productos', 'Esta factura no tiene productos disponibles');
        }
      } else {
        setProductosDisponibles([]);
        setSeleccionados({});
      }

      showSuccess('Factura cargada', `Factura #${factura.invoiceNumber} cargada correctamente`);
    } catch {
      setProductosDisponibles([]);
      setSeleccionados({});
    } finally {
      setCargandoProductos(false);
    }
  };

  const cargarFacturaPreseleccionada = async (sale) => {
    const fallbackInvoice = mapSaleToInvoiceOption(sale);
    const lookup = getSaleLookupValue(fallbackInvoice);

    if (!lookup) return;

    try {
      setCargandoFacturas(true);
      const invoices = await getAvailableInvoices(lookup);
      const invoice = findInvoiceBySale(Array.isArray(invoices) ? invoices : [], fallbackInvoice);

      if (!invoice) {
        showError(
          'Factura no encontrada',
          'No se pudo cargar la venta seleccionada. Intenta buscar la factura manualmente.',
        );
        return;
      }

      if (invoice.hasReturn) {
        showError(
          'Devolución ya registrada',
          `Esta venta ya tiene asociada la devolución ${invoice.returnNumber || 'registrada'}.`,
        );
        return;
      }

      if (invoice.isAnnulled) {
        showError('Venta anulada', 'No es posible generar devolución sobre una venta anulada.');
        return;
      }

      if (invoice.canReturn === false) {
        showError(
          'Devolución no permitida',
          invoice.returnBlockReason || 'Esta venta no cumple las condiciones para devolución.',
        );
        return;
      }

      await seleccionarFactura(invoice);
    } catch {
      showError(
        'No se pudo cargar la venta',
        'Ocurrió un problema cargando la factura seleccionada. Intenta buscarla manualmente.',
      );
    } finally {
      setCargandoFacturas(false);
    }
  };

  useEffect(() => {
    if (!isOpen || isEdit || !preselectedSale) {
      if (!isOpen) preselectedSaleKeyRef.current = '';
      return;
    }

    const saleKey = getSaleLookupValue(preselectedSale);

    if (!saleKey || preselectedSaleKeyRef.current === saleKey) return;

    preselectedSaleKeyRef.current = saleKey;
    cargarFacturaPreseleccionada(preselectedSale);
  }, [isOpen, isEdit, preselectedSale]);

  // ==================== FILTRAR FACTURAS ====================
  const facturasFiltradas = useMemo(() => {
    const term = normalizeSearchText(searchTermFactura);
    return [...facturasDisponibles]
      .sort((a, b) => getInvoiceDateValue(b) - getInvoiceDateValue(a))
      .slice(0, term ? facturasDisponibles.length : 5);
  }, [facturasDisponibles, searchTermFactura]);

  useEffect(() => () => {
    if (facturaSearchTimeoutRef.current) {
      window.clearTimeout(facturaSearchTimeoutRef.current);
    }
  }, []);

  // ==================== EFECTO PARA CERRAR DROPDOWN ====================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          facturaInputRef.current && !facturaInputRef.current.contains(event.target)) {
        setShowDropdownFactura(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== AUTO-CALCULAR ESTADO GENERAL ====================
  useEffect(() => {
    const productosDevueltosData = Object.entries(seleccionados)
      .flatMap(([id, configs]) => {
        const producto = productosDisponibles.find(p => String(p.id) === String(id));
        if (!producto || !configs) return [];

        return configs.map((config) => ({
          id: producto.id,
          configId: config.id,
          nombre: producto.nombre,
          cantidad: config.cantidad,
          precioUnit: producto.precioUnit,
          motivo: config.motivo,
          metodo: config.metodo,
          estado: config.estado
        }));
      });

    if (productosDevueltosData.length > 0) {
      const estadoCalculado = calculateGeneralStatus(productosDevueltosData, false);
      setEstadoGral(estadoCalculado);
    } else {
      setEstadoGral('En Proceso');
    }
  }, [seleccionados, productosDisponibles]);

  // ==================== VALIDACIONES ====================
  const validateField = (name, value) => {
    if (isEdit) return '';

    if (name === 'direccion' && value && value.length > ADDRESS_MAX_LENGTH) {
      return `La dirección no puede superar ${ADDRESS_MAX_LENGTH} caracteres`;
    }

    if (name === 'descripcion' && value && value.length > GENERAL_DESCRIPTION_MAX_LENGTH) {
      return `La descripción no puede superar ${GENERAL_DESCRIPTION_MAX_LENGTH} caracteres`;
    }
    
    switch (name) {
      case 'noFactura':
        if (!value || !value.trim()) return 'Debe seleccionar una factura';
        return '';
      case 'cliente':
        if (!value || !value.trim()) return 'El nombre del cliente es obligatorio';
        return '';
      case 'asesor':
        if (!value || !value.trim()) return 'El nombre del asesor es obligatorio';
        return '';
      case 'direccion':
        if (domicilio) {
          if (!value || !value.trim()) return 'La dirección es obligatoria';
        }
        return '';
      case 'evidencias':
        if (domicilio) {
          if (!value || value.length === 0) return 'Debe adjuntar al menos una evidencia';
        }
        return '';
      case 'descripcion':
        if (value && value.length > 500) return 'La descripción no puede superar 500 caracteres';
        return '';
      default:
        return '';
    }
  };

  const validateProductos = (selectedProducts = seleccionados) => {
    if (isEdit) return '';
    
    const productosConConfigs = Object.entries(selectedProducts)
      .filter(([, configs]) => configs && configs.length > 0);

    if (productosConConfigs.length === 0) {
      return 'Seleccione al menos un producto';
    }
    
    for (const [productId, configs] of productosConConfigs) {
      const product = productosDisponibles.find((item) => String(item.id) === String(productId));
      const configuredQuantity = configs.reduce(
        (total, config) => total + Number(config.cantidad || 0),
        0
      );

      if (product && configuredQuantity > Number(product.cantidad || 0)) {
        return `La cantidad configurada de ${product.nombre} supera la cantidad vendida`;
      }

      for (const config of configs) {
        if (!config.motivo) return 'Falta motivo en una configuración';
        if (!config.metodo) return 'Falta método en una configuración';
        if (!Number.isInteger(Number(config.cantidad)) || Number(config.cantidad) < 1) {
          return 'Todas las cantidades deben ser enteros mayores a 0';
        }
        if (config.motivo === 'OTRO' && (config.descripcionMotivo || '').trim().length < 10) {
          return 'La descripción del motivo Otro debe tener al menos 10 caracteres';
        }
      }
    }
    return '';
  };

  // ==================== HANDLERS ====================
  const handleFieldChange = (field, value) => {
    if (isEdit) return;
    switch (field) {
      case 'cliente': setCliente(value); break;
      case 'asesor': setAsesor(value); break;
      case 'direccion': setDireccion(value); break;
      case 'descripcion': setDescripcion(value); break;
      default: break;
    }
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleBlur = (field) => {
    if (isEdit) return;
    setTouched(prev => ({ ...prev, [field]: true }));
    let value;
    switch (field) {
      case 'cliente': value = cliente; break;
      case 'asesor': value = asesor; break;
      case 'direccion': value = direccion; break;
      case 'descripcion': value = descripcion; break;
      default: value = '';
    }
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const toggleProducto = (prod) => {
    if (isEdit) return;
    
    setSeleccionados((prev) => {
      if (prev[prod.id]) {
        const next = { ...prev };
        delete next[prod.id];
        return next;
      }
      return {
        ...prev,
        [prod.id]: [
          {
            id: generateTempId(),
            motivo: '',
            estado: 'Pend. envio',
            metodo: '',
            applyCredit: false,
            cantidad: 1
          }
        ]
      };
    });
    
    setTimeout(() => {
      const prodError = validateProductos();
      setErrors(prev => ({ ...prev, productos: prodError }));
    }, 0);
  };

  const updateConfigs = (id, nuevasConfigs) => {
    setSeleccionados((prev) => {
      const nuevo = { ...prev, [id]: nuevasConfigs };
      setErrors((current) => ({
        ...current,
        productos: validateProductos(nuevo),
      }));
      return nuevo;
    });
  };

  const updateConfigsEditMode = (id, nuevasConfigs) => {
    setSeleccionados((prev) => ({
      ...prev,
      [id]: nuevasConfigs
    }));
  };

  const toggleAll = () => {
    if (isEdit) return;
    
    const totalProductos = productosDisponibles.length;
    const seleccionadosCount = Object.keys(seleccionados).length;
    
    if (seleccionadosCount === totalProductos && totalProductos > 0) {
      setSeleccionados({});
    } else {
      const all = {};
      productosDisponibles.forEach((p) => {
        all[p.id] = seleccionados[p.id] || [
          {
            id: generateTempId(),
            motivo: '',
            estado: 'Pend. envio',
            metodo: '',
            applyCredit: false,
            cantidad: 1
          }
        ];
      });
      setSeleccionados(all);
    }
    
    setTimeout(() => {
      const prodError = validateProductos();
      setErrors(prev => ({ ...prev, productos: prodError }));
    }, 0);
  };

  // ==================== CALCULAR TOTALES ====================
  const productosDevueltos = Object.entries(seleccionados)
    .filter((entry) => entry[1] && entry[1].length > 0)
    .map(([id, configs]) => {
      const producto = productosDisponibles.find(p => String(p.id) === String(id));
      return { producto, configs };
    })
    .filter(item => item.producto !== undefined);

  const totalUnidades = productosDevueltos.reduce((acc, { configs }) => {
    return acc + configs.reduce((sum, cfg) => sum + (cfg.cantidad || 0), 0);
  }, 0);

  const totalValor = productosDevueltos.reduce((acc, { producto, configs }) => {
    const productTotal = configs.reduce((sum, cfg) => {
      return sum + (cfg.cantidad || 0) * (producto?.precioUnit || 0);
    }, 0);
    return acc + productTotal;
  }, 0);

  const validateForm = () => {
    const newErrors = {};
    
    if (!isEdit) {
      newErrors.noFactura = validateField('noFactura', noFactura);
      newErrors.cliente = validateField('cliente', cliente);
      newErrors.asesor = validateField('asesor', asesor);
      if (domicilio) {
        newErrors.direccion = validateField('direccion', direccion);
      }
      newErrors.evidencias = validateField('evidencias', evidencias);
      newErrors.productos = validateProductos();
      newErrors.descripcion = validateField('descripcion', descripcion);
    }
    
    return newErrors;
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async () => {
    if (saving) return;
    setSubmitted(true);
    
   if (isEdit) {
  const productosDevueltosData = [];
  
  Object.entries(seleccionados).forEach(([id, configs]) => {
    const producto = productosDisponibles.find(p => String(p.id) === String(id));
    if (!producto) return;
    
    configs.forEach((config) => {
      productosDevueltosData.push({
        id: config.id,
        productName: producto.nombre,
        quantity: config.cantidad || 1,
        unitPrice: producto.precioUnit || 0,
        reason: config.motivo,
        description: config.descripcionMotivo || '',
          method: config.metodo,
          applyCredit: config.metodo === 'Saldo a favor' ? true : config.applyCredit === true,
          status: config.estado,
          barcode: producto.barcode || '',
          idBarcode: producto.idBarcode || null,
          imageUrl: producto.imagen || ''
      });
    });
  });

  const updatedData = {
    ...returnData,
    idSale: returnData.idSale || returnData.id_sale || returnData.id,
    status: estadoGral,
    description: descripcion,
    details: productosDevueltosData.map(d => ({
      idSaleReturnDetail: d.id,
      idReturnStatus: getStatusId(d.status) || 7,  
      idReturnMethod: getMethodId(d.method) || 1
    })),
    updatedAt: new Date().toISOString()
  };
      
      const evidenceFiles = evidencias
        .filter(ev => ev instanceof File)
        .map(ev => ev);

      const existingEvidenceIds = evidencias
        .filter(ev => ev.id && !(ev instanceof File))
        .map(ev => ev.id);

      try {
        setSaving(true);
        await onSave?.({
          ...updatedData,
          evidenceFiles: evidenceFiles,
          evidenceDescription: evidenceDescription || descripcion || '',
          deletedEvidenceIds: deletedEvidenceIds,
          existingEvidenceIds: existingEvidenceIds
        });
      } finally {
        setSaving(false);
      }
      return;
    }
    
    // ==================== CREACIÓN ====================
    setTouched({
      noFactura: true,
      cliente: true,
      asesor: true,
      direccion: domicilio,
      evidencias: domicilio
    });
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(error => error && error.length > 0);
    
    if (hasErrors) {
      showError(
        'Faltan datos para guardar',
        'Revisa los campos marcados en rojo. En cada producto seleccionado debes completar motivo, método, estado y cantidad.'
      );
      return;
    }

    const productosDevueltosData = [];
    
    Object.entries(seleccionados).forEach(([id, configs]) => {
      const producto = productosDisponibles.find(p => String(p.id) === String(id));
      if (!producto) return;
      
      configs.forEach((config) => {
        productosDevueltosData.push({
          idProduct: producto.idProduct || producto.id,
          productName: producto.nombre,
          quantity: config.cantidad || 1,
          unitPrice: producto.precioUnit || 0,
          reason: config.motivo,
          description: config.descripcionMotivo || '',
          method: config.metodo,
          applyCredit: config.metodo === 'Saldo a favor' ? true : config.applyCredit === true,
          status: config.estado,
          barcode: producto.barcode || '',
          idBarcode: producto.idBarcode || null,
          imageUrl: producto.imagen || '',
          reasonName: config.motivo,
          isDefective: ['DEFECTUOSO', 'MAL_ESTADO', 'PRODUCTO_INCOMPLETO', 'PRODUCTO_USADO'].includes(config.motivo)
        });
      });
    });

    const evidenceFiles = evidencias
      .filter(ev => ev instanceof File)
      .map(ev => ev);

    const returnDataToSave = {
  idSale: idVentaSeleccionada,
  description: descripcion || '',
  hasDelivery: domicilio,
  deliveryAddress: direccion || '',
  details: productosDevueltosData.map(p => ({
    idProduct: p.idProduct,
    productName: p.productName || '',
    imageUrl: p.imageUrl || '',
    barcode: p.barcode || '',
    quantity: p.quantity || 1,
    unitPrice: p.unitPrice || 0,
    idReturnReason: getReasonId(p.reason),
    idReturnMethod: getMethodId(p.method),
    idBarcode: p.idBarcode || null,
    reasonName: p.reasonName || '',
    isDefective: p.isDefective || false,
    applyCredit: p.method === 'Saldo a favor' ? true : p.applyCredit === true,
    descripcionMotivo: p.description || '',
    status: p.status || 'En Proceso'
  })),
  evidenceFiles: evidenceFiles,
  evidenceDescription: evidenceDescription || descripcion || ''
};

    try {
      setSaving(true);
      await onSave?.(returnDataToSave);
    } finally {
      setSaving(false);
    }
  };

  // ==================== FUNCIONES DE RENDERIZADO ====================
  const inputClass = (field) => {
    if (isEdit) return '';
    
    const hasError = errors[field] && (touched[field] || submitted);
    return `w-full border rounded-lg px-3 py-2 text-sm text-gray-500 outline-none placeholder-gray-300 transition-colors ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;
  };

  const renderError = (field) => {
    if (isEdit) return null;
    
    if ((touched[field] || submitted) && errors[field]) {
      return <p className="mt-0.5 text-xs text-red-600">{errors[field]}</p>;
    }
    return null;
  };

  const hasFormChanges = () => {
    if (isEdit) {
      return descripcion !== (returnData?.description || returnData?.descripcion || '')
        || evidencias.length > 0
        || Object.keys(seleccionados).length > 0;
    }

    return Boolean(
      noFactura ||
      cliente ||
      asesor ||
      direccion ||
      descripcion ||
      domicilio ||
      evidencias.length > 0 ||
      Object.keys(seleccionados).length > 0
    );
  };

  const handleClose = async () => {
    if (saving) return;
    if (!hasFormChanges()) {
      onClose();
      return;
    }

    const confirmed = await showConfirm(
      'warning',
      'Salir sin guardar?',
      'Los cambios no guardados se perderán.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Continuar editando' }
    );

    if (confirmed?.isConfirmed) onClose();
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-white shadow-[0_20px_60px_-10px_rgba(0,77,119,0.3)] sm:h-auto sm:max-h-[92vh] sm:max-w-[1320px] sm:rounded-2xl">
        <div className="relative flex flex-shrink-0 items-center justify-between overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-4 py-3.5 sm:px-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-16 h-28 w-28 rounded-full bg-sky-300/10" />
          <div className="relative flex min-w-0 items-center gap-3 pr-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <ClipboardList className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <h2 className="min-w-0 truncate text-[15px] font-bold tracking-wide text-white">
              {isEdit ? `Editar devolución — ${returnData?.returnNumber || returnData?.numeroDevolucion || ''}` : 'Nueva devolución'}
            </h2>
          </div>
          {isEdit && (
            <div className="relative hidden items-center gap-2 rounded-lg bg-white/20 px-3 py-1 md:flex">
              <span className="text-white text-[10px] font-medium">Modo edición: solo estados</span>
            </div>
          )}
          <button type="button" onClick={handleClose}
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/15 text-white transition hover:bg-white/25">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col divide-y divide-gray-200 overflow-y-auto lg:flex-row lg:divide-x lg:divide-y-0 lg:overflow-hidden">

          {/* COL 1 - Datos generales */}
          <div className="flex w-full flex-shrink-0 flex-col gap-3 p-4 sm:p-5 lg:w-[330px] lg:overflow-y-auto">
            {isEdit ? (
              <>
                <DisabledField label="No. Factura" value={noFactura} required />
                <div className="grid grid-cols-2 gap-2">
                  <DisabledField label="Cliente" value={cliente} required />
                  <DisabledField label="Atendió" value={asesor} required />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Estado<span className="text-red-500">*</span>
                  </label>
                  <FormSelect
                    value={estadoGral}
                    options={ESTADO_GENERAL_OPTIONS}
                    onChange={setEstadoGral}
                    disabled={isEdit}
                    placeholder="Selecciona un estado"
                    ariaLabel="Estado general de la devolución"
                    className={RETURN_SELECT_CLASS}
                    placement="bottom"
                  />
                  {isEdit && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Estado calculado automáticamente
                    </p>
                  )}
                </div>
                
                <DisabledEvidence count={evidencias.filter(ev => ev.id && !(ev instanceof File)).length + evidencias.filter(ev => ev instanceof File).length} />
                <DisabledDeliveryToggle isDelivery={domicilio} />
                {domicilio && <DisabledField label="Dirección" value={direccion} required />}
                <DisabledTextarea label="Descripción" value={descripcion} />
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Factura<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1" ref={facturaInputRef}>
                        <input
                          ref={facturaInputRef}
                          type="text"
                          value={searchTermFactura}
                          onChange={(e) => {
                            setSearchTermFactura(e.target.value);
                            setTouched(prev => ({ ...prev, noFactura: true }));
                            setErrors(prev => ({
                              ...prev,
                              noFactura: idVentaSeleccionada
                                ? ''
                                : 'Debe seleccionar una factura de la lista',
                            }));
                            if (facturaSearchTimeoutRef.current) {
                              window.clearTimeout(facturaSearchTimeoutRef.current);
                            }

                            const searchValue = e.target.value;
                            facturaSearchTimeoutRef.current = window.setTimeout(() => {
                              cargarFacturas(searchValue.trim());
                            }, searchValue.trim().length >= 1 ? 350 : 0);
                          }}
                          onFocus={() => {
                            cargarFacturas('');
                          }}
                          placeholder="Buscar venta"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
                          disabled={isEdit}
                        />
                        <button
                          type="button"
                          onClick={() => cargarFacturas(searchTermFactura)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {cargandoFacturas ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {showDropdownFactura && facturasFiltradas.length > 0 && (
                      <div ref={dropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {facturasFiltradas.map((factura, index) => {
                          const isAnnulled = factura.isAnnulled || factura.statusId === 4;
                          const isUnavailable = factura.canReturn === false;
                          const clientDocument = getInvoiceClientDocument(factura);
                          const showClientHistory = isClientHistorySearch(searchTermFactura, factura);
                          
                          return (
                            <button
                              key={`${factura.idSale || factura.invoiceNumber}-${clientDocument || index}`}
                              type="button"
                              onClick={() => {
                                if (isAnnulled) {
                                  showError('Venta anulada', 'Esta venta está anulada y no se puede generar una devolución');
                                  return;
                                }
                                if (isUnavailable) {
                                  showError(
                                    'Venta no disponible',
                                    factura.returnBlockReason || 'Esta venta no cumple las condiciones para devolución'
                                  );
                                  return;
                                }
                                seleccionarFactura(factura);
                              }}
                              className={`flex w-full items-start justify-between gap-3 border-b border-gray-100 px-4 py-2.5 text-left transition last:border-0 hover:bg-gray-50 ${(factura.hasReturn || isAnnulled || isUnavailable) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={factura.hasReturn || isAnnulled || isUnavailable}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="font-semibold text-gray-800">Factura #{factura.invoiceNumber}</span>
                                  <span className="rounded-full bg-[#004D77]/10 px-2 py-0.5 text-[10px] font-semibold text-[#004D77]">
                                    Venta ID {factura.idSale || factura.id_sale || 'N/A'}
                                  </span>
                                  {showClientHistory && (
                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                      Historial del cliente
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 truncate text-xs font-medium text-gray-600">
                                  {factura.clientName || 'Cliente sin nombre'}
                                </p>
                                {clientDocument && (
                                  <p className="mt-0.5 text-[10px] text-gray-400">
                                    Doc. {clientDocument}
                                  </p>
                                )}
                                {factura.hasReturn && (
                                  <span className="text-xs text-red-400 ml-2">(Ya tiene devolución)</span>
                                )}
                                {isAnnulled && (
                                  <span className="text-xs text-red-500 ml-2">(Venta anulada)</span>
                                )}
                                {!isAnnulled && isUnavailable && (
                                  <span className="text-xs text-amber-600 ml-2">
                                    ({factura.returnBlockReason || 'No disponible'})
                                  </span>
                                )}
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <span className="text-xs text-gray-400 block">${formatCOP(factura.total || 0)}</span>
                                <span className="text-[10px] text-gray-300">
                                  {factura.saleDate ? new Date(factura.saleDate).toLocaleDateString('es-CO') : ''}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {showDropdownFactura && facturasFiltradas.length === 0 && !cargandoFacturas && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-4 text-center text-sm text-gray-400">
                        No hay facturas disponibles
                      </div>
                    )}

                    {cargandoFacturas && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-4 text-center text-sm text-gray-400">
                        <Loader className="w-5 h-5 animate-spin mx-auto text-[#004D77]" />
                        Cargando...
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-gray-600">No. Factura<span className="text-red-500">*</span></label>
                    <BlockedFieldHint title="Se bloquea al cargar la venta seleccionada" />
                  </div>
                  <input
                    value={noFactura}
                    onChange={(e) => handleFieldChange('noFactura', e.target.value)}
                    onBlur={() => handleBlur('noFactura')}
                    placeholder="Seleccione una factura"
                    className={inputClass('noFactura')}
                    disabled={true}
                  />
                  {renderError('noFactura')}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-gray-600">Cliente<span className="text-red-500">*</span></label>
                      <BlockedFieldHint title="Dato cargado desde la venta" />
                    </div>
                    <input
                      value={cliente}
                      onChange={(e) => {
                        setCliente(e.target.value);
                      }}
                      onBlur={() => handleBlur('cliente')}
                      placeholder="Nombre del cliente"
                      className={inputClass('cliente')}
                      disabled={true}
                    />
                    {renderError('cliente')}
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-gray-600">Teléfono</label>
                      <BlockedFieldHint title="Dato cargado desde la venta" />
                    </div>
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Teléfono del cliente"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 outline-none bg-gray-50"
                      disabled={true}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-gray-600">Atendió<span className="text-red-500">*</span></label>
                    <BlockedFieldHint title="Dato cargado desde la venta" />
                  </div>
                  <input
                    type="text"
                    value={asesor}
                    onChange={(e) => handleFieldChange('asesor', e.target.value)}
                    onBlur={() => handleBlur('asesor')}
                    placeholder="Nombre del asesor"
                    className={inputClass('asesor')}
                    disabled={true}
                  />
                  {renderError('asesor')}
                </div>
                
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-gray-600">Estado<span className="text-red-500">*</span></label>
                    <BlockedFieldHint title="Estado calculado automaticamente" />
                  </div>
                  <div className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm bg-yellow-50 text-yellow-700 font-semibold">
                    En Proceso
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Se calcula automáticamente
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Evidencias
                    {domicilio && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <button type="button" onClick={() => setEvidenceOpen(true)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm flex items-center justify-between ${
                      errors.evidencias && (touched.evidencias || submitted)
                        ? 'border-red-500'
                        : evidencias.length > 0
                          ? 'border-green-300 bg-green-50 hover:border-green-500'
                          : 'border-gray-300 border-dashed hover:border-[#004D77]'
                    }`}>
                    <span className={`text-xs ${evidencias.length > 0 ? 'font-semibold text-green-700' : 'text-gray-400'}`}>
                      {evidencias.length === 0 ? 'Adjuntar evidencias' : `${evidencias.length} evidencia(s) adjunta(s)`}
                    </span>
                    <Image className={`w-4 h-4 ${evidencias.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                  </button>
                  {renderError('evidencias')}
                  <p className={`mt-1 text-[10px] ${evidencias.length > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                    {evidencias.length > 0
                      ? 'Estas evidencias se enviarán al crear la devolución'
                      : domicilio
                        ? 'Obligatorio con domicilio'
                        : 'Opcional sin domicilio'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Domicilio</span>
                  <button type="button" onClick={() => {
                    const nextDelivery = !domicilio;
                    setDomicilio(nextDelivery);
                    setTouched(prev => ({
                      ...prev,
                      direccion: nextDelivery,
                      evidencias: nextDelivery,
                    }));
                    setErrors(prev => ({
                      ...prev,
                      direccion: nextDelivery && !direccion.trim()
                        ? 'La dirección es obligatoria'
                        : '',
                      evidencias: nextDelivery && evidencias.length === 0
                        ? 'Debe adjuntar al menos una evidencia'
                        : '',
                    }));
                  }}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${domicilio ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${domicilio ? 'left-[26px]' : 'left-0.5'}`} />
                    {domicilio && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white text-[9px] font-bold">✓</span>}
                  </button>
                </div>
                
                {domicilio && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Dirección<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => handleFieldChange('direccion', e.target.value.slice(0, ADDRESS_MAX_LENGTH))}
                      onBlur={() => handleBlur('direccion')}
                      maxLength={ADDRESS_MAX_LENGTH}
                      placeholder="Calle, número, barrio"
                      className={inputClass('direccion')}
                    />
                    <div className="mt-1 flex justify-between gap-2">
                      {renderError('direccion')}
                      <span className="ml-auto text-[10px] text-gray-400">{direccion.length}/{ADDRESS_MAX_LENGTH}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Descripción</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                    onBlur={() => handleBlur('descripcion')}
                    maxLength={GENERAL_DESCRIPTION_MAX_LENGTH}
                    placeholder="Agrega una descripción"
                    rows={3}
                    className={`${inputClass('descripcion')} resize-none`}
                  />
                  <div className="mt-1 flex justify-between gap-2">
                    {renderError('descripcion')}
                    <span className="ml-auto text-[10px] text-gray-400">{descripcion.length}/{GENERAL_DESCRIPTION_MAX_LENGTH}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* COL 2 - Selección de productos */}
          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5 lg:overflow-hidden">
            <p className="text-sm font-bold text-gray-800 mb-0.5">1. Productos</p>
            <p className="text-xs text-gray-400 mb-3">Selecciona los productos a devolver</p>
            
            {!isEdit && productosDisponibles.length === 0 && !noFactura && (
  <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 py-2 px-3">
    <p className="text-[12px] text-gray-400 text-center">Selecciona una factura</p>
  </div>
)}

            {!isEdit && cargandoProductos && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#004D77]/25 bg-[#004D77]/5 px-3 py-6 text-center">
                <Loader className="h-6 w-6 animate-spin text-[#004D77]" />
                <div>
                  <p className="text-sm font-semibold text-[#004D77]">Cargando productos</p>
                  <p className="text-[12px] text-gray-500">Estamos consultando los productos de la factura seleccionada</p>
                </div>
              </div>
            )}
            
            {!isEdit && productosDisponibles.length === 0 && noFactura && !cargandoProductos && (
  <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 py-2 px-3">
    <p className="text-[12px] text-gray-400 text-center">Sin productos disponibles</p>
  </div>
)}
            
            {!isEdit && productosDisponibles.length > 0 && Object.keys(seleccionados).length === 0 && (
  <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 py-2 px-3">
    <p className="text-[12px] text-gray-400 text-center">Haz clic en un producto</p>
  </div>
)}
            
            {!isEdit && !cargandoProductos && Object.keys(seleccionados).length > 0 && (
              <label className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-3 cursor-pointer">
                <input type="checkbox" checked={Object.keys(seleccionados).length === productosDisponibles.length}
                  onChange={toggleAll} className="accent-[#004D77] w-3.5 h-3.5" />
                Seleccionar todos
              </label>
            )}
            
            {errors.productos && (submitted) && !isEdit && (
              <p className="mb-2 text-xs text-red-600">{errors.productos}</p>
            )}
            
            <div className="max-h-[60vh] flex-1 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
              {!cargandoProductos && productosDisponibles.map((prod, index) => {
                const isSelected = Boolean(seleccionados[prod.id] && seleccionados[prod.id].length > 0);
                return (
                  <div key={`${prod.id}-${prod.idBarcode || prod.barcode || index}`}>
                    {!isSelected ? (
                      <div onClick={() => !isEdit && toggleProducto(prod)}
                        className={`flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2.5 ${!isEdit ? 'cursor-pointer hover:border-gray-300 hover:bg-gray-50' : 'cursor-default bg-gray-50 opacity-70'} transition`}>
                        <input type="checkbox" checked={false} readOnly className="accent-[#004D77] w-4 h-4 cursor-pointer flex-shrink-0" />
                        <ProductoImg src={prod.imagen} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{prod.nombre}</p>
                          <p className="text-[11px] text-gray-500">Cantidad: {prod.cantidad}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-gray-400">Total</p>
                          <p className="text-xs font-bold text-gray-700">${formatCOP(prod.cantidad * (prod.precioUnit || 0))}</p>
                        </div>
                        {isEdit && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            No se puede modificar en edición
                          </p>
                        )}
                      </div>
                    ) : isEdit ? (
                      <ProductoSeleccionadoEditMode
                        producto={prod}
                        configs={seleccionados[prod.id]}
                        onConfigChange={(nuevasConfigs) => updateConfigsEditMode(prod.id, nuevasConfigs)}
                      />
                    ) : (
                      <ProductoSeleccionadoCreateMode
                        producto={prod}
                        configs={seleccionados[prod.id]}
                        onConfigsChange={(nuevasConfigs) => updateConfigs(prod.id, nuevasConfigs)}
                        onRemove={() => toggleProducto(prod)}
                        submitted={submitted}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COL 3 - Resumen y cálculo */}
          <div className="flex w-full flex-shrink-0 flex-col p-4 sm:p-5 lg:w-[360px] lg:overflow-hidden">
            <p className="text-sm font-bold text-gray-800 mb-0.5">2. Productos devueltos</p>
            <p className="text-xs text-gray-400 mb-3">Cantidad a devolver</p>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {productosDevueltos.length === 0 ? (
                <p className="text-xs text-gray-300 italic text-center py-4">
                  {!noFactura ? 'Selecciona una factura' : 'Sin productos seleccionados'}
                </p>
              ) : (
                productosDevueltos.flatMap(({ producto, configs }) => 
                  configs.map((config, idx) => (
                    <div key={`${producto.id}-${idx}`} className="flex min-w-0 items-center justify-between overflow-hidden border border-gray-200 rounded-lg px-3 py-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        <ProductoImg src={producto.imagen} size="sm" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <span
                            className="block truncate text-xs font-semibold text-gray-800"
                            title={producto.nombre}
                          >
                            {producto.nombre}
                          </span>
                          <span className="block truncate text-[10px] text-gray-500">
                            {formatReasonLabel(config.motivo)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-2">
                        <span className="text-xs font-bold text-gray-800">{config.cantidad}</span>
                        <span className="text-[10px] text-gray-400">${formatCOP(config.cantidad * producto.precioUnit)}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
            
            <p className="text-sm font-bold text-gray-800 mb-0.5">3. Cálculo</p>
            <p className="text-xs text-gray-400 mb-2">Resumen de devolución</p>
            
            <div className="mb-2 min-h-0 flex-1 overflow-x-auto overflow-y-auto">
              {productosDevueltos.length === 0 ? (
                <p className="text-xs text-gray-300 italic text-center py-4">—</p>
              ) : (
                <table className="w-full min-w-[300px] table-fixed text-[10px]">
                  <colgroup>
                    <col className="w-[46%]" />
                    <col className="w-[10%]" />
                    <col className="w-[21%]" />
                    <col className="w-[23%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-1 pr-1 text-left font-semibold text-gray-500">Producto</th>
                      <th className="pb-1 text-center font-semibold text-gray-500">Cant.</th>
                      <th className="pb-1 text-right font-semibold text-gray-500">V. unit.</th>
                      <th className="pb-1 text-right font-semibold text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosDevueltos.flatMap(({ producto, configs }) => 
                      configs.map((config, idx) => (
                        <tr key={`${producto.id}-${idx}`} className="border-b border-gray-100">
                          <td className="py-1.5 pr-1 align-top font-medium text-gray-700">
                            <span
                              className="block overflow-hidden text-ellipsis whitespace-nowrap"
                              title={producto.nombre}
                            >
                              {producto.nombre}
                            </span>
                          </td>
                          <td className="py-1.5 text-center align-top text-gray-600">{config.cantidad}</td>
                          <td className="py-1.5 text-right align-top text-gray-600">{formatCOP(producto.precioUnit)}</td>
                          <td className="py-1.5 text-right align-top font-semibold text-gray-700">{formatCOP(config.cantidad * producto.precioUnit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-2 mt-2 flex-shrink-0">
              <div className="grid grid-cols-3 text-[10px] text-gray-500 font-semibold mb-1">
                <span>Número de<br/>Productos</span>
                <span className="text-center">Cantidad de<br/>Unidades</span>
                <span className="text-right">Total</span>
              </div>
              <div className="grid grid-cols-3 text-xs font-bold text-gray-800">
                <span>{productosDevueltos.length}</span>
                <span className="text-center">{totalUnidades}</span>
                <span className="text-right">${formatCOP(totalValor)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:rounded-b-lg sm:px-6 sm:py-4">
          <button type="button" onClick={handleSubmit}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#004D77] bg-[#004D77] px-7 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:border-[#003a5c] hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
            {saving && <Loader className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear devolución'}
          </button>
          <button type="button" onClick={handleClose}
            disabled={saving}
            className="w-full rounded-full border border-[#004D77] bg-white px-7 py-2.5 text-sm font-medium text-[#004D77] shadow-sm transition-colors hover:bg-sky-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
            Cancelar
          </button>
        </div>
      </div>

     <Evidence 
  isOpen={evidenceOpen} 
  onClose={() => setEvidenceOpen(false)}
  files={evidencias} 
  descripcion={evidenceDescription || descripcion}
  isEdit={isEdit}
  existingEvidences={isEdit ? evidencias.filter(ev => ev.id && !(ev instanceof File)) : []}
  returnId={returnData?.id}
  onSave={({ files, descripcion, deletedIds, existingFiles }) => {
    const nuevasEvidencias = [...(existingFiles || [])];
    
    if (files && files.length > 0) {
      nuevasEvidencias.push(...files);
    }
    
    setEvidencias(nuevasEvidencias);
    setTouched(prev => ({ ...prev, evidencias: true }));
    setErrors(prev => ({
      ...prev,
      evidencias: domicilio && nuevasEvidencias.length === 0
        ? 'Debe adjuntar al menos una evidencia'
        : '',
    }));
    
    if (descripcion) {
      setEvidenceDescription(descripcion);
    }
    if (deletedIds && deletedIds.length > 0) {
      setDeletedEvidenceIds(prev => [...prev, ...deletedIds]);
    }
  }} 
/>
    </div>
  );
}

export default FormReturn;
