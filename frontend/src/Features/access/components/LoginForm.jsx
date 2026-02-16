import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"

export default function LoginForm() {

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">

      <h2 className="font-lexend text-xl md:text-2xl font-semibold mb-2 text-gray-800 text-center">
        Papelería Magic
      </h2>

      <p className="mb-5 text-sm text-gray-600 text-center">
        ¡Qué gusto verte otra vez! Ingresa para continuar.
      </p>

      <form className="flex flex-col">

        {/* Bloque Inputs */}
        <div className="flex flex-col gap-4">

          {/* Correo */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="ejemplo@email.com"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

        </div>

        {/* Recordar y Olvidaste */}
        <div className="flex items-center justify-between text-xs mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Recordarme
          </label>

          <Link 
            to="/forgot-password"
            className="text-blue-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition cursor-pointer mt-4 text-sm"
        >
          Ingresar
        </button>

        {/* Crear cuenta */}
        <div className="text-center text-xs mt-3">
          ¿No tienes cuenta?{" "}
          <Link 
            to="/register"
            className="text-blue-700 font-medium hover:underline"
          >
            Regístrate
          </Link>
        </div>

      </form>
    </div>
  )
}
