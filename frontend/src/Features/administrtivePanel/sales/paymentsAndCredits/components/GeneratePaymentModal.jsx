import { useState, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 font-lexend p-2 sm:p-4">
      <div className="bg-white w-full max-w-md max-h-[94vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="bg-[#004D77] text-white px-4 sm:px-5 py-3 flex justify-between items-center gap-3">
          <h3 className="font-semibold text-base sm:text-lg">Registrar Abono</h3>

          <X
            size={18}
            className={isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            onClick={isSubmitting ? undefined : onClose}
          />
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1 border border-gray-200">
            <p className="font-semibold text-gray-800 break-words">{cliente?.nombre}</p>

            <p className="text-gray-500">
              Factura:
              <span className="font-medium text-gray-700 ml-1">
                {factura?.nroFactura}
              </span>
            </p>

            <p className="text-gray-500">
              Capital pendiente:
              <span className="font-semibold text-gray-700 ml-1">
                ${formatNumber(capitalPendiente)}
              </span>
            </p>

            {Number(interesPendiente) > 0 && (
              <p className="text-gray-500">
                Interés pendiente:
                <span className="font-semibold text-amber-600 ml-1">
                  ${formatNumber(interesPendiente)}
                </span>
              </p>
            )}

            <p className="text-gray-500">
              Saldo pendiente:
              <span className="font-semibold text-red-600 ml-1">
                ${formatNumber(deudaTotal)}
              </span>
            </p>

            <p className="text-gray-500">
              Saldo a favor disponible:
              <span className="font-semibold text-emerald-600 ml-1">
                ${formatNumber(favorBalance)}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
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

          <div>
            <label className="text-xs text-gray-500">Observación (opcional)</label>

            <textarea
              rows={3}
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
              <p className="text-xs text-red-500 mt-1">{errors.observacion}</p>
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

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-white transition bg-[#004D77] hover:bg-[#003D5e] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : "Guardar Abono"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
