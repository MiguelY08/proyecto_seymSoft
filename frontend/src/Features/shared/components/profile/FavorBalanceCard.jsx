import { WalletCards } from "lucide-react";

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function FavorBalanceCard({ balance }) {
  const hasBalance = Number(balance ?? 0) > 0;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">Saldo a favor</p>
          <p className="mt-2 truncate text-2xl font-bold tabular-nums text-gray-800">
            {hasBalance ? formatCurrency(balance) : formatCurrency(0)}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#004D77]/10">
          <WalletCards className="h-5 w-5 text-[#004D77]" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-500">
        {hasBalance
          ? "Disponible para aplicar en futuras compras."
          : "No hay saldo a favor registrado en este momento."}
      </p>
    </div>
  );
}
