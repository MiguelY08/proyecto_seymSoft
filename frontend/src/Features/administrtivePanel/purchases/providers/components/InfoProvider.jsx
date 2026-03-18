/**
 * Archivo: InfoProvider.jsx
 * 
 * Este archivo contiene un modal que muestra la información detallada completa
 * de un proveedor.
 * 
 * Responsabilidades:
 * - Mostrar todos los datos de un proveedor en un modal
 * - Organizar la información en una cuadrícula de 3 columnas
 * - Formatear datos especiales (RUT, tipo persona, tipo cliente, estado)
 * - Proporcionar un botón para cerrar el modal
 * - Manejar la visibilidad del modal según la prop isOpen
 */

import React from 'react';
import { X } from 'lucide-react';
import { 
  formatPersonType, 
  formatRut, 
  formatClientType,
  getStatusBadgeClass,
  getStatusText
} from '../utils/providerHelpers';

/**
 * Componente: InfoProvider
 * 
 * Modal que muestra todos los detalles de un proveedor de forma legible
 * en una cuadrícula de 3 columnas.
 * 
 * Props:
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Object} provider - Objeto del proveedor con todos sus datos
 */
function InfoProvider({ isOpen, onClose, provider }) {
  // No renderiza nada si el modal no está abierto o no hay proveedor
  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: área oscura detrás del modal para cerrar al hacer clic */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal principal con información del proveedor */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Encabezado: título y botón de cerrar */}
        <div className="bg-[#004D77] text-white px-6 py-3 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold">Información del Proveedor</h2>
          {/* Botón X para cerrar el modal */}
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Contenido principal: cuadrícula de datos en 3 columnas */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">

            {/* Fila 1: Tipo de Persona, Tipo de Documento, Número de Documento */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Tipo Persona
              </label>
              <p className="text-sm text-gray-900 font-medium">
                {formatPersonType(provider.tipoPersona)}
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

            {/* Separador visual */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 2: Nombres, Apellidos, Estado */}
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(provider.activo)}`}>
                {getStatusText(provider.activo)}
              </span>
            </div>

            {/* Separador visual */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 3: Teléfono, Correo Electrónico */}
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

            {/* Separador visual */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 4: Dirección */}
            <div className="col-span-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Dirección
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.direccion || 'N/A'}</p>
            </div>

            {/* Separador visual */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 5: Información de Contacto */}
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
              <p className="text-sm text-gray-900 font-medium capitalize">{formatClientType(provider.tipoCliente)}</p>
            </div>

            {/* Separador visual */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 6: Categorías, RUT */}
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
              <p className="text-sm text-gray-900 font-medium">{formatRut(provider.rut)}</p>
            </div>

            {/* Separador visual */}
            <div className="col-span-3 border-t border-gray-200 my-1"></div>

            {/* Fila 7: Código CIU */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                Código CIU
              </label>
              <p className="text-sm text-gray-900 font-medium">{provider.codigoCIU || 'N/A'}</p>
            </div>

          </div>
        </div>

        {/* Pie del modal: botón para cerrar */}
        {/* Pie del modal: botón para cerrar */}
        <div className="border-t border-gray-200 px-6 py-2.5 flex items-center justify-end shrink-0">
          {/* Botón: Cerrar modal */}
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

{/* Exporta el componente InfoProvider como componente por defecto */}
export default InfoProvider;