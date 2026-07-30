import { Users, UserCheck, UserX } from "lucide-react";

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

function UserMetricsCards({ metrics }) {
  const totalUsers = metrics?.totalUsers ?? 0;
  const activeUsers = metrics?.activeUsers ?? 0;
  const inactiveUsers = metrics?.inactiveUsers ?? 0;

  return (
    <div className="hidden lg:grid lg:grid-cols-3 gap-3">
      <MetricCard
        title="Total de usuarios"
        value={totalUsers}
        icon={Users}
        bgClass="bg-[#004D77]/10"
        iconClass="text-[#004D77]"
      />

      <MetricCard
        title="Usuarios activos"
        value={activeUsers}
        icon={UserCheck}
        bgClass="bg-green-100"
        iconClass="text-green-600"
      />

      <MetricCard
        title="Usuarios inactivos"
        value={inactiveUsers}
        icon={UserX}
        bgClass="bg-red-100"
        iconClass="text-red-600"
      />
    </div>
  );
}

export default UserMetricsCards;
