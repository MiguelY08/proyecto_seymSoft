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
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#004D77] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold">Información del proveedor</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 max-w-6xl mx-auto">

            {/* Tipo de persona */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Tipo de persona
              </label>
              <p className="text-sm text-gray-800 font-medium">
                {provider.tipoPersona === 'natural' 
                  ? 'Persona Natural' 
                  : provider.tipoPersona === 'juridica' 
                    ? 'Persona Jurídica' 
                    : 'No especificado'}
              </p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200"></div>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Tipo
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.tipo || 'N/A'}</p>
            </div>

            {/* Número de documento */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Número de documento
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.numero || 'N/A'}</p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200"></div>

            {/* Nombres */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Nombres
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.nombres || provider.nombre || 'N/A'}</p>
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Apellidos
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.apellidos || 'N/A'}</p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200"></div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Teléfono - Celular
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.telefono || 'N/A'}</p>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Correo electrónico
              </label>
              <p className="text-sm text-gray-800 font-medium break-words">{provider.correo || 'N/A'}</p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200"></div>

            {/* Nombre persona de contacto */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Nombre persona de contacto
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.pContacto || provider.nombreContacto || 'N/A'}</p>
            </div>

            {/* Número persona de contacto */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Número persona de contacto
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.nuContacto || provider.numeroContacto || 'N/A'}</p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200"></div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Dirección
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.direccion || 'N/A'}</p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200"></div>

            {/* Tipo de cliente */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Tipo de cliente
              </label>
              <p className="text-sm text-gray-800 font-medium capitalize">
                {provider.tipoCliente || 'N/A'}
              </p>
            </div>

            {/* Categorías */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Categorías
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.categorias || 'N/A'}</p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200"></div>

            {/* RUT */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                RUT
              </label>
              <p className="text-sm text-gray-800 font-medium">
                {provider.rut === 'si' ? 'Sí' : provider.rut === 'no' ? 'No' : 'N/A'}
              </p>
            </div>

            {/* Código CIU */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Código CIU
              </label>
              <p className="text-sm text-gray-800 font-medium">{provider.codigoCIU || 'N/A'}</p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200"></div>

            {/* Estado */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Estado
              </label>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  provider.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {provider.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

export default InfoProvider;
