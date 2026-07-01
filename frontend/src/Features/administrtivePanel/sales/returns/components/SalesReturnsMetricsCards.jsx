import { BadgeCheck, Clock3, RotateCcw, XCircle } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, iconClass, bgClass, children }) => (
  <div className="group relative bg-white rounded-xl shadow-md border border-gray-100 px-4 py-3 flex items-center justify-between min-h-[78px]">
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1 tabular-nums">{value}</p>
    </div>

    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${bgClass}`}>
      <Icon className={`w-5 h-5 ${iconClass}`} strokeWidth={2} />
    </div>

    {children}
  </div>
);

const HoverBreakdown = ({ title, items }) => (
  <div
    className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-[9999] min-w-[220px] max-w-[280px] rounded-xl shadow-2xl p-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150"
    style={{ background: '#1e293b' }}
  >
    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>
      {title}
    </p>
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 text-xs" style={{ color: '#f1f5f9' }}>
          <span>{item.label}</span>
          <span className="font-semibold tabular-nums shrink-0" style={{ color: '#93c5fd' }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const countByStatus = (returns, status) =>
  returns.filter((item) => String(item.status || item.estado || '').trim() === status).length;

function SalesReturnsMetricsCards({ returns = [] }) {
  const totalReturns = returns.length;
  const inProcessReturns = countByStatus(returns, 'En Proceso');
  const processedReturns = countByStatus(returns, 'Procesada');
  const annulledReturns = countByStatus(returns, 'Anulado');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <MetricCard
        title="Total devoluciones"
        value={totalReturns}
        icon={RotateCcw}
        bgClass="bg-[#004D77]/10"
        iconClass="text-[#004D77]"
      >
        <HoverBreakdown
          title="Devoluciones por estado"
          items={[
            { label: 'En proceso', value: inProcessReturns },
            { label: 'Procesadas', value: processedReturns },
            { label: 'Anuladas', value: annulledReturns },
          ]}
        />
      </MetricCard>

      <MetricCard
        title="En proceso"
        value={inProcessReturns}
        icon={Clock3}
        bgClass="bg-amber-100"
        iconClass="text-amber-600"
      />

      <MetricCard
        title="Procesadas"
        value={processedReturns}
        icon={BadgeCheck}
        bgClass="bg-emerald-100"
        iconClass="text-emerald-600"
      />

      <MetricCard
        title="Anuladas"
        value={annulledReturns}
        icon={XCircle}
        bgClass="bg-red-100"
        iconClass="text-red-600"
      />
    </div>
  );
}

export default SalesReturnsMetricsCards;
