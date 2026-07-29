import { RefreshCw, X } from "lucide-react";
import ProfileHeader from "./ProfileHeader.jsx";
import CreditSummaryCards from "./CreditSummaryCards.jsx";
import CreditStatusCard from "./CreditStatusCard.jsx";
import FavorBalanceCard from "./FavorBalanceCard.jsx";
import useProfileSummary from "../../hooks/useProfileSummary.js";

const getProfileValue = (data, keys, fallback = null) => {
  for (const key of keys) {
    if (data?.[key] !== undefined && data?.[key] !== null) {
      return data[key];
    }
  }
  return fallback;
};

export default function ProfileSummaryModal({ isOpen, onClose }) {
  const { profileSummary, loading, error, refreshProfileSummary } =
    useProfileSummary();

  if (!isOpen) return null;

  const profile = profileSummary || {};
  const userProfile = profile.user || profile;
  const financialSummary = profile.financialSummary || profile;
  const creditStatus = profile.creditStatus || profile;

  const avatarUrl = getProfileValue(userProfile, [
    "avatarUrl",
    "avatar_url",
    "photo",
    "profilePicture",
    "profile_picture",
  ]);
  const fullName = getProfileValue(
    userProfile,
    ["fullName", "full_name", "name", "username"],
    "Usuario SeymSoft",
  );
  const email = getProfileValue(
    userProfile,
    ["email", "emailAddress", "email_address"],
    "Sin correo registrado",
  );
  const role = getProfileValue(
    userProfile,
    ["roleName", "role", "rol", "nameRole", "name_role"],
    "Cliente",
  );
  const status = getProfileValue(
    userProfile,
    ["status", "state", "userStatus", "statusUsuario"],
    "Activo",
  );

  const totalCredit = Number(
    getProfileValue(
      financialSummary,
      ["totalCredit", "assignedCredit", "creditLimit", "clientCredit"],
      0,
    ),
  );
  const usedCredit = Number(
    getProfileValue(
      financialSummary,
      ["usedCredit", "used_credit", "creditUsed"],
      0,
    ),
  );
  const pendingInterest = Number(
    getProfileValue(
      financialSummary,
      ["pendingInterest", "pending_interest", "interesPendiente"],
      0,
    ),
  );
  const pendingCapital = Number(
    getProfileValue(
      financialSummary,
      ["pendingCapital", "pending_capital", "capitalPendiente"],
      usedCredit,
    ),
  );
  const totalDebt = Number(
    getProfileValue(
      financialSummary,
      ["totalDebt", "total_debt", "deudaTotal", "saldoPendiente"],
      pendingCapital + pendingInterest,
    ),
  );
  const availableCredit = Number(
    getProfileValue(
      financialSummary,
      [
        "availableCredit",
        "available_credit",
        "creditAvailable",
        "availableCreditLimit",
      ],
      0,
    ),
  );
  const nextDueDate = getProfileValue(
    creditStatus,
    [
      "nextDueDate",
      "next_due_date",
      "fechaVencimiento",
      "fecha_vencimiento",
      "dueDate",
    ],
    null,
  );
  const overdueDays = Number(
    getProfileValue(
      creditStatus,
      [
        "overdueDays",
        "overdue_days",
        "daysLate",
        "daysOverdue",
        "diasMora",
        "moraDays",
      ],
      0,
    ),
  );
  const overdueAmount = Number(
    getProfileValue(
      creditStatus,
      [
        "overdueAmount",
        "overdue_amount",
        "amountOverdue",
        "valorVencido",
        "deudaVencida",
      ],
      0,
    ),
  );
  const saldoFavor = Number(
    getProfileValue(
      financialSummary,
      [
        "balance",
        "credit_balance",
        "saldoFavor",
        "saldo_a_favor",
        "favorBalance",
      ],
      0,
    ),
  );
  const percentageCreditUsed = getProfileValue(
    financialSummary,
    [
      "percentageCreditUsed",
      "percentage_used",
      "percentUsed",
      "usedPercentage",
    ],
    null,
  );
  const hasActiveCredit = getProfileValue(
    creditStatus,
    ["hasActiveCredit", "has_active_credit"],
    null,
  );
  const hasOverdueDebt = getProfileValue(
    creditStatus,
    ["hasOverdueDebt", "has_overdue_debt"],
    null,
  );
  const daysUntilDue = getProfileValue(
    creditStatus,
    ["daysUntilDue", "days_until_due"],
    null,
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-8">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-4 bg-[#004D77] px-5 py-4 sm:px-6">
          <div>
            <p className="text-base font-semibold text-white">
              Resumen financiero
            </p>
            <p className="text-xs text-white/75">
              Perfil, cupo y estado de crédito
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/20"
            aria-label="Cerrar perfil"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative p-4 sm:p-6">
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
              <p className="font-semibold">No fue posible cargar tu perfil.</p>
              <p className="mt-2">Verifica tu conexión e intenta de nuevo.</p>
              <button
                type="button"
                onClick={refreshProfileSummary}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#004D77] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#003d5e]"
              >
                <RefreshCw size={16} />
                Reintentar
              </button>
            </div>
          )}

          {loading && !error && !profileSummary && (
            <div className="rounded-lg border border-gray-100 bg-white p-5 text-sm text-gray-600 shadow-sm">
              <p className="font-semibold text-gray-800">
                Cargando datos financieros
              </p>
              <p className="mt-2">
                Estamos consultando tu cupo y estado de crédito.
              </p>
            </div>
          )}

          {!loading && !error && !profileSummary && (
            <div className="rounded-lg border border-gray-100 bg-white p-5 text-sm text-gray-600 shadow-sm">
              <p className="font-semibold text-gray-800">
                No hay información disponible
              </p>
              <p className="mt-2">
                Tu perfil no retornó datos válidos. Intenta recargar el modal.
              </p>
              <button
                type="button"
                onClick={refreshProfileSummary}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#e2edf5] bg-white px-4 py-2 text-sm font-semibold text-[#004D77] transition hover:bg-[#f8fafc]"
              >
                <RefreshCw size={16} />
                Recargar
              </button>
            </div>
          )}

          {!loading && !error && profileSummary && (
            <div className="space-y-4">
              <ProfileHeader
                fullName={fullName}
                email={email}
                role={role}
                status={status}
                avatarUrl={avatarUrl}
              />

              <CreditSummaryCards
                totalCredit={totalCredit}
                usedCredit={usedCredit}
                totalDebt={totalDebt}
                pendingCapital={pendingCapital}
                pendingInterest={pendingInterest}
                availableCredit={availableCredit}
                percentageUsed={percentageCreditUsed}
              />

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
                <CreditStatusCard
                  nextDueDate={nextDueDate}
                  overdueDays={overdueDays}
                  overdueAmount={overdueAmount}
                  percentageCreditUsed={percentageCreditUsed}
                  totalCredit={totalCredit}
                  hasActiveCredit={hasActiveCredit}
                  hasOverdueDebt={hasOverdueDebt}
                  daysUntilDue={daysUntilDue}
                />
                <FavorBalanceCard balance={saldoFavor} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
