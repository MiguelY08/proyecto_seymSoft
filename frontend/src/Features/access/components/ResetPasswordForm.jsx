import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { verifyRecoveryCode, resetPassword, requestPasswordRecovery } from "../services/passwordRecoveryService"
import { useAlert } from "../../shared/alerts/useAlert"

export default function ResetPasswordForm() {

  // ─── navegación entre páginas ─────────────────────────────────────
  const navigate = useNavigate()

  // ─── sistema de alertas ───────────────────────────────────────────
  const { showError, showSuccess, showWarning, showInfo } = useAlert()

  // ─── mostrar / ocultar contraseñas ─────────────────────────────────
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ─── código OTP de 6 dígitos ──────────────────────────────────────
  const [code, setCode] = useState(Array(6).fill(""))

  // ─── datos del formulario ─────────────────────────────────────────
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })

  // ─── tiempo restante del OTP ──────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(0)

  // ─── fecha de expiración del código ───────────────────────────────
  const [expiresAt, setExpiresAt] = useState(null)

  // ─── temporizador para reenviar código ────────────────────────────
  const [resendTimer, setResendTimer] = useState(60)

  // --- estado para error de validación de contraseñas ---
  const [passwordError, setPasswordError] = useState("")


  /* ==========================================================================
     Cargar fecha de expiración del código almacenado en localStorage
  ========================================================================== */

  useEffect(() => {

    const recovery = JSON.parse(localStorage.getItem("pm_password_recovery"))

    if (recovery) {
      setExpiresAt(recovery.expiresAt)
    }

  }, [])


  /* ==========================================================================
     Contador de expiración del código OTP
  ========================================================================== */

  useEffect(() => {

    if (!expiresAt) return

    const updateTimer = () => {

      const remaining = expiresAt - Date.now()

      if (remaining <= 0) {
        setTimeLeft(0)
        return
      }

      setTimeLeft(Math.floor(remaining / 1000))
    }

    updateTimer()

    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)

  }, [expiresAt])


  /* ==========================================================================
     Temporizador para habilitar reenvío del código
  ========================================================================== */

  useEffect(() => {

    if (resendTimer <= 0) return

    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1)
    }, 1000)

    return () => clearInterval(interval)

  }, [resendTimer])


  /* ==========================================================================
     Formatear tiempo mm:ss
  ========================================================================== */

  const formatTime = (seconds) => {

    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${minutes}:${secs.toString().padStart(2, "0")}`

  }


  /* ==========================================================================
     Manejar cambios en inputs de contraseña
  ========================================================================== */

const handleChange = (e) => {

  const { name, value } = e.target

  const updatedForm = {
    ...formData,
    [name]: value
  }

  setFormData(updatedForm)

  // ─── validar coincidencia de contraseñas en tiempo real ───
  if (updatedForm.password && updatedForm.confirmPassword) {

    if (updatedForm.password !== updatedForm.confirmPassword) {

      setPasswordError("Las contraseñas no coinciden")

    } else {

      setPasswordError("")

    }

  }

}


  /* ==========================================================================
     Manejar ingreso manual del código OTP
  ========================================================================== */

const handleCodeChange = (e, index) => {

  const value = e.target.value.replace(/[^0-9]/g, "")

  const newCode = [...code]

  newCode[index] = value

  setCode(newCode)

  // avanzar automáticamente
  if (value && index < 5) {
    document.getElementById(`code-${index + 1}`).focus()
  }

  const finalCode = newCode.join("")

  // si los 6 dígitos están completos validar automáticamente
  if (finalCode.length === 6) {
    validateOTP(finalCode)
  }

}

  /* ==========================================================================
     Permitir pegar código completo
  ========================================================================== */

const handlePaste = (e) => {

  e.preventDefault()

  const pastedData = e.clipboardData
    .getData("text")
    .replace(/[^0-9]/g, "")

  const digits = pastedData.slice(0, 6).split("")

  const newCode = [...code]

  digits.forEach((digit, index) => {
    newCode[index] = digit
  })

  setCode(newCode)

  const finalCode = digits.join("")

  if (finalCode.length === 6) {
    validateOTP(finalCode)
  }

}

  // ─── validar código automáticamente cuando se completan los 6 dígitos ───
  const validateOTP = (otp) => {

    try {

      verifyRecoveryCode(otp)

      // código correcto
      return true

    } catch (error) {

      showError(
        "Código incorrecto",
        "El código ingresado no es válido o ha expirado"
      )

      setCode(Array(6).fill(""))

      document.getElementById("code-0")?.focus()

      return false

    }

  }


  /* ==========================================================================
     Enviar formulario de restablecimiento
  ========================================================================== */

  const handleSubmit = (e) => {

    e.preventDefault()

    const finalCode = code.join("")

    if (finalCode.length < 6) {

      showWarning(
        "Código incompleto",
        "Debes ingresar los 6 dígitos del código"
      )

      return
    }

    if (formData.password.length < 8) {

      showWarning(
        "Contraseña inválida",
        "La contraseña debe tener mínimo 8 caracteres"
      )

      return
    }

    if (formData.password !== formData.confirmPassword) {

      showWarning(
        "Contraseñas diferentes",
        "Las contraseñas no coinciden"
      )

      return
    }

    try {

      // verificar código
      const email = verifyRecoveryCode(finalCode)

      // cambiar contraseña
      resetPassword(email, formData.password)

      showSuccess(
        "Contraseña actualizada",
        "Tu contraseña se restableció correctamente"
      )

      navigate("/login")

    } catch (err) {

      showError(
        "Error",
        err.message
      )

    }

  }


  /* ==========================================================================
     Reenviar código OTP
  ========================================================================== */

  const handleResendCode = async () => {

    try {

      const recovery = JSON.parse(localStorage.getItem("pm_password_recovery"))

      if (!recovery) return

      await requestPasswordRecovery(recovery.email)

      setCode(Array(6).fill(""))

      setResendTimer(60)

      const updatedRecovery = JSON.parse(localStorage.getItem("pm_password_recovery"))

      setExpiresAt(updatedRecovery.expiresAt)

      showInfo(
        "Código reenviado",
        "Se ha enviado un nuevo código a tu correo"
      )

    } catch {

      showError(
        "Error",
        "No se pudo reenviar el código"
      )

    }

  }


  return (

    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      <div className="bg-[#004D77] py-3">
        <h2 className="font-lexend text-lg md:text-xl font-semibold text-white text-center">
          Restablecer Contraseña
        </h2>
      </div>

      <div className="px-6 py-5 md:px-7 md:py-6">

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* OTP */}
          <div>

            <label className="block mb-3 text-sm font-medium text-center">
              Código enviado al correo
            </label>

            <div className="flex justify-center gap-2 flex-wrap">

              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(e, index)}
                  onPaste={handlePaste}
                  className="w-10 h-10 md:w-11 md:h-11 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              ))}

            </div>

            {timeLeft > 0 ? (
              <p className="text-center text-xs text-gray-500 mt-2">
                El código expira en: {formatTime(timeLeft)}
              </p>
            ) : (
              <p className="text-center text-xs text-red-500 mt-2">
                El código ha expirado
              </p>
            )}

          </div>

          {/* contraseñas */}
          <div className="grid md:grid-cols-2 gap-4">

            <div className="relative">

              <label className="block mb-1 text-sm font-medium">
                Nueva contraseña
              </label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {passwordError && (
                <p className="text-red-500 text-xs text-center">
                  {passwordError}
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-500"
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>

            </div>

            <div className="relative">

              <label className="block mb-1 text-sm font-medium">
                Confirmar contraseña
              </label>

              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-600 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[34px] text-gray-500"
              >
                {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-[#004D77] text-white py-2 rounded-lg hover:bg-[#004D77]/90 transition"
          >
            Restablecer Contraseña
          </button>

          <div className="text-center mt-1">

            {resendTimer > 0 ? (
              <p className="text-xs text-gray-500">
                Reenviar código en {resendTimer}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Reenviar código
              </button>
            )}

          </div>

        </form>

      </div>

    </div>
  )
}