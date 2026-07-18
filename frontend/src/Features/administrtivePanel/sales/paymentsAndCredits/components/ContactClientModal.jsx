import { X } from "lucide-react";
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
      <div className="bg-white w-full max-w-md max-h-[94vh] rounded-xl shadow-xl overflow-hidden font-lexend flex flex-col">
        {/* HEADER */}
        <div className="bg-[#004D77] text-white px-4 py-3 flex justify-between items-center gap-3">
          <h3 className="font-semibold text-sm sm:text-base">Gestión de contacto al cliente</h3>
          <X size={18} className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
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
                    onClick={() => handleOpenInterest(credit)}
                    className="w-full sm:w-auto text-xs px-3 py-2 sm:py-1 bg-[#004D77] text-white rounded-lg hover:bg-[#003D5e] transition cursor-pointer"
                  >
                    Interés
                  </button>
                  </Permission>
                </div>
              ))}
            </div>
          )}

          {/* BOTÓN CERRAR */}
          <div className="flex justify-stretch sm:justify-end pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-400 rounded-lg text-sm text-white hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
