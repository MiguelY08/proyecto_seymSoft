import ButtonComponent from "../../../../shared/ButtonComponent"

export default function AccountHeader({
  nombre,
  documento,
  telefono,
  saldoTotal,
  mode,
  onAction
}) {

  const isPaymentMode = mode === "payment"

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-CO").format(value)

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 font-lexend 
                    flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

      {/* INFO IZQUIERDA */}
      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          {isPaymentMode
            ? "Abonar a Cuenta"
            : "Detalles de Estado de Cuenta"}{" "}
          - {nombre}
        </h2>

        <p className="text-sm text-gray-600">
          Documento: {documento}
        </p>

        <p className="text-sm text-gray-600">
          Teléfono: {telefono}
        </p>
      </div>

      {/* SALDO + BOTÓN */}
      <div className="flex flex-col items-start lg:items-end gap-4">

        <div className="text-left lg:text-right">
          <p className="text-sm text-gray-500">
            Saldo Total Actual
          </p>
          <p className="text-2xl font-bold text-[#004D77]">
            ${formatMoney(saldoTotal)}
          </p>
        </div>

        {/* Botón solo si existe acción */}
        {onAction && (
          <ButtonComponent
            onClick={onAction}
            className="bg-[#004D77] text-white hover:bg-[#003D5e] 
                       transition-all duration-200 rounded-lg px-4 py-2"
          >
            {isPaymentMode
              ? "Generar Abono +"
              : "Generar PDF +"}
          </ButtonComponent>
        )}

      </div>

    </div>
  )
}