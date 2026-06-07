import { BadgeCheck, Globe, MonitorSmartphone, ShoppingCart, Store } from "lucide-react";

const MetricCard = ({ title, value, icon: Icon, iconClass, bgClass }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>

      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${bgClass}`}>
        <Icon className={`w-5 h-5 ${iconClass}`} strokeWidth={2} />
      </div>
    </div>
  );
};

const getTypeTotal = (metrics, typeName) => {
  const found = metrics?.byType?.find(
    (item) => item.saleTypeName?.toLowerCase() === typeName.toLowerCase()
  );

  return found?.total ?? 0;
};

const getStatusTotal = (metrics, statusName) => {
  const found = metrics?.byStatus?.find(
    (item) => item.nameStatus?.toLowerCase() === statusName.toLowerCase()
  );

  return found?.total ?? 0;
};

function SalesMetricsCards({ metrics }) {
  const totalSales = metrics?.totalSales ?? 0;
  const directSales = getTypeTotal(metrics, "DIRECTA");
  const webSales = getTypeTotal(metrics, "WEB");
  const manualSales = getTypeTotal(metrics, "MANUAL");
  const approvedSales = getStatusTotal(metrics, "Aprobada");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      <MetricCard
        title="Total de ventas"
        value={totalSales}
        icon={ShoppingCart}
        bgClass="bg-[#004D77]/10"
        iconClass="text-[#004D77]"
      />

      <MetricCard
        title="Ventas directas"
        value={directSales}
        icon={Store}
        bgClass="bg-green-100"
        iconClass="text-green-600"
      />

      <MetricCard
        title="Ventas web"
        value={webSales}
        icon={Globe}
        bgClass="bg-blue-100"
        iconClass="text-blue-600"
      />

      <MetricCard
        title="Ventas manuales"
        value={manualSales}
        icon={MonitorSmartphone}
        bgClass="bg-amber-100"
        iconClass="text-amber-600"
      />

      <MetricCard
        title="Ventas aprobadas"
        value={approvedSales}
        icon={BadgeCheck}
        bgClass="bg-emerald-100"
        iconClass="text-emerald-600"
      />
    </div>
  );
}

export default SalesMetricsCards;
