import { useState } from 'react';
import {
  X, IdCard, User, Mail, Phone,
  MapPin, UserCheck, CreditCard,
  CalendarDays, BarChart2,
} from 'lucide-react';
import GraphClient from '../components/GraphClient';
import {
  formatPersonType,
  formatClientType,
  formatRut,
  formatCurrency,
} from '../helpers/clientHelpers';

// ─── Fila de detalle — estilo InfoUser ────────────────────────────────────────
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

// ─── InfoClient ───────────────────────────────────────────────────────────────
function InfoClient({ isOpen, onClose, client }) {
  const [showGraph, setShowGraph] = useState(false);

  if (!isOpen || !client) return null;

  const initials = (client.fullName || client.name || '')
    .trim().split(/\s+/).filter(Boolean)
    .slice(0, 2).map(w => w[0].toUpperCase()).join('');

  const statusColor = client.active
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-red-50 text-red-500 border-red-200';

  const clientTypeColor = {
    detal:      'bg-sky-50 text-sky-700 border-sky-200',
    mayorista:  'bg-violet-50 text-violet-700 border-violet-200',
    colegas:    'bg-amber-50 text-amber-700 border-amber-200',
    'por paca': 'bg-orange-50 text-orange-700 border-orange-200',
  }[(client.clientType || '').toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — ancho crece suavemente al mostrar gráfica */}
      <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden flex transition-all duration-500 ease-in-out ${
        showGraph ? 'w-[95vw] max-w-350' : 'w-full max-w-xl'
      }`}>

        {/* ── Panel de información ──────────────────────────────────────────── */}
        <div className="flex flex-col w-full min-w-360px shrink-0" style={{ width: showGraph ? '50%' : '100%', transition: 'width 500ms ease-in-out' }}>

          {/* Header */}
          <div className="relative bg-[#004D77] px-6 py-4 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-4 pr-8">
              <div className="w-14 h-14 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-lg font-bold text-white tracking-tight leading-none">
                  {initials}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-base leading-tight truncate">
                  {client.fullName || client.name || 'Sin nombre'}
                </h2>
                <p className="text-white/60 text-[11px] mt-0.5">
                  Cliente desde {client.clientSince || '—'}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                    {client.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${clientTypeColor}`}>
                    {formatClientType(client.clientType)}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                    {formatPersonType(client.personType)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de crédito / RUT / CIU */}
          <div className="mx-4 mt-3 shrink-0">
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#004D77]/10 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-[#004D77]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Crédito</p>
                  <p className="text-sm font-bold text-gray-800">
                    {client.clientCredit ? formatCurrency(parseInt(client.clientCredit)) : '$ 0'}
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">RUT</p>
                <p className="text-sm font-bold text-gray-800">{formatRut(client.rut)}</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cód. CIU</p>
                <p className="text-sm font-bold text-gray-800">{client.ciuCode || '—'}</p>
              </div>
            </div>
          </div>

          {/* Campos de detalle — sin scroll */}
          <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3.5 flex-1">

            {/* Separador */}
            <div className="col-span-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Identificación</span>
              <div className="flex-1 h-px bg-[#004D77]/15" />
            </div>

            {/* Tipo y Número unificados */}
            <DetailRow
              icon={IdCard}
              label="Tipo y Número Doc."
              value={`${client.documentType || '—'}  ${client.document || '—'}`}
              fullWidth
            />

            <div className="col-span-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
              <div className="flex-1 h-px bg-[#004D77]/15" />
            </div>

            <DetailRow icon={User}     label="Nombre completo" value={client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || '—'} fullWidth />
            <DetailRow icon={Mail}     label="Correo"     value={client.email}    fullWidth />
            <DetailRow icon={Phone}    label="Teléfono"   value={client.phone} />
            <DetailRow icon={MapPin}   label="Dirección"  value={client.address}  fullWidth />

            <div className="col-span-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Contacto y registro</span>
              <div className="flex-1 h-px bg-[#004D77]/15" />
            </div>

            <DetailRow icon={UserCheck}    label="Persona contacto"   value={client.contactName  || '—'} />
            <DetailRow icon={Phone}        label="Tel. contacto"      value={client.contactPhone || '—'} />
            <DetailRow icon={CalendarDays} label="Cliente desde"      value={client.clientSince  || '—'} />
            <DetailRow icon={IdCard}       label="ID Cliente"         value={`#${client.id}`} />

          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between shrink-0">
            <button
              onClick={() => setShowGraph(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#004D77] border border-[#004D77]/30 rounded-lg hover:bg-[#004D77]/10 hover:border-[#004D77] hover:cursor-pointer transition-all"
            >
              <BarChart2 className="w-3.5 h-3.5" strokeWidth={2} />
              {showGraph ? 'Ocultar gráfica' : 'Ver gráfica'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 hover:cursor-pointer rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* ── Panel de gráfica — siempre montado, animado con overflow+width ── */}
        <div
          className="overflow-hidden shrink-0 transition-all duration-500 ease-in-out border-l border-gray-100"
          style={{ width: showGraph ? '50%' : '0%', opacity: showGraph ? 1 : 0 }}
        >
          <div className="w-full h-full flex flex-col" style={{ minWidth: '360px' }}>
            <GraphClient clientStartDate={client.clientSince || '07/05/2023'} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default InfoClient;