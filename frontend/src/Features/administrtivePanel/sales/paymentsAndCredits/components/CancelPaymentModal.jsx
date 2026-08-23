import { useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Trash2, X } from "lucide-react";
import { cancelInstallment } from "../services/paymentsServices";
import { useAlert } from "../../../../shared/alerts/useAlert";

const WRONG_PASSWORD_MESSAGE =
  "Contraseña incorrecta. Verifica e intenta de nuevo.";

const getErrorText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(getErrorText).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return [
      value.message,
      value.error,
      value.detail,
      value.errors,
      value.data,
      value.response,
      value.userMessage,
    ]
      .map(getErrorText)
      .filter(Boolean)
      .join(" ");
  }

  return "";
};

const normalizeErrorText = (value) =>
  getErrorText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isWrongPasswordError = (error) => {
  const status = error?.response?.status;
  const text = normalizeErrorText([
    error?.response?.data,
    error?.userMessage,
    error?.message,
  ]);

  if (
    /(password|contrasena|credencial|unauthorized|forbidden|incorrect)/i.test(
      text,
    )
  ) {
    return true;
  }

  if (status === 401 || status === 403) return true;

  return (
    status === 500 &&
    /(error interno|internal server error|ocurrio un error interno)/i.test(text)
  );
};

const getCancelInstallmentErrorMessage = (error) => {
  if (isWrongPasswordError(error)) return WRONG_PASSWORD_MESSAGE;

  return (
    getErrorText(error?.response?.data) ||
    error?.userMessage ||
    error?.message ||
    "No fue posible anular el abono."
  );
};

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

  const validatePassword = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "La contraseña es obligatoria.";
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

  const trimmedReason = reason.trim();
  const reasonError = validateReason(trimmedReason);
  const passwordError = validatePassword(password);
  const canSubmit =
    !isSubmitting && !reasonError && !passwordError && trimmedReason.length > 0;

  const handleSubmit = async () => {
    if (isSubmitting || submitLockRef.current) return;

    submitLockRef.current = true;

    const currentReasonError = validateReason(reason);
    const currentPasswordError = validatePassword(password);

    if (currentReasonError || currentPasswordError) {
      setErrors({
        reason: currentReasonError,
        password: currentPasswordError,
      });

      await showWarning(
        "Formulario incompleto",
        currentReasonError || currentPasswordError,
      );

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
      const message = getCancelInstallmentErrorMessage(error);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-160 flex-col overflow-hidden rounded-none bg-white font-lexend shadow-xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl">
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                <Trash2 className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                  Anular abono
                </h2>
                <p className="mt-0.5 truncate text-sm text-sky-100">
                  {account?.nombre || "Cliente sin nombre"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cerrar anulación de abono"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:gap-4 sm:p-4 md:p-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Esta acción marcará el abono como anulado. El saldo de la factura
            será recalculado automáticamente.
          </p>

          {/* DATOS DEL ABONO */}
          <div className="grid grid-cols-1 gap-2 text-sm wrap-break-word sm:grid-cols-2 lg:grid-cols-3 [&>p]:rounded-xl [&>p]:border [&>p]:border-slate-200 [&>p]:bg-slate-50 [&>p]:p-3 [&>p]:text-slate-700 [&>p]:shadow-sm">
            <p>
              <strong>Nro Abono:</strong> #
              {payment?.displayId ?? payment?.nroAbono ?? "-"}
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

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium">
                <span className="mr-1 text-red-500">*</span>
                Motivo de anulación
                <span className="ml-1 text-xs text-gray-500">(requerido)</span>
              </label>
              <textarea
                value={reason}
                onChange={handleReasonChange}
                placeholder="Escriba el motivo..."
                className={`w-full mt-1 p-3 min-h-24 rounded-lg border outline-none transition ${
                  errors.reason
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                }`}
              />
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                <span className="mr-1 text-red-500">*</span>
                Contraseña del administrador
                <span className="ml-1 text-xs text-gray-500">(requerido)</span>
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
          </div>

        </div>
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
            )}
            {isSubmitting ? "Anulando..." : "Confirmar anulación"}
          </button>
        </footer>
      </div>
    </div>
  );
}
