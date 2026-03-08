import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ForgotPasswordForm() {

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email) {
      setError("El correo es obligatorio")
      return
    }

    setTimeout(() => {
      navigate("/resetpassword")
    }, 800)
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
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

          <div>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Correo Electrónico Registrado
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
            />

            {error && (
              <p className="text-red-500 text-sm mt-1">
                {error}
              </p>
            )}

          </div>

          <button
            type="submit"
            className="w-full bg-[#004D77] text-white py-2.5 rounded-lg hover:bg-[#004D77]/90 transition"
          >
            Enviar
          </button>

        </form>

      </div>
    </div>
  )
}