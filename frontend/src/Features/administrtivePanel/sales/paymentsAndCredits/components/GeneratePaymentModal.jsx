import { useState, useEffect, useMemo, useRef } from "react";
import { CircleDollarSign, Loader2, X } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { getPaymentMethods } from "../services/paymentsServices";
import { mapPaymentMethods } from "../mappers/paymentsMapper";

export default function GeneratePaymentModal({
  cliente,
  factura,
  onClose,
  onSave,
}) {
  const { showError, showWarning, showConfirm } = useAlert();

  const capitalPendiente =
    factura?.capitalPendiente ??
    factura?.remainingCapital ??
    factura?.saldo ??
    0;

  const interesPendiente =
    factura?.interesPendiente ??
    factura?.interes ??
    factura?.pendingInterest ??
    0;

  const deudaTotal =
    factura?.deudaTotal ??
    factura?.saldoPendiente ??
    Number(capitalPendiente) + Number(interesPendiente);

  const favorBalance = Number(cliente?.favorBalance ?? 0);
  const minimumInstallmentAmount =
    Number(deudaTotal) >= 10000 ? 10000 : Number(deudaTotal);

  const [monto, setMonto] = useState("");
  const [idPaymentMethod, setIdPaymentMethod] = useState(2);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLockRef = useRef(false);

  const formatNumber = (value) => {
    if (value === "" || value === null || value === undefined) return "";

    return new Intl.NumberFormat("es-CO").format(value);
  };

  const parseNumber = (value) => Number(String(value).replace(/\./g, ""));

  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find(
        (method) => Number(method.id) === Number(idPaymentMethod),
      ),
    [paymentMethods, idPaymentMethod],
  );

  const isFavorBalanceMethod =
    Number(idPaymentMethod) === 4 ||
    selectedPaymentMethod?.nombre?.toLowerCase() === "saldo a favor";

  const getAmountError = (
    rawValue,
    numericValue,
    isFavorMethod = isFavorBalanceMethod,
  ) => {
    if (!rawValue) {
      return "Ingrese un monto";
    }

    if (numericValue <= 0) {
      return "El monto del abono debe ser mayor a $0.";
    }

    if (numericValue > Number(deudaTotal)) {
      return "El monto no puede ser mayor a la deuda";
    }

    if (
      Number(deudaTotal) >= 10000 &&
      numericValue < minimumInstallmentAmount
    ) {
      return "El abono mínimo permitido es de $10.000.";
    }

    if (Number(deudaTotal) < 10000 && numericValue !== Number(deudaTotal)) {
      return `La deuda pendiente es menor a $10.000. Debe abonar el total exacto: $${formatNumber(deudaTotal)}.`;
    }

    if (isFavorMethod && numericValue > favorBalance) {
      return `El cliente no tiene saldo a favor suficiente. Disponible: $${formatNumber(favorBalance)}.`;
    }

    return undefined;
  };

  useEffect(() => {
    let isMounted = true;

    const loadPaymentMethods = async () => {
      try {
        setLoadingMethods(true);

        const methodsResponse = await getPaymentMethods();
        const mappedMethods = mapPaymentMethods(methodsResponse);

        if (!isMounted) return;

        setPaymentMethods(mappedMethods);
        setIdPaymentMethod((currentId) => {
          if (
            mappedMethods.some(
              (method) => Number(method.id) === Number(currentId),
            )
          ) {
            return currentId;
          }

          return Number(mappedMethods[0]?.id ?? currentId);
        });
      } catch (error) {
        console.error(error);

        if (isMounted) {
          showError("Error", "No se pudieron cargar los medios de pago.");
        }
      } finally {
        if (isMounted) {
          setLoadingMethods(false);
        }
      }
    };

    loadPaymentMethods();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const nuevaDeuda = useMemo(() => {
    const numericMonto = parseNumber(monto);

    if (!numericMonto || numericMonto <= 0) {
      return deudaTotal;
    }

    if (numericMonto > deudaTotal) {
      return deudaTotal;
    }

    return deudaTotal - numericMonto;
  }, [monto, deudaTotal]);

  const validate = () => {
    const newErrors = {};
    const numericMonto = parseNumber(monto);
    const amountError = getAmountError(monto, numericMonto);
    const trimmedObs = observacion.trim();

    if (amountError) {
      newErrors.monto = amountError;
    }

    if (trimmedObs.length > 255) {
      newErrors.observacion = "Máximo 255 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const numericMonto = parseNumber(monto);
  const currentAmountError = getAmountError(monto, numericMonto);
  const canSubmit =
    !currentAmountError &&
    !errors.monto &&
    !errors.observacion &&
    !isSubmitting &&
    !loadingMethods &&
    paymentMethods.length > 0;

  const handleSubmit = async () => {
    if (isSubmitting || submitLockRef.current) return;

    submitLockRef.current = true;

    if (!validate()) {
      await showWarning(
        "Formulario incompleto",
        "Revisa los campos marcados en rojo.",
      );

      submitLockRef.current = false;

      return;
    }

    const confirm = await showConfirm(
      "question",
      "¿Registrar abono?",
      `Se abonará ${formatNumber(
        parseNumber(monto),
      )} a la factura ${factura?.nroFactura}.`,
      {
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Revisar",
      },
    );

    if (!confirm.isConfirmed) {
      submitLockRef.current = false;

      return;
    }

    try {
      setIsSubmitting(true);

      await onSave({
        monto: parseNumber(monto),
        idPaymentMethod,
        observacion: observacion.trim(),
      });

      onClose();
    } catch (error) {
      showError(
        "Error al guardar",
        error.message || "Ocurrió un problema al registrar el abono.",
      );
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 font-lexend backdrop-blur-sm sm:p-4">
      <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-160 flex-col overflow-hidden rounded-none bg-white shadow-xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl">
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                <CircleDollarSign className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                  Registrar abono
                </h2>
                <p className="mt-0.5 truncate text-sm text-sky-100">
                  {cliente?.nombre || "Cliente sin nombre"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cerrar registro de abono"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 sm:p-5">
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-gray-500">
                Factura:
                <span className="font-medium text-gray-700 ml-1">
                  {factura?.nroFactura}
                </span>
              </p>

              <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-gray-500">
                Capital pendiente:
                <span className="font-semibold text-gray-700 ml-1">
                  ${formatNumber(capitalPendiente)}
                </span>
              </p>

              {Number(interesPendiente) > 0 && (
                <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-gray-500 sm:col-span-2">
                  Interés pendiente:
                  <span className="font-semibold text-amber-600 ml-1">
                    ${formatNumber(interesPendiente)}
                  </span>
                </p>
              )}

              <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-gray-500">
                Saldo pendiente:
                <span className="font-semibold text-red-600 ml-1">
                  ${formatNumber(deudaTotal)}
                </span>
              </p>

              <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-gray-500">
                Saldo a favor disponible:
                <span className="font-semibold text-emerald-600 ml-1">
                  ${formatNumber(favorBalance)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs text-gray-500">Monto de Abono</label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={monto}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    const formattedValue = formatNumber(rawValue);
                    const numeric = Number(rawValue);

                    setMonto(formattedValue);
                    setErrors((prev) => ({
                      ...prev,
                      monto: getAmountError(formattedValue, numeric),
                    }));
                  }}
                  placeholder="0"
                  className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none ${
                    errors.monto
                      ? "border-red-500 ring-2 ring-red-300"
                      : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
                  }`}
                />

                {errors.monto && (
                  <p className="text-xs text-red-500 mt-1">{errors.monto}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500">Medio de Pago</label>

                <select
                value={idPaymentMethod}
                disabled={loadingMethods}
                onChange={(e) => {
                  const nextIdPaymentMethod = Number(e.target.value);
                  const nextMethod = paymentMethods.find(
                    (method) => Number(method.id) === nextIdPaymentMethod,
                  );
                  const nextIsFavorBalanceMethod =
                    nextIdPaymentMethod === 4 ||
                    nextMethod?.nombre?.toLowerCase() === "saldo a favor";

                  setIdPaymentMethod(nextIdPaymentMethod);
                  setErrors((prev) => ({
                    ...prev,
                    monto: getAmountError(
                      monto,
                      parseNumber(monto),
                      nextIsFavorBalanceMethod,
                    ),
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004D77] disabled:bg-gray-100 disabled:text-gray-500"
              >
                {loadingMethods && (
                  <option value={idPaymentMethod}>Cargando...</option>
                )}

                {!loadingMethods &&
                  paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.nombre}
                    </option>
                  ))}
                </select>

                {isFavorBalanceMethod && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Disponible: ${formatNumber(favorBalance)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500">
                Observación (opcional)
              </label>

              <textarea
                rows={2}
                value={observacion}
                onChange={(e) => {
                  const value = e.target.value;

                  setObservacion(value);

                  const trimmed = value.trim();

                  if (trimmed.length > 255) {
                    setErrors((prev) => ({
                      ...prev,
                      observacion: "Máximo 255 caracteres",
                    }));
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      observacion: undefined,
                    }));
                  }
                }}
                placeholder="Descripción del abono..."
                className={`w-full px-3 py-2 rounded-lg border resize-none transition focus:outline-none ${
                  errors.observacion
                    ? "border-red-500 ring-2 ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
                }`}
              />

              {errors.observacion && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.observacion}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500">
                Deuda después del abono
              </label>

              <input
                type="text"
                disabled
                value={`$ ${formatNumber(nuevaDeuda)}`}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 font-medium"
              />
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
                <CircleDollarSign className="h-4 w-4" strokeWidth={1.8} />
              )}
              {isSubmitting ? "Guardando..." : "Guardar abono"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
