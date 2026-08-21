import { ContactRound, X } from "lucide-react";
import { useState, useMemo } from "react";
import GenerateInterestModal from "./GenerateInterestModal";
import { generateInterest } from "../services/paymentsServices";
import { useAlert } from "../../../../shared/alerts/useAlert";
import Permission from "../../../configuration/roles/components/Permission";

/*
  Modal de gestión de contacto para clientes con facturas vencidas.
  Muestra resumen del cliente y permite aplicar interés a una factura vencida.

  Props:
    account          → objeto cliente completo { nombre, telefono, overdueCredits[] }
    onClose          → () => void
    onInterestApplied → () => void — recarga los datos en el padre tras aplicar interés
*/
export default function ContactClientModal({
  account,
  onClose,
  onInterestApplied,
}) {
  const { showSuccess, showError } = useAlert();
  const [showInterestModal, setShowInterestModal] = useState(false);
  // Crédito seleccionado para aplicar el interés
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  // Último pago: ya no disponible desde el backend
  // Mostramos temporalmente "No disponible" en la UI

  // Días de mora: provisto por el backend en `overdueCredits[].overdueDays`
  const daysLate = useMemo(() => {
    const overdueCredits = account?.overdueCredits ?? [];

    if (!overdueCredits.length) {
      return 0;
    }

    return Math.max(...overdueCredits.map((credit) => credit.overdueDays ?? 0));
  }, [account]);

  // Créditos vencidos que vienen del backend
  const overdueCredits = account?.overdueCredits ?? [];

  const handleOpenInterest = (credit) => {
    setFacturaSeleccionada(credit);
    setShowInterestModal(true);
  };


  const handleApplyInterest = async ({ percentage }) => {
    try {
      await generateInterest({
        id_credit: facturaSeleccionada.idCredit,
        percentage,
      });

      showSuccess(
        "Interes aplicado",
        "El interes fue generado correctamente.",
      );
      setShowInterestModal(false);
      if (onInterestApplied) onInterestApplied();
      onClose();
    } catch (error) {
      console.error(error);
      showError(
        "Error al aplicar interes",
        error.response?.data?.message ||
          error.message ||
          "No fue posible generar el interes.",
      );
    }
  };

  if (!account) return null;

  if (showInterestModal && facturaSeleccionada) {
    return (
      <GenerateInterestModal
        cliente={account}
        factura={facturaSeleccionada}
        onClose={() => setShowInterestModal(false)}
        onApply={handleApplyInterest}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden font-lexend flex flex-col">
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                <ContactRound className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#f9f9f9] sm:text-xl">
                  Gestión de contacto al cliente
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar gestión de contacto"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-5 space-y-4 overflow-visible">
          {/* INFO CLIENTE */}
          <div className="bg-gray-100 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="font-medium">
                  {account.fullName ?? account.nombre}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="font-medium">
                  {account.phone ?? account.telefono}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">Último pago</p>

                <p className="font-medium">
                  {account.lastPaymentDate
                    ? new Date(
                        account.lastPaymentDate
                      ).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Sin registros"}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-gray-500">Días de atraso</p>
                <p
                  className={`font-semibold ${daysLate > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {daysLate > 0 ? `${daysLate} días` : "Sin mora"}
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-500">Créditos vencidos</p>
                <p className="font-medium">{overdueCredits.length}</p>
              </div>
            </div>
          </div>

          {/* CRÉDITOS VENCIDOS — selector para aplicar interés */}
          {overdueCredits.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">
                Selecciona un crédito para aplicar interés:
              </p>
              {overdueCredits.map((credit) => (
                <div
                  key={credit.idCredit}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-medium">
                      Crédito #{credit.idCredit}
                    </span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-red-600 font-semibold break-words">
                      Saldo pendiente: $
                      {new Intl.NumberFormat("es-CO").format(
                        credit.remainingBalance ?? 0,
                      )}
                    </span>
                  </div>
                  <Permission permission="pagos_y_abonos.generar_interes">
                  <button
                    type="button"
                    onClick={() => handleOpenInterest(credit)}
                    className="w-full sm:w-auto rounded-full bg-[#004D77] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 cursor-pointer"
                  >
                    Aplicar interés
                  </button>
                  </Permission>
                </div>
              ))}
            </div>
          )}

        </div>
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
