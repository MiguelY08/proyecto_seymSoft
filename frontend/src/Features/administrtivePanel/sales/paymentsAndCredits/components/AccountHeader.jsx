import ButtonComponent from "../../../../shared/ButtonComponent";
import Permission from "../../../configuration/roles/components/Permission";

export default function AccountHeader({
  nombre,
  documento,
  telefono,
  estadoGeneral,
  creditoAsignado,
  saldoTotal,
  cupoDisponible,
  interesTotal,
  deudaTotal,
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
  const totalAPagar = Number(deudaTotal ?? 0);
  const credAsignado = creditoAsignado ?? 0;
  const cupoDisponibleValue = cupoDisponible ?? 0;

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
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-5 font-lexend flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
      
      {/* INFO IZQUIERDA */}
      <div className="space-y-1">
        <h2 className="text-base md:text-lg font-semibold text-gray-800">
          {mode === "payment" ? "Abonar a Cuenta" : "Detalle de Cuenta"} — {nombre}
        </h2>
        <p className="text-xs text-gray-500">Documento: {documento}</p>
        <p className="text-xs text-gray-500">Teléfono: {telefono}</p>
        <p className="text-xs">
          Estado general: <span className={`font-semibold ${estado.color}`}>{estado.label}</span>
        </p>
      </div>

      {/* CARDS + BOTÓN DERECHA */}
      <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
        
        {/* CARDS COMPACTAS EN FILA */}
        <div className="flex flex-wrap gap-2 justify-start lg:justify-end w-full">
          
          {/* Límite de Crédito */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[110px]">
            <p className="text-[9px] text-gray-400 font-medium uppercase">Límite de Crédito</p>
            <p className="text-sm font-bold text-[#004D77] mt-1">{formatCOP(credAsignado)}</p>
          </div>

          {/* Capital Adeudado */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[130px]">
            <p className="text-[9px] text-gray-400 font-medium uppercase">Capital Adeudado</p>
            <p className={`text-sm font-bold mt-1 ${cupoOcupado > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCOP(cupoOcupado)}
            </p>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all ${
                  pctOcupado >= 90 ? "bg-red-500" : pctOcupado >= 60 ? "bg-yellow-400" : "bg-green-500"
                }`}
                style={{ width: `${pctOcupado}%` }}
              />
            </div>
            <p className="text-[8px] text-gray-400 mt-0.5">{pctOcupado}% del cupo</p>
          </div>

          {/* Cupo Disponible */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[110px]">
            <p className="text-[9px] text-gray-400 font-medium uppercase">Cupo Disponible</p>
            <p className={`text-sm font-bold mt-1 ${cupoDisponibleValue > 0 ? "text-green-600" : "text-gray-400"}`}>
              {formatCOP(cupoDisponibleValue)}
            </p>
          </div>

          {/* Intereses Generados */}
          {interes > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5 text-center min-w-[110px]">
              <p className="text-[9px] text-orange-400 font-medium uppercase">Intereses Generados</p>
              <p className="text-sm font-bold text-orange-500 mt-1">{formatCOP(interes)}</p>
              <p className="text-[8px] text-orange-300 mt-0.5">No consume cupo</p>
            </div>
          )}

          {/* Deuda Total */}
            {totalAPagar > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 text-center min-w-[110px]">
                <p className="text-[9px] text-red-400 font-medium uppercase">Deuda Total</p>
                <p className="text-sm font-bold text-red-600 mt-1">{formatCOP(totalAPagar)}</p>
                {interes > 0 ? (
                  <p className="text-[8px] text-red-300 mt-0.5">Capital + Intereses</p>
                ) : (
                  <p className="text-[8px] text-red-300 mt-0.5">Solo capital</p>
                )}
              </div>
            )}

        </div>

        {/* BOTÓN PDF - SIN CAMBIOS */}
        <Permission permission="pagos_y_abonos.descargar">
          <ButtonComponent
            onClick={onDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-[#004D77] text-[#004D77] hover:bg-[#003D5e] border border-[#004D77] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg px-4 py-2"
          >
            {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
          </ButtonComponent>
        </Permission>

      </div>

    </div>
  );
}
