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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6">

      {/* INFO IZQUIERDA */}
      <div>
        <h2 className="text-lg font-semibold">
          {isPaymentMode ? "Abonar a Cuenta" : "Detalles de Estado de Cuenta"} - {nombre}
        </h2>

        <p className="text-sm text-gray-600 mt-2">
          Documento: {documento}
        </p>

        <p className="text-sm text-gray-600">
          Teléfono: {telefono}
        </p>
      </div>

      {/* SALDO + BOTÓN */}
      <div className="text-right space-y-3">
        <div>
          <p className="text-sm text-gray-500">
            Saldo Total Actual
          </p>
          <p className="text-2xl font-bold text-[#004D77]">
            ${saldoTotal.toLocaleString()}
          </p>
        </div>

        <ButtonComponent
          className="bg-white text-[#004D77] border-[#004D77] hover:bg-[#004D77]/10"
          onClick={onAction}
        >
          {isPaymentMode ? "Generar Abono +" : "Generar PDF +"}
        </ButtonComponent>
      </div>

    </div>
  )
}