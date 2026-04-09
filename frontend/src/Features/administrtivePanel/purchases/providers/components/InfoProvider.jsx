/**
 * Archivo: InfoProvider.jsx
 * 
 * Este archivo contiene un modal que muestra la información detallada completa
 * de un proveedor, con el mismo estilo que InfoClient.
 * 
 * Responsabilidades:
 * - Mostrar todos los datos de un proveedor en un modal
 * - Organizar la información en una cuadrícula de 2 columnas
 * - Formatear datos especiales (RUT, tipo persona, tipo cliente, estado)
 * - Proporcionar un botón para cerrar el modal
 * - Manejar la visibilidad del modal según la prop isOpen
 */

import React from 'react';
import { X, IdCard, User, Mail, Phone, MapPin, UserCheck, CalendarDays, Building2, Package, FileText, Hash, Clock } from 'lucide-react';
import { 
  formatPersonType, 
  formatRut, 
  getStatusBadgeClass,
  getStatusText
} from '../utils/providerHelpers';

// ─── Fila de detalle — estilo InfoUser/InfoClient ────────────────────────────────
function DetailRow({ icon: Icon, label, value, fullWidth = false }) {
  return (
    <div className={`flex items-start gap-3 ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-[#004D77]/8 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[#004D77]/60" strokeWidth={1.8} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-800 wrap-break-words leading-snug">
          {value || <span className="text-gray-300 italic">—</span>}
        </span>
      </div>
    </div>
  );
}

/**
 * Componente: InfoProvider
 * 
 * Modal que muestra todos los detalles de un proveedor de forma legible
 * en una cuadrícula de 2 columnas, con el mismo estilo que InfoClient.
 * 
 * Props:
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Object} provider - Objeto del proveedor con todos sus datos
 */
function InfoProvider({ isOpen, onClose, provider }) {
  // No renderiza nada si el modal no está abierto o no hay proveedor
  if (!isOpen || !provider) return null;

  // Obtener iniciales para el avatar
  const initials = (provider.nombre || provider.nombres || '')
    .trim().split(/\s+/).filter(Boolean)
    .slice(0, 2).map(w => w[0].toUpperCase()).join('');

  // Color del estado
  const statusColor = provider.activo
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-red-50 text-red-500 border-red-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — mismo tamaño que InfoClient */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">

        {/* Header - mismo estilo que InfoClient */}
        <div className="relative bg-[#004D77] px-6 py-4 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-4 pr-8">
            {/* Avatar con iniciales */}
            <div className="w-14 h-14 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-lg font-bold text-white tracking-tight leading-none">
                {initials || 'P'}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold text-base leading-tight truncate">
                {provider.nombre || `${provider.nombres || ''} ${provider.apellidos || ''}`.trim() || 'Sin nombre'}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                  {getStatusText(provider.activo)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  {formatPersonType(provider.tipoPersona)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Campos de detalle — grid de 2 columnas como InfoClient */}
        <div className="px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-4">

          {/* Separador Identificación */}
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Identificación</span>
            <div className="flex-1 h-px bg-[#004D77]/15" />
          </div>

          {/* Tipo y Número de Documento - igual que InfoClient */}
          <div className="col-span-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#004D77]/8 flex items-center justify-center shrink-0 mt-0.5">
                <IdCard className="w-4 h-4 text-[#004D77]/60" strokeWidth={1.8} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">
                  Tipo y Número Doc.
                </span>
                <span className="text-sm font-medium text-gray-800 wrap-break-words leading-snug">
                  {provider.tipo || '—'} {provider.numero || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Separador Datos personales */}
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
            <div className="flex-1 h-px bg-[#004D77]/15" />
          </div>

          {/* Nombre completo */}
          <div className="col-span-2">
            <DetailRow 
              icon={User} 
              label="Nombre completo" 
              value={provider.nombre || `${provider.nombres || ''} ${provider.apellidos || ''}`.trim() || '—'} 
              fullWidth 
            />
          </div>

          {/* Correo electrónico */}
          <div className="col-span-2">
            <DetailRow 
              icon={Mail} 
              label="Correo electrónico" 
              value={provider.correo || '—'} 
              fullWidth 
            />
          </div>

          {/* Teléfono */}
          <DetailRow 
            icon={Phone} 
            label="Teléfono" 
            value={provider.telefono || '—'} 
          />

          {/* Dirección */}
          <DetailRow 
            icon={MapPin} 
            label="Dirección" 
            value={provider.direccion || '—'} 
          />

          {/* Separador Contacto y registro */}
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Contacto y registro</span>
            <div className="flex-1 h-px bg-[#004D77]/15" />
          </div>

          {/* Persona contacto */}
          <DetailRow 
            icon={UserCheck} 
            label="Persona contacto" 
            value={provider.pContacto || provider.nombreContacto || '—'} 
          />

          {/* Teléfono contacto */}
          <DetailRow 
            icon={Phone} 
            label="Tel. contacto" 
            value={provider.nuContacto || provider.numeroContacto || '—'} 
          />

          {/* ← NUEVO: Plazo devoluciones - DEBAJO DEL TELÉFONO CONTACTO */}
          <DetailRow 
            icon={Clock} 
            label="Plazo devoluciones" 
            value={provider.plazoDevoluciones || '—'} 
          />

          {/* Categorías */}
          <DetailRow 
            icon={Package} 
            label="Categorías" 
            value={provider.categorias || '—'} 
          />

          {/* RUT */}
          <DetailRow 
            icon={FileText} 
            label="RUT" 
            value={formatRut(provider.rut)} 
          />

          {/* Código CIU */}
          <DetailRow 
            icon={Hash} 
            label="Código CIU" 
            value={provider.codigoCIU || '—'} 
          />

        </div>

        {/* Footer - botón cerrar */}
        <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

export default InfoProvider;