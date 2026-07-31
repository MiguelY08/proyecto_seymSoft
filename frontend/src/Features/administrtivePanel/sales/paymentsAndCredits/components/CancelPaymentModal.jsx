import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cancelInstallment } from "../services/paymentsServices";
import { useAlert } from "../../../../shared/alerts/useAlert";

/*
  Modal para anular un abono de una factura específica.

  Props:
    isOpen    → boolean
    onClose   → () => void
    clienteId → id del cliente (antes era creditId)
    facturaId → id de la factura a la que pertenece el abono ← NUEVO
    account   → objeto cliente { nombre, ... } para mostrar en pantalla
    payment   → objeto abono a anular { id, nroAbono, fecha, monto, ... }
    onSuccess → () => void — se ejecuta tras anular correctamente
*/
export default function CancelPaymentModal({
  isOpen,
  onClose,
  account,
  payment,
  onSuccess,
}) {
  const { showSuccess, showError, showWarning, showConfirm } = useAlert();

  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLockRef = useRef(false);

  if (!isOpen) return null;

  const getUserName = (user) => {
    if (!user) return null;
    if (typeof user === "string") return user;

    const composedName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const directName =
      user.nombre ??
      user.fullName ??
      user.name ??
      user.userName ??
      user.username ??
      composedName;

    return directName || getUserName(user.user) || user.email || null;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Sin registro";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const paymentIsCancelled = payment?.isCancelled ?? payment?.anulado;

  const registeredBy = getUserName(payment?.registeredBy) ?? "Sin registro";

  const cancelledBy = getUserName(payment?.cancelledBy) ?? "Sin registro";

  const cancellationReason =
    payment?.cancellationReason ?? payment?.motivoCancelacion ?? "Sin registro";

  const validateReason = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "El motivo es obligatorio.";
    if (trimmed.length < 10) return "Debe tener mínimo 10 caracteres.";
    if (/^[0-9]/.test(trimmed)) return "No puede iniciar con números.";
    return "";
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setReason(value);
    setErrors((prev) => ({ ...prev, reason: validateReason(value) }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: "" }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || submitLockRef.current) return;

    submitLockRef.current = true;

    const reasonError = validateReason(reason);

    if (reasonError) {
      setErrors({
        reason: reasonError,
      });

      await showWarning("Motivo inválido", reasonError);

      submitLockRef.current = false;

      return;
    }

    const confirm = await showConfirm(
      "warning",
      "Confirmar anulacion",
      "Esta acción no se puede deshacer.",
      {
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Volver",
      },
    );

    if (!confirm.isConfirmed) {
      submitLockRef.current = false;

      return;
    }

    try {
      setIsSubmitting(true);

      await cancelInstallment(payment?.id, reason, password);

      showSuccess("Abono anulado", "El abono fue anulado correctamente.");

      if (onSuccess) {
        await onSuccess();
      }

      setReason("");
      setPassword("");
      setErrors({});
      setShowPassword(false);

      onClose();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "No fue posible anular el abono.";

      setErrors((prev) => ({
        ...prev,
        password: message,
      }));

      showError("Error", message);
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white w-full max-w-md max-h-[94vh] rounded-2xl shadow-xl font-lexend overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="bg-[#0E3B5F] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl flex justify-between items-center gap-3">
          <h2 className="text-base sm:text-lg font-semibold">Anular Abono</h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          <p className="text-sm text-gray-600">
            Esta acción marcará el abono como anulado. El saldo de la factura
            será recalculado automáticamente.
          </p>

          {/* DATOS DEL ABONO */}
          <div className="bg-gray-100 p-3 sm:p-4 rounded-xl text-sm space-y-2 break-words">
            <p>
              <strong>Nro Abono:</strong> #
              {payment?.displayId ?? payment?.nroAbono ?? "-"}
            </p>
            <p>
              <strong>Cliente:</strong> {account?.nombre ?? "-"}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {formatDate(payment?.fecha ?? payment?.createdAt)}
            </p>
            <p>
              <strong>Valor:</strong> $
              {new Intl.NumberFormat("es-CO").format(payment?.monto ?? 0)}
            </p>
            <p>
              <strong>Medio de pago:</strong> {payment?.medioPago ?? "-"}
            </p>
            <p>
              <strong>Registrado por:</strong> {registeredBy}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              {paymentIsCancelled ? "Anulado" : "Activo"}
            </p>
            {paymentIsCancelled && (
              <>
                <p>
                  <strong>Anulado por:</strong> {cancelledBy}
                </p>
                <p>
                  <strong>Fecha de anulación:</strong>{" "}
                  {formatDateTime(payment?.cancelledAt)}
                </p>
                <p>
                  <strong>Motivo de anulación:</strong> {cancellationReason}
                </p>
              </>
            )}
          </div>

          {/* MOTIVO */}
          <div>
            <label className="text-sm font-medium">Motivo de anulación</label>
            <textarea
              value={reason}
              onChange={handleReasonChange}
              placeholder="Escriba el motivo..."
              className={`w-full mt-1 p-3 rounded-lg border outline-none transition ${
                errors.reason
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-blue-500"
              }`}
            />
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          {/* PASSWORD ADMIN */}
          <div>
            <label className="text-sm font-medium">
              Contraseña del administrador
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Ingrese contraseña"
                className={`w-full p-3 pr-10 rounded-lg border outline-none transition ${
                  errors.password
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-400 text-white py-2 rounded-xl cursor-pointer hover:bg-gray-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 text-white py-2 rounded-xl cursor-pointer bg-[#004D77] hover:bg-[#003D5e] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Anulando..." : "Confirmar anulación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
