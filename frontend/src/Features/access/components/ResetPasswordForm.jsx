import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function ResetPasswordForm() {

  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [code, setCode] = useState(Array(6).fill(""))

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })

  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCodeChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "")

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const finalCode = code.join("")

    if (finalCode.length < 6) {
      setError("Código incompleto")
      return
    }

    if (formData.password.length < 6) {
      setError("Mínimo 6 caracteres")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setTimeout(() => {
      navigate("/login")
    }, 1000)
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      {/*  Header Azul */}
      <div className="bg-[#004D77] py-4">
        <h2 className="font-lexend text-xl font-semibold text-white text-center">
          Restablecer Contraseña
        </h2>
      </div>

      <div className="p-10">

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Código OTP */}
          <div>
            <label className="block mb-4 text-sm font-medium text-center">
              Código enviado al correo
            </label>

            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              ))}
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium">
              Nueva contraseña
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-500"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium">
              Confirmar nueva contraseña
            </label>

            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[38px] text-gray-500"
            >
              {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition cursor-pointer"
          >
            Restablecer Contraseña
          </button>

        </form>

      </div>
    </div>
  )
}
