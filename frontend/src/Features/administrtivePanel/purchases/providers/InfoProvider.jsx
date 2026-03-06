import React from 'react';
import { X } from 'lucide-react';

function InfoProvider({ isOpen, onClose, provider }) {
  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#004D77] text-white px-6 py-3 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold">Información del Proveedor</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content - Grid de 3 columnas */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">

            {/* Fila 1 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Tipo Persona
              </label>
              <p className="text-sm text-gray-900 font-medium">
                {provider.tipoPersona === 'natural' ? 'Natural' : provider.tipoPersona === 'juridica' ? 'Jurídica' : 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Tipo Doc.
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.tipo || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Número Documento
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.numero || 'N/A'}</p>
            </div>

            {/* Separador */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 2 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Nombres
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.nombres || provider.nombre || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Apellidos
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.apellidos || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Estado
              </label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                provider.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {provider.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Separador */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 3 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Teléfono
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.telefono || 'N/A'}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Correo Electrónico
              </label>
              <p className="text-sm text-gray-900 font-medium break-words">{provider.correo || 'N/A'}</p>
            </div>

            {/* Separador */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 4 */}
            <div className="col-span-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Dirección
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.direccion || 'N/A'}</p>
            </div>

            {/* Separador */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 5 - Contacto */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Contacto
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.pContacto || provider.nombreContacto || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Teléfono Contacto
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.nuContacto || provider.numeroContacto || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Tipo Cliente
              </label>
              <p className="text-sm text-gray-900 font-medium capitalize">{provider.tipoCliente || 'N/A'}</p>
            </div>

            {/* Separador */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 6 */}
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Categorías
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.categorias || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                RUT
              </label>
              <p className="text-sm text-gray-900 font-medium">
                {provider.rut === 'si' ? 'Sí' : provider.rut === 'no' ? 'No' : 'N/A'}
              </p>
            </div>

            {/* Separador */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 7 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Código CIU
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.codigoCIU || 'N/A'}</p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-2.5 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

export default InfoProvider;