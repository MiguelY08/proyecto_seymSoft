/**
 * Archivo: DetailReturn.jsx
 * Modal para visualizar los detalles completos de una devolución.
 */
import React, { useEffect, useState } from 'react';
import {
  X,
  FileDown,
  AlertTriangle,
  Image,
  PackageSearch,
  Loader2,
  ReceiptText,
  UserRound,
  UserCheck,
  Phone,
  MapPin,
  BadgeCheck,
} from 'lucide-react';
import ViewEvidence from './ViewEvidence';
import PurchaseReturnModal from './PurchaseReturnModal';
import { formatDate } from '../utils/returnsHelpers';
import { exportReturnToPDF } from '../utils/pdfExporter';
import {
  getPurchaseReturnInfo,
  resolveDefectiveProduct,
} from '../data/returnsService';
import { useAlert } from '../../../../shared/alerts/useAlert';

const isDefectiveDetail = (detail = {}) => {
  const reason = String(detail.reason || detail.motivo || '').toUpperCase();
  return Number(detail.reasonId || detail.idReturnReason) === 5
    || reason === 'DEFECTUOSO'
    || reason.includes('PRODUCTO DEFECTUOSO');
};

const formatReasonLabel = (reason) => {
  if (!reason) return 'Sin motivo';
  const labels = {
    DEFECTUOSO: 'Producto defectuoso',
    PRODUCTO_EQUIVOCADO: 'Producto equivocado',
    PRODUCTO_INCOMPLETO: 'Producto incompleto',
    MAL_ESTADO: 'Producto en mal estado',
    PRODUCTO_USADO: 'Producto usado',
    OTRO: 'Otro motivo',
  };
  const label = labels[reason] || String(reason).replace(/[_-]+/g, ' ');
  const normalized = label.trim().toLocaleLowerCase('es-CO');
  return normalized.charAt(0).toLocaleUpperCase('es-CO') + normalized.slice(1);
};

const buildNonConformingReason = (detail = {}, info = {}, returnNumber = '') => {
  const productReason = formatReasonLabel(detail.reason || detail.motivo || 'Producto defectuoso');
  const source = returnNumber
    ? `devolución de venta N.° ${returnNumber}`
    : 'devolución de venta';
  const detailReason = info.reason || 'No fue posible generar una devolución de compra.';
  return `${productReason} detectado en ${source}. ${detailReason}`;
};

const actionButtonClass = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-400 rounded-full hover:bg-gray-200 transition-colors cursor-pointer';
const evidenceButtonClass = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#004D77]/10 text-[#004D77] hover:bg-[#004D77]/20 transition cursor-pointer';

const DetailDataRow = ({ icon, label, value, valueClassName = 'text-gray-800' }) => {
  const hasValue = value !== undefined && value !== null && String(value).trim().length > 0;

  return (
    <div className="flex min-w-0 items-start gap-2.5 py-1.5">
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${hasValue ? 'bg-[#004D77]/10' : 'bg-gray-100'}`}>
        {React.createElement(icon, {
          className: `h-4 w-4 ${hasValue ? 'text-[#004D77]' : 'text-gray-300'}`,
          strokeWidth: 1.8,
        })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className={`text-sm font-medium leading-snug break-words [overflow-wrap:anywhere] ${hasValue ? valueClassName : 'italic text-gray-300'}`}>
          {hasValue ? value : 'No registrado'}
        </p>
      </div>
    </div>
  );
};

const CollapsibleText = ({
  text: rawText,
  limit = 180,
  className = '',
  buttonClassName = 'text-[#004D77]',
}) => {
  const [expanded, setExpanded] = useState(false);
  const value = String(rawText ?? '').trim();
  const shouldCollapse = value.length > limit;
  const visibleText = shouldCollapse && !expanded
    ? `${value.slice(0, limit).trim()}...`
    : value;

  if (!value) return null;

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <p className={`max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] ${className}`}>
        {visibleText}
      </p>
      {shouldCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={`mt-1 text-xs font-semibold transition hover:underline ${buttonClassName}`}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
};

function DetailReturn({ isOpen, onClose, devolucion = null }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [purchaseInfoByDetail, setPurchaseInfoByDetail] = useState({});
  const [selectedDefectiveProduct, setSelectedDefectiveProduct] = useState(null);
  const [resolvingDetailId, setResolvingDetailId] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const { showConfirm, showError, showSuccess } = useAlert();

  useEffect(() => {
    if (!isOpen || !devolucion?.id) {
      const timer = window.setTimeout(() => setPurchaseInfoByDetail({}), 0);
      return () => window.clearTimeout(timer);
    }

    const eligibleDetails = (devolucion.details || []).filter((detail) => (
      isDefectiveDetail(detail) && detail.status === 'Listo' && detail.idBarcode
    ));
    if (!eligibleDetails.length) {
      const timer = window.setTimeout(() => setPurchaseInfoByDetail({}), 0);
      return () => window.clearTimeout(timer);
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setPurchaseInfoByDetail(
        Object.fromEntries(eligibleDetails.map((detail) => [
          detail.idSaleReturnDetail || detail.id,
          { loading: true },
        ]))
      );

      Promise.all(eligibleDetails.map(async (detail) => {
        const detailId = detail.idSaleReturnDetail || detail.id;
        try {
          const info = await getPurchaseReturnInfo(
            detail.idBarcode,
            devolucion.id,
            detailId
          );
          return [detailId, { loading: false, data: info }];
        } catch (error) {
          return [detailId, { loading: false, error: error.message }];
        }
      })).then((entries) => {
        if (active) setPurchaseInfoByDetail(Object.fromEntries(entries));
      });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [devolucion, isOpen]);

  if (!isOpen || !devolucion) return null;

  // Usar modelo único
  const {
    returnNumber,
    invoiceNumber,
    clientName,
    employeeName,
    clientPhone,
    status,
    description,
    hasDelivery,
    deliveryAddress,
    clientAddress,
    evidences = [],
    details = [],
    cancellationReason,
    cancelledAt,
    totalAmount
  } = devolucion;

  const estadoColor = {
    'En Proceso': 'text-yellow-600',
    'Procesada': 'text-green-600',
    'Anulado': 'text-red-600',
  }[status] ?? 'text-gray-600';

  const noProductos = details.length;
  const totalUnidades = details.reduce((a, p) => a + (p.quantity || 0), 0);
  const totalGeneral = totalAmount || 0;

  const formatNum = (v) => new Intl.NumberFormat('es-CO').format(v);

  const mostrarDireccion = hasDelivery 
    ? (deliveryAddress || 'No se especificó dirección de entrega')
    : (clientAddress || 'La devolución se generó en el local');

  const mostrarTelefono = clientPhone || 'No registrado';
  const mostrarAsesor = employeeName || 'No registrado';
  const mostrarDescripcion = description || 'Sin descripción adicional';

  const getStatusColor = (estado) => {
    const colors = {
      'Pend. Envío': 'text-orange-500',
      'Pend. Reemplazo': 'text-yellow-600',
      'Pend. Reembolso': 'text-yellow-600',
      'Entregado': 'text-green-600',
      'Listo': 'text-green-600',
      'Aprobada': 'text-green-600',
      'En Proceso': 'text-yellow-600',
      'Procesada': 'text-green-600',
      'Anulado': 'text-red-600',
    };
    return colors[estado] || 'text-gray-500';
  };

  const evidenciasMapeadas = Array.isArray(evidences) ? evidences.map(ev => ({
    ...ev,
    imageUrl: ev.imageUrl || ev.image_path || '',
    image_description: ev.image_description || ''
  })) : [];

  const handleExportPDF = () => {
    if (exportingPdf) return;

    setExportingPdf(true);
    window.setTimeout(async () => {
      try {
        await exportReturnToPDF(devolucion);
      } finally {
        setExportingPdf(false);
      }
    }, 0);
  };

  const refreshPurchaseInfo = async (detail) => {
    const detailId = detail.idSaleReturnDetail || detail.id;
    setPurchaseInfoByDetail((current) => ({
      ...current,
      [detailId]: { loading: true },
    }));
    const info = await getPurchaseReturnInfo(
      detail.idBarcode,
      devolucion.id,
      detailId
    );
    setPurchaseInfoByDetail((current) => ({
      ...current,
      [detailId]: { loading: false, data: info },
    }));
  };

  const handleNonConforming = async (detail, info) => {
    const detailId = detail.idSaleReturnDetail || detail.id;
    const confirmation = await showConfirm(
      'warning',
      'Enviar a producto no conforme',
      `${detail.productName || 'Este producto'} no tiene una compra vigente con cantidad disponible. Si confirmas, será registrado como producto no conforme. Motivo: ${info.reason || 'No es posible generar la devolución de compra.'}`,
      {
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar',
      }
    );
    if (!confirmation?.isConfirmed) return;

    try {
      setResolvingDetailId(detailId);
      await resolveDefectiveProduct(devolucion.id, detailId, {
        action: 'NON_CONFORMING',
        reportReason: buildNonConformingReason(detail, info, devolucion.returnNumber),
      });
      showSuccess(
        'Producto no conforme registrado',
        'El producto quedó enviado a producto no conforme.'
      );
      await refreshPurchaseInfo(detail);
    } catch (error) {
      showError('No se pudo registrar', error.message);
    } finally {
      setResolvingDetailId(null);
    }
  };

  const renderDefectiveAction = (detail) => {
    const detailId = detail.idSaleReturnDetail || detail.id;
    const state = purchaseInfoByDetail[detailId];

    if (!isDefectiveDetail(detail) || detail.status !== 'Listo') return null;
    if (!detail.idBarcode) {
      return (
        <p className="mt-1 text-[10px] font-medium text-red-600">
          Sin código de barras para determinar la compra.
        </p>
      );
    }
    if (!state || state.loading) {
      return (
        <p className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Verificando compra...
        </p>
      );
    }
    if (state.error) {
      return (
        <button
          type="button"
          onClick={() => refreshPurchaseInfo(detail).catch((error) => {
            showError('No se pudo verificar', error.message);
          })}
          className="mt-2 inline-flex min-w-0 max-w-full items-center overflow-hidden rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100"
        >
          Reintentar verificación
        </button>
      );
    }

    const info = state.data;
    if (info?.resolution?.type === 'PURCHASE_RETURN') {
      return (
        <p className="mt-1 text-[10px] font-semibold text-green-700">
          Devolución de compra #{info.resolution.referenceId || 'generada'}
        </p>
      );
    }
    if (info?.resolution?.type === 'NON_CONFORMING') {
      return (
        <p className="mt-1 text-[10px] font-semibold text-amber-700">
          Enviado a producto no conforme
        </p>
      );
    }
    if (info?.canReturn) {
      return (
        <button
          type="button"
          disabled={Boolean(resolvingDetailId)}
          onClick={() => setSelectedDefectiveProduct({
            ...detail,
            saleReturnId: devolucion.id,
            saleReturnDetailId: detailId,
            purchaseInfo: info,
          })}
          className="mt-1.5 inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-md bg-[#004D77] px-2 py-1 text-[10px] font-semibold leading-none text-white transition hover:bg-[#003d61] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PackageSearch className="h-2.5 w-2.5" />
          Generar devolución de compra
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={resolvingDetailId === detailId}
        onClick={() => handleNonConforming(detail, info)}
        className="mt-1.5 inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-md bg-amber-100 px-2 py-1 text-[10px] font-semibold leading-none text-amber-800 transition hover:bg-amber-200 disabled:opacity-60"
      >
        {resolvingDetailId === detailId
          ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
          : <AlertTriangle className="h-2.5 w-2.5" />}
        {resolvingDetailId === detailId ? 'Registrando...' : 'Enviar a no conforme'}
      </button>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-sm sm:p-4">
        <div className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-[0_20px_60px_-10px_rgba(0,77,119,0.3)] sm:h-auto sm:max-h-[92vh] sm:max-w-[920px] sm:rounded-2xl">

          <div className="relative flex flex-shrink-0 items-center justify-between overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-6 py-3.5">
            <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 right-16 h-28 w-28 rounded-full bg-sky-300/10" />
            <div className="relative flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <ReceiptText className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <h2 className="min-w-0 truncate text-[15px] font-bold tracking-wide text-white">Detalles de la devolución</h2>
            </div>
            <div className="relative flex items-center gap-2">
              <button onClick={onClose} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/15 text-white transition hover:scale-105 hover:bg-white/25">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">

            {status === 'Anulado' && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-xs font-bold text-red-700 mb-1">DEVOLUCIÓN ANULADA</p>
                    {cancellationReason && (
                      <div className="min-w-0 max-w-full text-xs text-red-600">
                        <span className="font-semibold">Motivo:</span>
                        <CollapsibleText
                          text={cancellationReason}
                          limit={160}
                          className="mt-0.5 text-xs text-red-600"
                          buttonClassName="text-red-700"
                        />
                      </div>
                    )}
                    {cancelledAt && (
                      <p className="text-[10px] text-red-400 mt-1">
                        Anulada el: {formatDate(cancelledAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>Devolución</h1>
              <div className="border-2 border-[#004D77] rounded-xl px-5 py-2 text-center bg-[#004D77]/5">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Número de Devolución</p>
                <p className="text-sm font-bold text-[#004D77] mt-0.5">{returnNumber}</p>
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">Datos</h3>
                {evidenciasMapeadas.length > 0 && (
                  <button
                    onClick={() => setEvidenceOpen(true)}
                    className={evidenceButtonClass}
                  >
                    <Image className="w-3.5 h-3.5" />
                    VER EVIDENCIAS ({evidenciasMapeadas.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <DetailDataRow icon={ReceiptText} label="No. Factura" value={invoiceNumber} />
                  <DetailDataRow icon={UserRound} label="Cliente" value={clientName} />
                  <DetailDataRow icon={UserCheck} label="Atendió" value={mostrarAsesor} />
                </div>
                <div className="space-y-1">
                  <DetailDataRow icon={Phone} label="Teléfono" value={mostrarTelefono} />
                  <DetailDataRow icon={MapPin} label="Dirección" value={mostrarDireccion} />
                  <DetailDataRow icon={BadgeCheck} label="Estado" value={status} valueClassName={`font-bold ${estadoColor}`} />
                </div>
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            {details.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Productos devueltos</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full min-w-[720px] table-fixed text-xs">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[23%]" />
                      <col className="w-[15%]" />
                      <col className="w-[14%]" />
                      <col className="w-[8%]" />
                      <col className="w-[12%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-[#004D77] text-white">
                        <th className="px-3 py-2.5 text-left font-semibold">Producto</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Motivo</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Método</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Estado</th>
                        <th className="px-3 py-2.5 text-center font-semibold">Cant.</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((p, i) => {
                        const cantidad = p.quantity || 1;
                        const precioUnit = p.unitPrice || 0;
                        const total = cantidad * precioUnit;
                        const estadoProducto = p.status || 'Pendiente';
                        const motivo = formatReasonLabel(p.reason || p.motivo || '-');
                        const metodo = p.method || '-';
                        const mostrarDescripcionOtro = (
                          p.reasonId === 4 ||
                          motivo.toLowerCase().includes('otro')
                        ) && p.description;
                        const isAnulado = estadoProducto === 'Anulado';
                        
                        return (
                          <tr key={i} className={`border-t border-gray-100 ${isAnulado ? 'bg-red-50/40' : 'hover:bg-gray-50'}`}>
                            <td className="px-3 py-2.5 text-gray-700 font-medium">
                              <span className="block break-words [overflow-wrap:anywhere]">{p.productName || 'N/A'}</span>
                              {mostrarDescripcionOtro && (
                                <div className="mt-1.5 max-w-full rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] font-medium text-amber-800">
                                  <span className="mr-1">Motivo específico:</span>
                                  <CollapsibleText
                                    text={p.description}
                                    limit={130}
                                    className="text-[11px] leading-relaxed text-amber-800"
                                    buttonClassName="text-amber-700"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">
                              <div className="flex min-w-0 flex-col items-start gap-1.5">
                                <span>{motivo}</span>
                                {renderDefectiveAction(p)}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 break-words [overflow-wrap:anywhere]">{metodo}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex min-w-[84px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${isAnulado ? 'text-red-600 bg-red-100' : getStatusColor(estadoProducto)}`}>
                                {estadoProducto}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center text-gray-700 font-medium">{cantidad}</td>
                            <td className="px-3 py-2.5 text-right text-gray-700 font-medium">
                              {precioUnit > 0 ? `$${formatNum(Math.round(total))}` : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-bold text-gray-800 mb-2">Descripción</p>
              <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row">
                <div className="min-w-0 flex-1 overflow-hidden rounded-xl border-2 border-[#004D77]/30 bg-gray-50/50 px-4 py-3">
                  <CollapsibleText
                    text={mostrarDescripcion}
                    limit={260}
                    className="text-xs leading-relaxed text-gray-600"
                  />
                </div>
                <div className="border-2 border-[#004D77]/30 rounded-xl overflow-hidden flex-shrink-0 sm:min-w-[180px] bg-gray-50/50">
                  <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Productos</span>
                    <span className="text-sm font-bold text-gray-800">{noProductos}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unidades</span>
                    <span className="text-sm font-bold text-gray-800">{totalUnidades}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2">
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wider">Total</span>
                    <span className="text-sm font-bold text-[#004D77]">${formatNum(totalGeneral)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={exportingPdf}
              className={`${actionButtonClass} w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
            >
              {exportingPdf
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <FileDown className="w-4 h-4" strokeWidth={1.8} />}
              {exportingPdf ? 'Generando...' : 'Exportar PDF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-[#004D77] bg-white px-6 py-2 text-sm font-medium text-[#004D77] shadow-sm transition-colors hover:bg-sky-100 hover:shadow-md sm:w-auto"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <ViewEvidence
        isOpen={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        evidences={evidenciasMapeadas}
        title={`Evidencias - ${returnNumber}`}
      />

      <PurchaseReturnModal
        isOpen={Boolean(selectedDefectiveProduct)}
        productData={selectedDefectiveProduct}
        onClose={() => setSelectedDefectiveProduct(null)}
        onSuccess={async () => {
          if (selectedDefectiveProduct) {
            await refreshPurchaseInfo(selectedDefectiveProduct);
          }
        }}
      />
    </>
  );
}

export default DetailReturn;
