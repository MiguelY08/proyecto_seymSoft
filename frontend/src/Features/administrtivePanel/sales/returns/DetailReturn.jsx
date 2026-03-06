import React, { useState } from 'react';
import { X } from 'lucide-react';
import ViewEvidence from './ViewEvidence';

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

  const productos = devolucion.productos ?? [
    { nombre: 'Lapiz #10', motivo: 'Prod. Mal estado', metodo: 'Reembolso', estado: 'Pendiente', cant: 3, valor: 3000, total: 9000 },
  ];

  const noProductos  = devolucion.noProductos  ?? productos.length;
  const canUnidades  = devolucion.canUnidades  ?? productos.reduce((a, p) => a + p.cant, 0);
  const totalGeneral = devolucion.totalGeneral ?? productos.reduce((a, p) => a + p.total, 0);
  const formatNum    = (v) => new Intl.NumberFormat('es-CO').format(v);

  const evidencias  = devolucion.evidencias  ?? [];
  const descripcion = devolucion.descripcion ?? 'Me llegaron alguno de los productos comprados mojados, otros rotos y defectuosos';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden" style={{ maxWidth: 760 }}>

          {/* ── Header ── */}
          <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
            <h2 className="text-white font-bold text-[15px] tracking-wide">
              Detalles de la devolución
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-7 py-5">

            {/* Título + número */}
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                Devolución
              </h1>
              <div className="border-2 border-[#004D77] rounded-lg px-5 py-2 text-center">
                <p className="text-xs font-black text-gray-800 uppercase tracking-wide">Numero de Devolución</p>
                <p className="text-sm font-semibold text-gray-600 mt-0.5">{devolucion.devolucion}</p>
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
                  VER EVIDENCIAS
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                <div>
                  <p className="font-black text-gray-900 text-xs">No.Venta:</p>
                  <p className="text-gray-700 text-xs mb-1">{devolucion.noFactura}</p>
                  <p className="font-black text-gray-900 text-xs">Cliente:</p>
                  <p className="text-gray-700 text-xs mb-1">{devolucion.cliente}</p>
                  <p className="font-black text-gray-900 text-xs">Atendió:</p>
                  <p className="text-gray-700 text-xs">{devolucion.asesor ?? 'Valentina Ocampo'}</p>
                </div>
                <div>
                  <p className="font-black text-gray-900 text-xs">Telefono</p>
                  <p className="text-gray-700 text-xs mb-1">{devolucion.telefono ?? '3143059988'}</p>
                  <p className="font-black text-gray-900 text-xs">Dirección:</p>
                  <p className="text-gray-700 text-xs mb-1">{devolucion.direccion ?? 'Cra 73 #21-30 (Belén San Bernardo - 1er piso)'}</p>
                  <p className="font-black text-gray-900 text-xs">Estado:</p>
                  <p className={`text-xs font-bold ${estadoColor}`}>{devolucion.estado}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-300 mb-4" />

            {/* Productos devueltos */}
            <div className="mb-4">
              <h3 className="text-sm font-black text-gray-900 mb-2">Productos devueltos</h3>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#004D77] text-white">
                      <th className="px-3 py-2.5 text-left font-semibold">Producto</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Motivo</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Metodo</th>
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
                      }[p.estado] ?? 'text-red-500';
                      return (
                        <tr key={i} className="border-t border-gray-200">
                          <td className="px-3 py-2 text-gray-700">{p.nombre}</td>
                          <td className="px-3 py-2 text-gray-600">{p.motivo}</td>
                          <td className="px-3 py-2 text-gray-600">{p.metodo}</td>
                          <td className={`px-3 py-2 font-semibold ${pColor}`}>{p.estado}</td>
                          <td className="px-3 py-2 text-center text-gray-700">{p.cant}</td>
                          <td className="px-3 py-2 text-center text-gray-700">{formatNum(p.valor)}</td>
                          <td className="px-3 py-2 text-center text-gray-700">{formatNum(p.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Descripción + totales */}
            <div>
              <p className="text-sm font-black text-gray-900 mb-2">Descripción:</p>
              <div className="flex gap-4 items-stretch">
                <div className="flex-1 border-2 border-[#004D77]/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-600 leading-relaxed">{descripcion}</p>
                </div>
                <div className="border-2 border-[#004D77]/40 rounded-lg overflow-hidden flex-shrink-0" style={{ minWidth: 180 }}>
                  <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                    <span className="text-xs font-black text-gray-800">No.Productos:</span>
                    <span className="text-xs text-gray-700 font-semibold">{noProductos}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                    <span className="text-xs font-black text-gray-800">Can. Unidades:</span>
                    <span className="text-xs text-gray-700 font-semibold">{canUnidades}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2">
                    <span className="text-xs font-black text-gray-800">Total:</span>
                    <span className="text-xs text-gray-700 font-semibold">{formatNum(totalGeneral)}</span>
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
