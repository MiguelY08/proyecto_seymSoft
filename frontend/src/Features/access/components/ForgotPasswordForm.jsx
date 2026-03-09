import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { requestPasswordRecovery } from "../services/passwordRecoveryService"
import { useAlert } from "../../shared/alerts/useAlert"

export default function ForgotPasswordForm() {

  // ─── navegación entre páginas ─────────────────────────────────────
  const navigate = useNavigate()

  // ─── sistema de alertas global ────────────────────────────────────
  const { showError, showSuccess, showWarning } = useAlert()

  // ─── estado del email ─────────────────────────────────────────────
  const [email, setEmail] = useState("")

  // ─── estado de carga del botón ────────────────────────────────────
  const [loading, setLoading] = useState(false)


  /* ==========================================================================
     handleSubmit
     Se ejecuta cuando el usuario envía el formulario.

     Flujo:
     1. Validar email
     2. Solicitar recuperación de contraseña
     3. Mostrar alerta
     4. Redirigir al formulario de restablecer contraseña
  ========================================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault()

    // validar email vacío
    if (!email.trim()) {

      showWarning(
        "Campo obligatorio",
        "Debes ingresar el correo registrado"
      )

      return
    }

    try {

      setLoading(true)

      // solicitar recuperación
      await requestPasswordRecovery(email)

      // alerta éxito
      showSuccess(
        "Código enviado",
        "Revisa tu correo para continuar con la recuperación"
      )

      // redirigir a reset password
      navigate("/resetpassword")

    } catch (err) {

      // alerta error
      showError(
        "Error",
        err.message
      )

    } finally {

      setLoading(false)

    }

  }


  return (

    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="bg-[#004D77] py-4">
        <h2 className="font-lexend text-xl md:text-2xl font-semibold text-white text-center">
          Recuperar Contraseña
        </h2>
      </div>


      <div className="p-8 md:p-10">

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >

          {/* ─── Campo correo ───────────────────────────────────── */}
          <div>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Correo Electrónico Registrado
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@email.com"
              className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
            />

          </div>


          {/* ─── Botón enviar ───────────────────────────────────── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004D77] text-white py-2.5 rounded-lg hover:bg-[#004D77]/90 transition disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >

            {loading ? "Enviando..." : "Enviar código"}

          </button>

        </form>

      </div>

    </div>
  )
}