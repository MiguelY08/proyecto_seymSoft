import { createElement } from "react";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";

const MetricCard = ({ title, value, icon, iconClass, bgClass }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>

      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center ${bgClass}`}
      >
        {createElement(icon, {
          className: `w-5 h-5 ${iconClass}`,
          strokeWidth: 2,
        })}
      </div>
    </div>
  );
};

function RoleMetricsCards({ metrics }) {
  const totalRoles = metrics?.totalRoles ?? 0;
  const activeRoles = metrics?.activeRoles ?? 0;
  const inactiveRoles = metrics?.inactiveRoles ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <MetricCard
        title="Total de roles"
        value={totalRoles}
        icon={Shield}
        bgClass="bg-[#004D77]/10"
        iconClass="text-[#004D77]"
      />

      <MetricCard
        title="Roles activos"
        value={activeRoles}
        icon={ShieldCheck}
        bgClass="bg-green-100"
        iconClass="text-green-600"
      />

      <MetricCard
        title="Roles inactivos"
        value={inactiveRoles}
        icon={ShieldX}
        bgClass="bg-red-100"
        iconClass="text-red-600"
      />
    </div>
  );
}

export default RoleMetricsCards;
