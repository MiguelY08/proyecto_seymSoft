/**
 * Archivo: DetailReturn.jsx
 * Modal para visualizar los detalles completos de una devolución.
 */
import React, { useState } from 'react';
import { X, Download, AlertTriangle, Image } from 'lucide-react';
import ViewEvidence from './ViewEvidence';
import { formatDate } from '../utils/returnsHelpers';
import { exportReturnToPDF } from '../utils/pdfExporter';

function DetailReturn({ isOpen, onClose, devolucion = null }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  if (!isOpen || !devolucion) return null;

  // ✅ USAR MODELO ÚNICO
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
    exportReturnToPDF(devolucion);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,77,119,0.3)] w-full overflow-hidden" style={{ maxWidth: 920, maxHeight: '92vh' }}>

          <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
            <h2 className="text-white font-bold text-[15px] tracking-wide">Detalles de la devolución</h2>
            <div className="flex items-center gap-2">
              <button onClick={handleExportPDF} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer hover:scale-105" title="Exportar PDF">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer hover:scale-105">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 80px)' }}>

            {status === 'Anulado' && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-xs font-bold text-red-700 mb-1">DEVOLUCIÓN ANULADA</p>
                    {cancellationReason && (
                      <p className="text-xs text-red-600">
                        <span className="font-semibold">Motivo:</span> {cancellationReason}
                      </p>
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

            <div className="flex items-start justify-between mb-4">
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
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#004D77]/10 text-[#004D77] hover:bg-[#004D77]/20 transition cursor-pointer"
                  >
                    <Image className="w-3.5 h-3.5" />
                    VER EVIDENCIAS ({evidenciasMapeadas.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-1.5">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No. Factura</p>
                  <p className="text-sm font-medium text-gray-800 mb-2">{invoiceNumber}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cliente</p>
                  <p className="text-sm font-medium text-gray-800 mb-2">{clientName}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Atendió</p>
                  <p className="text-sm font-medium text-gray-800">{mostrarAsesor}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teléfono</p>
                  <p className="text-sm font-medium text-gray-800 mb-2">{mostrarTelefono}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dirección</p>
                  <p className="text-sm font-medium text-gray-800 mb-2">{mostrarDireccion}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</p>
                  <p className={`text-sm font-bold ${estadoColor}`}>{status}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            {details.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Productos devueltos</h3>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full text-xs">
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
                        const motivo = p.reason || '-';
                        const metodo = p.method || '-';
                        const mostrarDescripcionOtro = (
                          p.reasonId === 4 ||
                          motivo.toLowerCase().includes('otro')
                        ) && p.description;
                        const isAnulado = estadoProducto === 'Anulado';
                        
                        return (
                          <tr key={i} className={`border-t border-gray-100 ${isAnulado ? 'bg-red-50/40' : 'hover:bg-gray-50'}`}>
                            <td className="px-3 py-2.5 text-gray-700 font-medium">
                              {p.productName || 'N/A'}
                              {mostrarDescripcionOtro && (
                                <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] font-medium text-amber-800">
                                  <span className="mr-1">Motivo específico:</span>
                                  <span>{p.description}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">{motivo}</td>
                            <td className="px-3 py-2.5 text-gray-600">{metodo}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${isAnulado ? 'text-red-600 bg-red-100' : getStatusColor(estadoProducto)}`}>
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
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="flex-1 border-2 border-[#004D77]/30 rounded-xl px-4 py-3 bg-gray-50/50">
                  <p className="text-xs text-gray-600 leading-relaxed">{mostrarDescripcion}</p>
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
        </div>
      </div>

      <ViewEvidence
        isOpen={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        evidences={evidenciasMapeadas}
        title={`Evidencias - ${returnNumber}`}
      />
    </>
  );
}

export default DetailReturn;
