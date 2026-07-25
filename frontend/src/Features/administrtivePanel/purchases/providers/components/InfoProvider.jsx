import React from 'react';
import { X, User, Mail, Phone, MapPin, UserCheck, Package, FileText, Hash, Clock } from 'lucide-react';
import {
  formatPersonType,
  formatRut,
  getStatusText
} from '../utils/providerHelpers';

const formatCategories = (categorias) => {
  if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
    return '—';
  }
  return categorias.map(cat => cat.name).join(', ');
};

function DetailRow({ icon, label, value, fullWidth = false }) {
  let displayValue = value;
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    displayValue = JSON.stringify(value);
  }

  return (
    <div className={`flex min-w-0 items-start gap-3 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#004D77]/10 sm:h-10 sm:w-10">
        {React.createElement(icon, {
          className: 'h-5 w-5 text-[#004D77]/70',
          strokeWidth: 1.8
        })}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
        <span className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400">
          {label}
        </span>
        <span className="break-words text-sm font-semibold leading-snug text-slate-800 sm:text-[15px]">
          {displayValue || <span className="text-gray-300 italic">—</span>}
        </span>
      </div>
    </div>
  );
}

function InfoProvider({ isOpen, onClose, provider }) {
  if (!isOpen || !provider) return null;

  const initials = (provider.nombre || provider.nombres || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const statusColor = provider.activo
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-red-50 text-red-500 border-red-200';

  const categoriasTexto = formatCategories(provider.categorias);
  const identificacionCompleta = `${provider.tipo || 'N/A'} ${provider.numero || '—'}`;
  const providerName = provider.nombre || `${provider.nombres || ''} ${provider.apellidos || ''}`.trim() || 'Sin nombre';

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 hidden bg-black/40 backdrop-blur-sm sm:block" onClick={onClose} />

      <div className="relative flex h-dvh w-full min-h-0 flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl">
        <div className="relative shrink-0 bg-[#004D77] px-5 py-6 sm:px-7 sm:py-7">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition-all hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/20 shadow-lg sm:h-20 sm:w-20">
              <span className="text-2xl font-bold leading-none tracking-tight text-white sm:text-3xl">
                {initials || 'P'}
              </span>
            </div>

            <div className="min-w-0 max-w-full">
              <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                {providerName}
              </h2>
              <p className="mt-1 text-sm text-white/75">
                Identificación: {identificacionCompleta}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${statusColor}`}>
                  {getStatusText(provider.activo)}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[11px] font-bold text-white">
                  {formatPersonType(provider.tipoPersona)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-y-5 overflow-y-auto bg-white px-5 py-6 sm:px-7 md:grid-cols-2 md:gap-x-10 md:gap-y-6 md:px-8">
          <div className="md:col-span-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#004D77]">Datos personales</span>
            <div className="h-px flex-1 bg-[#004D77]/15" />
          </div>

          <DetailRow icon={User} label="Nombre completo" value={providerName} fullWidth />
          <DetailRow icon={Mail} label="Correo electrónico" value={provider.correo || '—'} />
          <DetailRow icon={Phone} label="Teléfono" value={provider.telefono || '—'} />
          <DetailRow icon={MapPin} label="Dirección" value={provider.direccion || '—'} fullWidth />

          <div className="md:col-span-2 flex items-center gap-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#004D77]">Contacto y registro</span>
            <div className="h-px flex-1 bg-[#004D77]/15" />
          </div>

          <DetailRow icon={UserCheck} label="Persona contacto" value={provider.pContacto || provider.nombreContacto || '—'} />
          <DetailRow icon={Phone} label="Tel. contacto" value={provider.nuContacto || provider.numeroContacto || '—'} />
          <DetailRow icon={Clock} label="Plazo devoluciones" value={provider.plazoDevoluciones ? `${provider.plazoDevoluciones} Día/s` : '—'} />
          <DetailRow icon={Package} label="Categorías" value={categoriasTexto} fullWidth />
          <DetailRow icon={FileText} label="RUT" value={formatRut(provider.rut)} />
          <DetailRow icon={Hash} label="Código CIU" value={provider.codigoCIU || '—'} />
        </div>

        <div className="flex shrink-0 items-center justify-end border-t border-gray-100 bg-white px-4 py-3 sm:px-6">
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-gray-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600 sm:w-auto sm:min-w-32"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoProvider;
