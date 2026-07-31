import { BarChart3, CreditCard, ShieldCheck, WalletCards } from "lucide-react";

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
};

const SummaryCard = ({ icon, title, value, children, accent }) => (
  <div className="min-h-[122px] rounded-lg border border-gray-100 bg-white px-4 py-4 shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="mt-2 truncate text-2xl font-bold tabular-nums text-gray-800">
          {value}
        </p>
      </div>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent}`}
      >
        {icon}
      </div>
    </div>
    {children}
  </div>
);

export default function CreditSummaryCards({
  totalCredit,
  usedCredit,
  totalDebt,
  pendingCapital,
  pendingInterest,
  availableCredit,
  percentageUsed,
}) {
  const rawPercentage =
    percentageUsed !== undefined && percentageUsed !== null
      ? Number(percentageUsed)
      : totalCredit > 0
        ? Math.round((Number(usedCredit ?? 0) / Number(totalCredit)) * 100)
        : null;
  const percentage =
    rawPercentage !== null
      ? Math.min(100, Math.max(0, Math.round(rawPercentage)))
      : null;
  const resolvedPendingInterest = Number(pendingInterest ?? 0);
  const resolvedPendingCapital =
    pendingCapital !== undefined && pendingCapital !== null
      ? Number(pendingCapital)
      : Number(usedCredit ?? 0);
  const resolvedTotalDebt =
    totalDebt !== undefined && totalDebt !== null
      ? Number(totalDebt)
      : resolvedPendingCapital + resolvedPendingInterest;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={<CreditCard className="h-5 w-5 text-[#004D77]" />}
        title="Cupo total"
        value={formatCurrency(totalCredit)}
        accent="bg-[#004D77]/10 text-[#004D77]"
      />

      <SummaryCard
        icon={<BarChart3 className="h-5 w-5 text-[#004D77]" />}
        title="Cupo usado"
        value={formatCurrency(usedCredit)}
        accent="bg-[#FDE68A]/20 text-[#B45309]"
      >
        <div className="mt-4 space-y-3">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#004D77] transition-all duration-300"
              style={{ width: `${percentage ?? 0}%` }}
            />
          </div>
          <p className="text-xs font-medium text-gray-500">
            {percentage !== null ? `${percentage}% usado` : "Sin datos"}
          </p>
        </div>
      </SummaryCard>

      <SummaryCard
        icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
        title="Cupo disponible"
        value={formatCurrency(availableCredit)}
        accent="bg-emerald-100 text-emerald-700"
      />

      <SummaryCard
        icon={<WalletCards className="h-5 w-5 text-red-600" />}
        title="Deuda total"
        value={formatCurrency(resolvedTotalDebt)}
        accent="bg-red-100 text-red-700"
      >
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <div className="flex items-center justify-between gap-3">
            <span>Capital pendiente</span>
            <span className="font-semibold text-gray-700">
              {formatCurrency(resolvedPendingCapital)}
            </span>
          </div>
          {resolvedPendingInterest > 0 && (
            <div className="flex items-center justify-between gap-3">
              <span>Interés pendiente</span>
              <span className="font-semibold text-amber-600">
                {formatCurrency(resolvedPendingInterest)}
              </span>
            </div>
          )}
        </div>
      </SummaryCard>
    </div>
  );
}
