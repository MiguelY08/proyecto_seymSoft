import { createElement, useState, useEffect } from 'react';
import {
  X, IdCard, User, Mail, Phone,
  MapPin, UserCheck, CreditCard,
  CalendarDays, BarChart2, TrendingUp, Wallet, Trash2,
} from 'lucide-react';
import GraphClient from '../components/GraphClient';
import {
  formatPersonType,
  formatClientType,
  formatRut,
  formatCurrency,
} from '../helpers/clientHelpers';
import { clientsService } from '../services/clientsService';

const DETAIL_VALUE_PREVIEW_LIMIT = 42;

function DetailRow({ icon, label, value, fullWidth = false }) {
  const [expanded, setExpanded] = useState(false);
  const stringValue = String(value ?? '').trim();
  const hasValue = Boolean(stringValue && stringValue !== '-');
  const shouldCollapse = hasValue && stringValue.length > DETAIL_VALUE_PREVIEW_LIMIT;
  const visibleValue = shouldCollapse && !expanded
    ? `${stringValue.slice(0, DETAIL_VALUE_PREVIEW_LIMIT).trim()}...`
    : stringValue;

  return (
    <div className={`flex min-w-0 items-start gap-3 ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-[#004D77]/8 flex items-center justify-center shrink-0 mt-0.5">
        {createElement(icon, {
          className: 'w-4 h-4 text-[#004D77]/60',
          strokeWidth: 1.8
        })}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">
          {label}
        </span>
        <span
          className="max-w-full whitespace-pre-wrap break-words text-sm font-medium leading-snug text-gray-800 [overflow-wrap:anywhere] [word-break:break-word]"
          title={hasValue ? stringValue : undefined}
        >
          {hasValue ? visibleValue : <span className="text-gray-300 italic">-</span>}
        </span>
        {shouldCollapse && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="mt-0.5 w-fit text-[10px] font-semibold text-[#004D77] transition hover:underline"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>
    </div>
  );
}

// Componente Mini Gráfica con datos reales
function MiniGraphClient({ clientId, onExpand }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);
  const [purchasesCache, setPurchasesCache] = useState(null);

  useEffect(() => {
    if (clientId) {
      loadPurchases();
    }
  }, [clientId]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const { clientsService } = await import('../services/clientsService');
      const purchasesData = await clientsService.getClientPurchases(clientId);
      setPurchasesCache(purchasesData);
      
      if (purchasesData && purchasesData.byMonth) {
        const years = [...new Set(purchasesData.byMonth.map(item => item.year))];
        setAvailableYears(years.sort((a, b) => b - a));
        
        const defaultYear = years.length > 0 ? years[0] : new Date().getFullYear();
        setSelectedYear(defaultYear);
        
        const filtered = purchasesData.byMonth.filter(item => item.year === defaultYear);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const completeData = monthNames.map(month => {
          const existing = filtered.find(item => item.month === month);
          return {
            month,
            value: existing ? existing.total : 0,
            year: defaultYear
          };
        });
        
        setData(completeData);
        setTotalValue(purchasesData.total || 0);
      } else {
        setData([]);
        setTotalValue(0);
      }
    } catch {
      setData([]);
      setTotalValue(0);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (purchasesCache && purchasesCache.byMonth) {
      const filtered = purchasesCache.byMonth.filter(item => item.year === year);
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const completeData = monthNames.map(month => {
        const existing = filtered.find(item => item.month === month);
        return {
          month,
          value: existing ? existing.total : 0,
          year
        };
      });
      setData(completeData);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 h-32 flex items-center justify-center">
        <p className="text-xs text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={onExpand}>
        <div className="flex items-center justify-center h-16">
          <p className="text-xs text-gray-400">Sin compras registradas</p>
        </div>
        <p className="text-[9px] text-gray-400 text-center mt-2">
          Haz clic para ver detalles
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={onExpand}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Compras {selectedYear}</p>
          <p className="text-xs font-bold text-[#004D77]">
            ${(totalValue / 1000000).toFixed(0)}M
          </p>
        </div>
        <div className="flex items-center gap-2">
          {availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="cursor-pointer text-[9px] font-semibold px-2 py-0.5 border border-[#004D77]/30 rounded bg-white text-[#004D77] outline-none transition-colors hover:border-[#004D77] focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
              onClick={(e) => e.stopPropagation()}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
          <div className="text-gray-400">
            <BarChart2 className="w-3.5 h-3.5" strokeWidth={1.8} />
          </div>
        </div>
      </div>
      
      <div className="flex items-end gap-0.5 h-12">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 bg-[#004D77]/30 hover:bg-[#004D77] transition-all rounded-t cursor-pointer"
            style={{ height: `${(d.value / maxValue) * 40}px` }}
            title={`${d.month}: $${(d.value / 1000000).toFixed(1)}M`}
          />
        ))}
      </div>
      
      <div className="flex justify-between mt-1 px-0.5">
        {data.map((d, i) => (
          <span key={i} className="text-[6px] text-gray-400">{d.month}</span>
        ))}
      </div>
      
      <p className="text-[9px] text-gray-400 text-center mt-2">
        Haz clic para ver grafica completa
      </p>
    </div>
  );
}

function InfoClient({ isOpen, onClose, client }) {
  const [showGraph, setShowGraph] = useState(false);
  const [headerNameExpanded, setHeaderNameExpanded] = useState(false);
  
  // ✅ Estados para datos financieros (vienen del módulo de pagos)
  const [financialData, setFinancialData] = useState(null);
  const [creditBalanceEvents, setCreditBalanceEvents] = useState([]);
  const [dismissedCreditEvents, setDismissedCreditEvents] = useState([]);

  // Cargar datos financieros al abrir el modal
  useEffect(() => {
    if (!client || !isOpen) return undefined;

    let active = true;

    const loadClientDetails = async () => {
      const [financialResult, eventsResult] = await Promise.allSettled([
        clientsService.getClientFinancialSummary(client.id),
        clientsService.getCreditBalanceEvents({ clientId: client.id, limit: 20 }),
      ]);

      if (!active) return;

      setFinancialData(financialResult.status === 'fulfilled' ? financialResult.value : null);
      setCreditBalanceEvents(eventsResult.status === 'fulfilled' ? eventsResult.value : []);
      const dismissedKey = `client_dismissed_credit_events_${client.id}`;
      try {
        setDismissedCreditEvents(JSON.parse(localStorage.getItem(dismissedKey) || '[]'));
      } catch {
        setDismissedCreditEvents([]);
      }
    };

    void loadClientDetails();

    return () => {
      active = false;
    };
  }, [client, isOpen]);

  useEffect(() => {
    setHeaderNameExpanded(false);
  }, [client?.id, isOpen]);

  if (!isOpen || !client) return null;

  const isLegalPerson = client.personType === 'juridica';
  const displayName = isLegalPerson
    ? (client.firstName || client.fullName || 'Sin nombre')
    : (client.fullName || 'Sin nombre');
  const shouldCollapseHeaderName = displayName.length > DETAIL_VALUE_PREVIEW_LIMIT;
  const visibleHeaderName = shouldCollapseHeaderName && !headerNameExpanded
    ? `${displayName.slice(0, DETAIL_VALUE_PREVIEW_LIMIT).trim()}...`
    : displayName;
  const primarySectionTitle = isLegalPerson ? 'Datos empresariales' : 'Datos personales';
  const contactSectionTitle = isLegalPerson ? 'Encargado y registro' : 'Contacto y registro';
  const identificationLabel = isLegalPerson ? 'NIT' : 'Identificacion';

  const initials = displayName
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

  // ✅ Datos financieros (vienen del módulo de pagos)
  const creditoTotal = financialData?.assignedCredit ?? 0;
  const montoOcupado = financialData?.usedCredit ?? 0;
  const disponible = financialData?.availableCredit ?? 0;
  const creditosActivos = financialData?.activeCreditsCount ?? 0;
  
  // Saldo a favor: viene directamente del cliente.
  const saldoFavor = client.credit_balance ?? 0;
  const visibleCreditEvents = creditBalanceEvents.filter(
    (event) => !dismissedCreditEvents.includes(event.id)
  );

  const dismissCreditEvent = (eventId) => {
    const next = [...new Set([...dismissedCreditEvents, eventId])];
    setDismissedCreditEvents(next);
    localStorage.setItem(
      `client_dismissed_credit_events_${client.id}`,
      JSON.stringify(next)
    );
  };

  const clearCreditHistory = () => {
    const next = [
      ...new Set([
        ...dismissedCreditEvents,
        ...visibleCreditEvents.map((event) => event.id),
      ]),
    ];

    setDismissedCreditEvents(next);
    localStorage.setItem(
      `client_dismissed_credit_events_${client.id}`,
      JSON.stringify(next)
    );
  };
  
  const identificacionCompleta = `${client.documentType || 'N/A'} ${client.document || '-'}`;

  // ✅ Badge de estado financiero (viene de financialData)
  const getFinancialStatusBadge = () => {
    if (!financialData) return null;
    const status = financialData.status;
    if (status === 'VENCIDO') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-500 border-red-200">Moroso</span>;
    } else if (status === 'PENDIENTE') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-yellow-50 text-yellow-600 border-yellow-200">Con creditos</span>;
    } else {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200">Al dia</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 hidden bg-black/40 backdrop-blur-sm sm:block" onClick={onClose} />

      <div className={`relative flex h-dvh w-full min-h-0 overflow-hidden bg-white shadow-2xl transition-all duration-500 ease-in-out sm:h-auto sm:max-h-[92vh] sm:rounded-2xl ${
        showGraph ? 'sm:w-[95vw] sm:max-w-[90rem] lg:flex-row' : 'sm:max-w-xl'
      }`}>

        <div className={`flex min-h-0 min-w-0 flex-col shrink-0 transition-all duration-500 ease-in-out ${
          showGraph ? 'w-full lg:w-1/2' : 'w-full'
        }`}>

          {/* CABECERA */}
          <div className="relative bg-[#004D77] px-4 py-3.5 shrink-0 sm:px-6 sm:py-4">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-3 pr-8 sm:gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-lg sm:w-14 sm:h-14">
                <span className="text-lg font-bold text-white tracking-tight leading-none">
                  {initials}
                </span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h2
                  className="max-w-full whitespace-pre-wrap break-words text-base font-bold leading-tight text-white [overflow-wrap:anywhere] [word-break:break-word]"
                  title={displayName}
                >
                  {visibleHeaderName}
                </h2>
                {shouldCollapseHeaderName && (
                  <button
                    type="button"
                    onClick={() => setHeaderNameExpanded((current) => !current)}
                    className="mt-0.5 text-[10px] font-semibold text-white/90 transition hover:text-white hover:underline"
                  >
                    {headerNameExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
                <p className="text-white/70 text-[11px] mt-0.5">
                  {identificationLabel}: {identificacionCompleta}
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
                  {/* ✅ Badge de estado financiero */}
                  {getFinancialStatusBadge()}
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA DE CRÉDITO */}
          <div className="hidden">
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5 sm:px-4">
              
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#004D77]/10 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-[#004D77]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Credito</p>
                    <p className="text-sm font-bold text-gray-800">
                      {creditoTotal ? formatCurrency(creditoTotal) : '$ 0'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Credito disponible</p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(disponible)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Monto ocupado</p>
                    <p className="text-sm font-bold text-amber-600">
                      {montoOcupado > 0 ? formatCurrency(montoOcupado) : '$ 0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 my-2" />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500">RUT</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">RUT</p>
                    <p className="text-sm font-bold text-gray-800">{formatRut(client.rut)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500">CIU</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cod. CIU</p>
                    <p className="text-sm font-bold text-gray-800">{client.ciuCode || '-'}</p>
                  </div>
                </div>

                {/* ✅ SALDO A FAVOR: viene del cliente (credit_balance) */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5 text-green-600" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Saldo a favor</p>
                    <p className="text-sm font-bold text-green-600">
                      {saldoFavor > 0 ? formatCurrency(saldoFavor) : '$ 0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Creditos activos: <span className="text-gray-700">{creditosActivos}</span>
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="px-4 py-4 flex-1 min-h-0 overflow-y-auto sm:px-5">
            <div className="mb-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5 sm:px-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#004D77]/10 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-[#004D77]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Credito</p>
                      <p className="text-sm font-bold text-gray-800">
                        {creditoTotal ? formatCurrency(creditoTotal) : '$ 0'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Credito disponible</p>
                      <p className="text-sm font-bold text-blue-600">
                        {formatCurrency(disponible)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Monto ocupado</p>
                      <p className="text-sm font-bold text-amber-600">
                        {montoOcupado > 0 ? formatCurrency(montoOcupado) : '$ 0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-2" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-500">RUT</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">RUT</p>
                      <p className="text-sm font-bold text-gray-800">{formatRut(client.rut)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-500">CIU</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cod. CIU</p>
                      <p className="text-sm font-bold text-gray-800">{client.ciuCode || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5 text-green-600" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Saldo a favor</p>
                      <p className="text-sm font-bold text-green-600">
                        {saldoFavor > 0 ? formatCurrency(saldoFavor) : '$ 0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  Creditos activos: <span className="text-gray-700">{creditosActivos}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">{primarySectionTitle}</span>
              <div className="flex-1 h-px bg-[#004D77]/15" />
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <DetailRow icon={User} label={isLegalPerson ? 'Nombre empresa' : 'Nombre completo'} value={displayName || '-'} />
              <DetailRow icon={Mail} label={isLegalPerson ? 'Correo empresarial' : 'Correo'} value={client.email || '-'} />
              <DetailRow icon={Phone} label={isLegalPerson ? 'Telefono empresa' : 'Telefono'} value={client.phone || '-'} />
              <DetailRow icon={MapPin} label={isLegalPerson ? 'Direccion empresa' : 'Direccion'} value={client.address || '-'} />
            </div>

            <div className="mt-4">
              <MiniGraphClient 
                clientId={client.id}
                onExpand={() => setShowGraph(!showGraph)}
              />
            </div>

            {visibleCreditEvents.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">
                    Historial de saldo a favor
                  </span>
                  <div className="h-px flex-1 bg-green-200" />
                  <button
                    type="button"
                    onClick={clearCreditHistory}
                    title="Borrar historial visible"
                    className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500 transition-colors hover:border-red-200 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                    Borrar
                  </button>
                </div>
                <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                  {visibleCreditEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`rounded-xl border px-3 py-2 ${
                        event.type === 'REVERSAL'
                          ? 'border-red-200 bg-red-50'
                          : 'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-gray-800">
                          {event.type === 'REVERSAL' ? 'Saldo revertido' : 'Saldo aplicado'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${
                            event.type === 'REVERSAL' ? 'text-red-600' : 'text-green-700'
                          }`}>
                            {event.type === 'REVERSAL' ? '-' : '+'}{formatCurrency(event.amount || 0)}
                          </span>
                          <button
                            type="button"
                            onClick={() => dismissCreditEvent(event.id)}
                            aria-label="Ocultar movimiento de saldo a favor"
                            title="Ocultar mensaje"
                            className="rounded-full p-0.5 text-gray-400 transition hover:bg-white/70 hover:text-gray-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-600">
                        {event.returnNumber} · {event.productName} · {event.quantity} unidad(es)
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(event.createdAt).toLocaleString('es-CO')} · {event.processedBy || 'Sistema'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 mb-3">
              <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">{contactSectionTitle}</span>
              <div className="flex-1 h-px bg-[#004D77]/15" />
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <DetailRow icon={UserCheck} label={isLegalPerson ? 'Persona encargada' : 'Persona contacto'} value={client.contactName || '-'} />
              <DetailRow icon={Phone} label={isLegalPerson ? 'Numero persona encargada' : 'Tel. contacto'} value={client.contactPhone || '-'} />
              <DetailRow icon={CalendarDays} label="Cliente desde" value={client.clientSince || '-'} />
              <DetailRow icon={IdCard} label="ID Cliente" value={`#${client.id}`} />
            </div>


            {showGraph && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-white lg:hidden">
                <div className="h-[58dvh] min-h-[28rem] w-full">
                  <GraphClient clientId={client.id} clientStartDate={client.clientSince || '07/05/2023'} />
                </div>
              </div>
            )}
          </div>


          <div className="border-t border-gray-100 px-4 py-3 flex shrink-0 flex-col gap-2 sm:px-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setShowGraph(v => !v)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#004D77]/30 px-3 py-2 text-xs font-semibold text-[#004D77] transition-all hover:border-[#004D77] hover:bg-[#004D77]/10 hover:cursor-pointer sm:w-auto sm:py-1.5"
            >
              <BarChart2 className="w-3.5 h-3.5" strokeWidth={2} />
              {showGraph ? 'Ocultar grafica' : 'Ver grafica'}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-gray-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 hover:cursor-pointer sm:w-auto sm:py-2"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* PANEL DE GRÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂFICA GRANDE */}
        <div
          className={`hidden min-h-0 shrink-0 overflow-hidden transition-all duration-500 ease-in-out border-l border-gray-100 lg:block ${
            showGraph ? 'w-1/2 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <div className="w-full h-full flex flex-col" style={{ minWidth: '360px' }}>
            <GraphClient clientId={client.id} clientStartDate={client.clientSince || '07/05/2023'} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default InfoClient;
