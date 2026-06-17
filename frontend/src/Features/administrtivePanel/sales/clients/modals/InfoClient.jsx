import { useState, useEffect } from 'react';
import {
  X, IdCard, User, Mail, Phone,
  MapPin, UserCheck, CreditCard,
  CalendarDays, BarChart2, TrendingUp, Wallet,
} from 'lucide-react';
import GraphClient from '../components/GraphClient';
import {
  formatPersonType,
  formatClientType,
  formatRut,
  formatCurrency,
} from '../helpers/clientHelpers';

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
    } catch (error) {
      console.error('Error al cargar compras del cliente:', error);
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
              className="text-[9px] px-1 py-0.5 border border-gray-300 rounded bg-white"
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
        Haz clic para ver gráfica completa
      </p>
    </div>
  );
}

function InfoClient({ isOpen, onClose, client }) {
  const [showGraph, setShowGraph] = useState(false);

  if (!isOpen || !client) return null;

  const initials = (client.fullName || '')
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

  const creditoTotal = Number(client.assignedCredit ?? client.clientCredit ?? 0);
  const montoOcupado = Number(client.usedCredit ?? 0);
  const disponible = Number(client.availableCredit ?? Math.max(0, creditoTotal - montoOcupado));
  
  const deudaTotal = Number(client.totalDebt ?? montoOcupado);
  const creditosActivos = Number(client.activeCredits ?? 0);
  
  const identificacionCompleta = `${client.documentType || 'N/A'} ${client.document || '—'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden flex transition-all duration-500 ease-in-out ${
        showGraph ? 'w-[95vw] max-w-350' : 'w-full max-w-xl'
      }`}>

        <div className="flex flex-col w-full min-w-360px shrink-0" style={{ width: showGraph ? '50%' : '100%', transition: 'width 500ms ease-in-out' }}>

          {/* CABECERA */}
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
                  {client.fullName || 'Sin nombre'}
                </h2>
                <p className="text-white/70 text-[11px] mt-0.5">
                  Identificación: {identificacionCompleta}
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

          {/* TARJETA DE CRÉDITO */}
          <div className="mx-4 mt-3 shrink-0">
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-2.5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#004D77]/10 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-[#004D77]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Crédito</p>
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Crédito disponible</p>
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

              <div className="flex items-center justify-between">
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cód. CIU</p>
                    <p className="text-sm font-bold text-gray-800">{client.ciuCode || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5 text-green-600" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Deuda total</p>
                    <p className="text-sm font-bold text-green-600">
                      {deudaTotal > 0 ? formatCurrency(deudaTotal) : '$ 0'}
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
          <div className="px-5 py-4 flex-1">
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
              <div className="flex-1 h-px bg-[#004D77]/15" />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetailRow icon={User} label="Nombre completo" value={client.fullName || '—'} />
              <DetailRow icon={Mail} label="Correo" value={client.email || '—'} />
              <DetailRow icon={Phone} label="Teléfono" value={client.phone || '—'} />
              <DetailRow icon={MapPin} label="Dirección" value={client.address || '—'} />
            </div>

            <div className="mt-4">
              <MiniGraphClient 
                clientId={client.id}
                onExpand={() => setShowGraph(!showGraph)}
              />
            </div>

            <div className="flex items-center gap-2 mt-4 mb-3">
              <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Contacto y registro</span>
              <div className="flex-1 h-px bg-[#004D77]/15" />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetailRow icon={UserCheck} label="Persona contacto" value={client.contactName || '—'} />
              <DetailRow icon={Phone} label="Tel. contacto" value={client.contactPhone || '—'} />
              <DetailRow icon={CalendarDays} label="Cliente desde" value={client.clientSince || '—'} />
              <DetailRow icon={IdCard} label="ID Cliente" value={`#${client.id}`} />
            </div>
          </div>

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

        <div
          className="overflow-hidden shrink-0 transition-all duration-500 ease-in-out border-l border-gray-100"
          style={{ width: showGraph ? '50%' : '0%', opacity: showGraph ? 1 : 0 }}
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