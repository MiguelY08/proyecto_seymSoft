import ButtonComponent from "../../../../shared/ButtonComponent";

/*
  Header del cliente en la vista de detalle.

  Props:
    nombre           → nombre del cliente
    documento        → documento del cliente
    telefono         → teléfono del cliente
    estadoGeneral    → "al_dia" | "pendiente" | "vencido"
    creditoAsignado  → límite de crédito asignado desde módulo Clientes
    saldoTotal       → cupo ocupado (solo capital, NO incluye interés)
    interesTotal     → suma de intereses pendientes de todas las facturas
    mode             → "view" | "payment"
    isGeneratingPDF  → bool
    onDownloadPDF    → () => void
*/
export default function AccountHeader({
  nombre,
  documento,
  telefono,
  estadoGeneral,
  creditoAsignado,
  saldoTotal,
  interesTotal,
  mode,
  isGeneratingPDF,
  onDownloadPDF,
}) {
  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value ?? 0);

  const cupoOcupado = saldoTotal ?? 0;
  const interes = interesTotal ?? 0;
  const credAsignado = creditoAsignado ?? 0;
  const cupoDisponible = Math.max(0, credAsignado - cupoOcupado);
  const totalAPagar = cupoOcupado + interes;

  const pctOcupado =
    credAsignado > 0
      ? Math.min(100, Math.round((cupoOcupado / credAsignado) * 100))
      : 0;

  const estadoConfig = {
    al_dia: { label: "Al día", color: "text-green-600" },
    pendiente: { label: "Pendiente", color: "text-yellow-600" },
    vencido: { label: "Vencido", color: "text-red-600" },
  };
  const estado = estadoConfig[estadoGeneral] ?? estadoConfig.al_dia;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 font-lexend flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
      {/* ── INFO IZQUIERDA ── */}
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          {mode === "payment" ? "Abonar a Cuenta" : "Detalle de Cuenta"} —{" "}
          {nombre}
        </h2>
        <p className="text-sm text-gray-500">Documento: {documento}</p>
        <p className="text-sm text-gray-500">Teléfono: {telefono}</p>
        <p className="text-sm">
          Estado general:{" "}
          <span className={`font-semibold ${estado.color}`}>
            {estado.label}
          </span>
        </p>
      </div>

      {/* ── MÉTRICAS + BOTÓN ── */}
      <div className="flex flex-col items-start lg:items-end gap-4">
        <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
          {/* Crédito Asignado — límite fijo */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-center min-w-[130px]">
            <p className="text-xs text-gray-400">Crédito Asignado</p>
            <p className="text-base font-bold text-[#004D77]">
              {formatCOP(credAsignado)}
            </p>
          </div>

          {/* Cupo Ocupado — solo capital, afecta el límite */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-center min-w-[130px]">
            <p className="text-xs text-gray-400">Cupo Ocupado</p>
            <p
              className={`text-base font-bold ${cupoOcupado > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {formatCOP(cupoOcupado)}
            </p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all ${
                  pctOcupado >= 90
                    ? "bg-red-500"
                    : pctOcupado >= 60
                      ? "bg-yellow-400"
                      : "bg-green-500"
                }`}
                style={{ width: `${pctOcupado}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {pctOcupado}% del cupo
            </p>
          </div>

          {/* Cupo Disponible */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-center min-w-[130px]">
            <p className="text-xs text-gray-400">Cupo Disponible</p>
            <p
              className={`text-base font-bold ${cupoDisponible > 0 ? "text-green-600" : "text-gray-400"}`}
            >
              {formatCOP(cupoDisponible)}
            </p>
          </div>

          {/* Interés Pendiente — solo si tiene mora */}
          {interes > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-center min-w-[130px]">
              <p className="text-xs text-orange-400">Interés Pendiente</p>
              <p className="text-base font-bold text-orange-500">
                {formatCOP(interes)}
              </p>
              <p className="text-[10px] text-orange-300 mt-0.5">
                No consume cupo
              </p>
            </div>
          )}

          {/* Total a Pagar — solo si tiene interés activo */}
          {interes > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center min-w-[130px]">
              <p className="text-xs text-red-400">Total a Pagar</p>
              <p className="text-base font-bold text-red-600">
                {formatCOP(totalAPagar)}
              </p>
              <p className="text-[10px] text-red-300 mt-0.5">
                Capital + interés
              </p>
            </div>
          )}
        </div>

        {/* Botón PDF — siempre visible */}
        <ButtonComponent
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          className="bg-[#004D77] text-[#004D77] hover:bg-[#003D5e] border border-[#004D77] 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                     rounded-lg px-4 py-2"
        >
          {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
        </ButtonComponent>
      </div>
    </div>
  );
}
