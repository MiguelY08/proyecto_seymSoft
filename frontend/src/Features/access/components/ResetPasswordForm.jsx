import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { verifyRecoveryCode, resetPassword, requestPasswordRecovery } from "../services/passwordRecoveryService"
import { useAlert } from "../../shared/alerts/useAlert"

export default function ResetPasswordForm() {

  const navigate = useNavigate()
  const { showError, showSuccess, showWarning, showInfo } = useAlert()

  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [code, setCode]                   = useState(Array(6).fill(""))
  const [formData, setFormData]           = useState({ password: "", confirmPassword: "" })
  const [timeLeft, setTimeLeft]           = useState(0)
  const [expiresAt, setExpiresAt]         = useState(null)
  const [resendTimer, setResendTimer]     = useState(60)
  const [passwordError, setPasswordError] = useState("")

  // ── Estado del código: null | 'valid' | 'invalid' ────────────────────────
  const [codeStatus, setCodeStatus] = useState(null)

  useEffect(() => {
    const recovery = JSON.parse(localStorage.getItem("pm_password_recovery"))
    if (recovery) setExpiresAt(recovery.expiresAt)
  }, [])

  useEffect(() => {
    if (!expiresAt) return
    const updateTimer = () => {
      const remaining = expiresAt - Date.now()
      if (remaining <= 0) { setTimeLeft(0); return }
      setTimeLeft(Math.floor(remaining / 1000))
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedForm = { ...formData, [name]: value }
    setFormData(updatedForm)
    if (updatedForm.password && updatedForm.confirmPassword) {
      setPasswordError(
        updatedForm.password !== updatedForm.confirmPassword
          ? "Las contraseñas no coinciden"
          : ""
      )
    }
  }

  // ── Validar OTP — retorna true/false y actualiza codeStatus ─────────────
  const validateOTP = (otp) => {
    try {
      verifyRecoveryCode(otp)
      setCodeStatus('valid')
      return true
    } catch {
      setCodeStatus('invalid')
      setCode(Array(6).fill(""))
      document.getElementById("code-0")?.focus()
      return false
    }
  }

  const handleCodeChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setCodeStatus(null) // resetear color mientras escribe

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus()
    }

    const finalCode = newCode.join("")
    if (finalCode.length === 6) validateOTP(finalCode)
  }

  // ── Manejar backspace para retroceder ────────────────────────────────────
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "")
    const digits = pastedData.slice(0, 6).split("")
    const newCode = [...code]
    digits.forEach((digit, index) => { newCode[index] = digit })
    setCode(newCode)
    setCodeStatus(null)
    const finalCode = digits.join("")
    if (finalCode.length === 6) validateOTP(finalCode)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalCode = code.join("")

    if (finalCode.length < 6) {
      showWarning("Código incompleto", "Debes ingresar los 6 dígitos del código")
      return
    }
    if (formData.password.length < 8) {
      showWarning("Contraseña inválida", "La contraseña debe tener mínimo 8 caracteres")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      showWarning("Contraseñas diferentes", "Las contraseñas no coinciden")
      return
    }

    try {
      const email = verifyRecoveryCode(finalCode)
      resetPassword(email, formData.password)
      showSuccess("Contraseña actualizada", "Tu contraseña se restableció correctamente")
      navigate("/login")
    } catch (err) {
      showError("Error", err.message)
    }
  }

  const handleResendCode = async () => {
    try {
      const recovery = JSON.parse(localStorage.getItem("pm_password_recovery"))
      if (!recovery) return
      await requestPasswordRecovery(recovery.email)
      setCode(Array(6).fill(""))
      setCodeStatus(null)  // ← limpiar color al reenviar
      setResendTimer(60)
      const updatedRecovery = JSON.parse(localStorage.getItem("pm_password_recovery"))
      setExpiresAt(updatedRecovery.expiresAt)
      showInfo("Código reenviado", "Se ha enviado un nuevo código a tu correo")
    } catch {
      showError("Error", "No se pudo reenviar el código")
    }
  }

  // ── Clases dinámicas por estado del código ───────────────────────────────
  const inputCodeClass = `
    w-10 h-10 md:w-11 md:h-11 text-center text-lg border rounded-lg outline-none transition-colors duration-200
    ${codeStatus === 'valid'
      ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-300'
      : codeStatus === 'invalid'
      ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-300'
      : 'border-gray-300 focus:ring-2 focus:ring-[#004D77]/40 focus:border-[#004D77]'
    }
  `

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
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className={inputCodeClass}
                />
              ))}
            </div>

            {/* Mensaje de estado del código */}
            {codeStatus === 'valid' && (
              <p className="text-center text-xs text-green-600 mt-2 font-medium">
                ✓ Código correcto
              </p>
            )}
            {codeStatus === 'invalid' && (
              <p className="text-center text-xs text-red-500 mt-2 font-medium">
                ✗ Código incorrecto, intenta de nuevo
              </p>
            )}

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

          {/* Contraseñas */}
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
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#004D77]/40 focus:border-[#004D77] outline-none"
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
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
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#004D77]/40 focus:border-[#004D77] outline-none"
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