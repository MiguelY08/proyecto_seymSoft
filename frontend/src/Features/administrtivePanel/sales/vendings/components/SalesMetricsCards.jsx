import { BadgeCheck, Clock3, RotateCcw, ShoppingCart } from "lucide-react";

const SALE_TYPES = {
  MANUAL: 1,
  DIRECT: 2,
  WEB: 3,
};

const SALE_STATUSES = {
  APPROVED: 1,
  PENDING_APPROVAL: 3,
  ANNULLED: 4,
};

const MetricCard = ({ title, value, icon: Icon, iconClass, bgClass, children }) => {
  return (
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
};

const HoverBreakdown = ({ items }) => (
  <div
    className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-[9999] min-w-[220px] max-w-[280px] rounded-xl shadow-2xl p-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150"
    style={{ background: "#1e293b" }}
  >
    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94a3b8" }}>
      Ventas por tipo
    </p>
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 text-xs" style={{ color: "#f1f5f9" }}>
          <span>{item.label}</span>
          <span className="font-semibold tabular-nums shrink-0" style={{ color: "#93c5fd" }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const getTypeTotal = (metrics, typeId) => {
  const found = metrics?.byType?.find((item) => Number(item.idSaleType) === typeId);

  return found?.total ?? 0;
};

const getStatusTotal = (metrics, statusId) => {
  const found = metrics?.byStatus?.find((item) => Number(item.idSaleStatus) === statusId);

  return found?.total ?? 0;
};

function SalesMetricsCards({ metrics }) {
  const totalSales = metrics?.totalSales ?? 0;
  const manualSales = getTypeTotal(metrics, SALE_TYPES.MANUAL);
  const directSales = getTypeTotal(metrics, SALE_TYPES.DIRECT);
  const webSales = getTypeTotal(metrics, SALE_TYPES.WEB);
  const approvedSales = getStatusTotal(metrics, SALE_STATUSES.APPROVED);
  const pendingApprovalSales = getStatusTotal(metrics, SALE_STATUSES.PENDING_APPROVAL);
  const annulledSales = getStatusTotal(metrics, SALE_STATUSES.ANNULLED);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <MetricCard
        title="Total de ventas"
        value={totalSales}
        icon={ShoppingCart}
        bgClass="bg-[#004D77]/10"
        iconClass="text-[#004D77]"
      >
        <HoverBreakdown
          items={[
            { label: "Web", value: webSales },
            { label: "Manual", value: manualSales },
            { label: "Directa", value: directSales },
          ]}
        />
      </MetricCard>

      <MetricCard
        title="Ventas aprobadas"
        value={approvedSales}
        icon={BadgeCheck}
        bgClass="bg-emerald-100"
        iconClass="text-emerald-600"
      />

      <MetricCard
        title="Ventas anuladas"
        value={annulledSales}
        icon={RotateCcw}
        bgClass="bg-red-100"
        iconClass="text-red-600"
      />

      <MetricCard
        title="Esp. aprobación"
        value={pendingApprovalSales}
        icon={Clock3}
        bgClass="bg-amber-100"
        iconClass="text-amber-600"
      />
    </div>
  );
}

export default SalesMetricsCards;
