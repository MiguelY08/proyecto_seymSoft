import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
};

const parseDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDaysUntil = (date) => {
  if (!date) return null;
  const today = new Date();
  const dueDate = new Date(date);
  const diffMs =
    dueDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export default function CreditStatusCard({
  nextDueDate,
  daysUntilDue,
  hasActiveCredit,
  hasOverdueDebt,
  overdueDays,
  overdueAmount,
  percentageCreditUsed,
  totalCredit,
}) {
  const creditDate = parseDateValue(nextDueDate);
  const resolvedDaysUntilDue =
    daysUntilDue !== undefined && daysUntilDue !== null
      ? Number(daysUntilDue)
      : creditDate
        ? getDaysUntil(creditDate)
        : null;
  const hasOverdue =
    hasOverdueDebt !== undefined && hasOverdueDebt !== null
      ? Boolean(hasOverdueDebt)
      : Number(overdueDays ?? 0) > 0 || Number(overdueAmount ?? 0) > 0;
  const isNearDue =
    !hasOverdue &&
    resolvedDaysUntilDue !== null &&
    resolvedDaysUntilDue >= 0 &&
    resolvedDaysUntilDue <= 5;
  const isActiveCredit =
    hasActiveCredit !== undefined && hasActiveCredit !== null
      ? Boolean(hasActiveCredit)
      : Number(totalCredit ?? 0) > 0 || creditDate !== null;

  const status = hasOverdue
    ? {
        tone: "red",
        title: "Crédito en mora",
        detail: `${Number(overdueDays ?? 0)} días pendientes`,
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      }
    : isNearDue
      ? {
          tone: "amber",
          title: "Próximo vencimiento",
          detail: `Faltan ${resolvedDaysUntilDue ?? "-"} días`,
          icon: <CalendarDays className="h-5 w-5 text-amber-600" />,
        }
      : isActiveCredit
        ? {
            tone: "emerald",
            title: "Crédito al día",
            detail: "Sin cuotas vencidas",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
          }
        : {
            tone: "slate",
            title: "Sin créditos activos",
            detail: "Sin cupo activo",
            icon: <CircleDashed className="h-5 w-5 text-slate-500" />,
          };

  const toneClasses = {
    red: "border-red-100 bg-red-50",
    amber: "border-amber-100 bg-amber-50",
    emerald: "border-emerald-100 bg-emerald-50",
    slate: "border-gray-100 bg-gray-50",
  };

  const iconToneClasses = {
    red: "bg-red-100",
    amber: "bg-amber-100",
    emerald: "bg-emerald-100",
    slate: "bg-white",
  };

  return (
    <div
      className={`rounded-lg border p-5 shadow-md ${toneClasses[status.tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconToneClasses[status.tone]}`}
          >
            {status.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {status.title}
            </p>
            <p className="text-xs font-medium text-gray-500">
              {status.detail}
            </p>
          </div>
        </div>

        {percentageCreditUsed !== undefined &&
          percentageCreditUsed !== null && (
            <span className="rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
              {Number(percentageCreditUsed)}% usado
            </span>
          )}
      </div>

      <div className="mt-5 rounded-lg bg-white/80 p-4">
        {hasOverdue ? (
          <div>
            <p className="text-xs font-medium text-gray-500">Valor vencido</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-red-700">
              {formatCurrency(overdueAmount)}
            </p>
          </div>
        ) : isNearDue ? (
          <div>
            <p className="text-xs font-medium text-gray-500">
              Fecha de vencimiento
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              {creditDate
                ? creditDate.toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Sin fecha"}
            </p>
          </div>
        ) : isActiveCredit ? (
          <div>
            <p className="text-sm font-semibold text-gray-800">
              No existen cuotas vencidas.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Tu crédito está al día.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-gray-800">
              No hay información de crédito disponible.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Tu perfil no registra cupos o vencimientos activos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
