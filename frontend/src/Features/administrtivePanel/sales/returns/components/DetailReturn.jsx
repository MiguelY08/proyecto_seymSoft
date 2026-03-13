// components/DetailReturn.jsx
import React, { useState } from 'react';
import { X, Download, AlertTriangle } from 'lucide-react';
import ViewEvidence from './ViewEvidence';
import { formatCurrency, formatDate } from '../utils/returnsHelpers';
import { exportReturnToPDF } from '../utils/pdfExporter';

/**
 * Props:
 *   isOpen     {boolean}     - controla visibilidad
 *   onClose    {function}    - cierra el modal
 *   devolucion {object|null} - datos de la devolución a mostrar
 */
function DetailReturn({ isOpen, onClose, devolucion = null }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  if (!isOpen || !devolucion) return null;

  const estadoColor = {
    Pendiente: 'text-red-500',
    Aprobada:  'text-green-600',
    Anulada:   'text-gray-400',
  }[devolucion.estado] ?? 'text-red-500';

  // Obtener productos devueltos del objeto devolucion
  const productos = devolucion.productosDevueltos || [];

  // Calcular totales si no vienen en el objeto
  const noProductos = devolucion.cantidadProductos || productos.length;
  const canUnidades = devolucion.totalUnidades || productos.reduce((a, p) => a + (p.cantidad || 0), 0);
  const totalGeneral = devolucion.totalValor || productos.reduce((a, p) => a + ((p.cantidad || 1) * (p.precioUnit || 0)), 0);
  
  const formatNum = (v) => new Intl.NumberFormat('es-CO').format(v);

  const evidencias = devolucion.evidencias || [];
  const descripcion = devolucion.descripcion || 'Sin descripción adicional';

  // Función para exportar a PDF
  const handleExportPDF = () => {
    exportReturnToPDF(devolucion);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden" style={{ maxWidth: 760, maxHeight: '90vh' }}>

          {/* ── Header ── */}
          <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
            <h2 className="text-white font-bold text-[15px] tracking-wide">
              Detalles de la devolución
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                title="Exportar PDF"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body con scroll ── */}
          <div className="px-7 py-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>

            {/* Mensaje de anulación - SOLO si está anulada */}
            {devolucion.estado === 'Anulada' && devolucion.cancelReason && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-700 mb-1">Motivo de anulación:</p>
                    <p className="text-xs text-red-600">{devolucion.cancelReason}</p>
                    {devolucion.cancelledAt && (
                      <p className="text-[10px] text-red-400 mt-1">
                        Anulada el: {formatDate(devolucion.cancelledAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Título + número */}
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                Devolución
              </h1>
              <div className="border-2 border-[#004D77] rounded-lg px-5 py-2 text-center">
                <p className="text-xs font-black text-gray-800 uppercase tracking-wide">Número de Devolución</p>
                <p className="text-sm font-semibold text-gray-600 mt-0.5">{devolucion.numeroDevolucion || 'N/A'}</p>
              </div>
            </div>

            <hr className="border-gray-300 mb-4" />

            {/* Datos */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-black text-gray-900">Datos</h3>
                <button
                  type="button"
                  onClick={() => setEvidenceOpen(true)}
                  className="text-[#004D77] text-xs font-bold hover:underline cursor-pointer tracking-wide"
                >
                  VER EVIDENCIAS {evidencias.length > 0 && `(${evidencias.length})`}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                <div>
                  <p className="font-black text-gray-900 text-xs">No. Factura:</p>
                  <p className="text-gray-700 text-xs mb-1">{devolucion.numeroFactura || 'N/A'}</p>
                  
                  <p className="font-black text-gray-900 text-xs">Cliente:</p>
                  <p className="text-gray-700 text-xs mb-1">{devolucion.cliente || 'N/A'}</p>
                  
                  <p className="font-black text-gray-900 text-xs">Atendió:</p>
                  <p className="text-gray-700 text-xs">{devolucion.asesor || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-black text-gray-900 text-xs">Teléfono:</p>
                  <p className="text-gray-700 text-xs mb-1">{devolucion.telefono || 'N/A'}</p>
                  
                  <p className="font-black text-gray-900 text-xs">Dirección:</p>
                  <p className="text-gray-700 text-xs mb-1">{devolucion.direccion || 'N/A'}</p>
                  
                  <p className="font-black text-gray-900 text-xs">Estado:</p>
                  <p className={`text-xs font-bold ${estadoColor}`}>{devolucion.estado || 'Pendiente'}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-300 mb-4" />

            {/* Productos devueltos */}
            {productos.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-black text-gray-900 mb-2">Productos devueltos</h3>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#004D77] text-white">
                        <th className="px-3 py-2.5 text-left font-semibold">Producto</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Motivo</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Método</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Estado</th>
                        <th className="px-3 py-2.5 text-center font-semibold">Cant.</th>
                        <th className="px-3 py-2.5 text-center font-semibold">Valor</th>
                        <th className="px-3 py-2.5 text-center font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((p, i) => {
                        const pColor = {
                          Pendiente: 'text-red-500',
                          Aprobada:  'text-green-600',
                          Anulada:   'text-gray-400',
                        }[p.estado || 'Pendiente'] ?? 'text-red-500';
                        
                        const cantidad = p.cantidad || 1;
                        const precioUnit = p.precioUnit || p.valor || 0;
                        const total = cantidad * precioUnit;
                        
                        return (
                          <tr key={i} className="border-t border-gray-200">
                            <td className="px-3 py-2 text-gray-700">{p.nombre}</td>
                            <td className="px-3 py-2 text-gray-600">{p.motivo || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{p.metodo || '-'}</td>
                            <td className={`px-3 py-2 font-semibold ${pColor}`}>{p.estado || 'Pendiente'}</td>
                            <td className="px-3 py-2 text-center text-gray-700">{cantidad}</td>
                            <td className="px-3 py-2 text-center text-gray-700">${formatNum(precioUnit)}</td>
                            <td className="px-3 py-2 text-center text-gray-700">${formatNum(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Descripción + totales */}
            <div>
              <p className="text-sm font-black text-gray-900 mb-2">Descripción:</p>
              <div className="flex gap-4 items-stretch">
                <div className="flex-1 border-2 border-[#004D77]/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-600 leading-relaxed">{descripcion}</p>
                </div>
                <div className="border-2 border-[#004D77]/40 rounded-lg overflow-hidden flex-shrink-0" style={{ minWidth: 180 }}>
                  <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                    <span className="text-xs font-black text-gray-800">No. Productos:</span>
                    <span className="text-xs text-gray-700 font-semibold">{noProductos}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                    <span className="text-xs font-black text-gray-800">Can. Unidades:</span>
                    <span className="text-xs text-gray-700 font-semibold">{canUnidades}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2">
                    <span className="text-xs font-black text-gray-800">Total:</span>
                    <span className="text-xs text-gray-700 font-semibold">${formatNum(totalGeneral)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── ViewEvidence modal ── */}
      <ViewEvidence
        isOpen={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        files={evidencias}
        descripcion={descripcion}
      />
    </>
  );
}

export default DetailReturn;