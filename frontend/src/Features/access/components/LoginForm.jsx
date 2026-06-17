import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { validateLogin } from "../validators/authValidators.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useAlert } from "../../shared/alerts/useAlert.js";

export default function LoginForm() {

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useAlert();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validar en tiempo real
    const validationErrors = validateLogin(updatedForm);
    setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setTouched({ email: true, password: true });

  const validationErrors = validateLogin(formData);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    showWarning("Campos incompletos", "Por favor completa email y contraseña");
    return;
  }

  try {
    const result = await login(formData.email, formData.password);

    if (result.success) {
      // ESPERA AQUÍ para que se vea el spinner
      
      navigate(result.redirectTo);
    } else {
      setErrors({ general: result.error });
      showError("Error de autenticación", result.error);
    }

  } catch (error) {
    console.error("Error en handleSubmit:", error);
    showError("Error inesperado", "No pudimos procesar tu login");
    setErrors({ general: "Error inesperado" });
  }
};

  const inputStyle = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
    ${touched[field] && errors[field]
      ? "border-red-500 focus:ring-2 focus:ring-red-200"
      : "border-gray-300 focus:ring-2 focus:ring-blue-600"
    }`;

  return (
    <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">

      <h2 className="font-lexend text-xl md:text-2xl font-semibold mb-2 text-gray-800 text-center">
        Papelería Magic
      </h2>

      <p className="mb-5 text-sm text-gray-600 text-center">
        ¡Qué gusto verte otra vez! Ingresa para continuar.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col">

        <div className="flex flex-col gap-4">

          {/* Campo correo */}
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@email.com"
              className={inputStyle("email")}
              disabled={loading}
              autoComplete="email"
            />

            {touched.email && errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Campo contraseña */}
          <div className="relative">
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Contraseña
            </label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputStyle("password")}
              disabled={loading}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={loading}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

        </div>

        {/* Error general */}
        {errors.general && (
          <p className="text-red-500 text-xs mt-3 text-center bg-red-50 p-2 rounded">
            {errors.general}
          </p>
        )}

        {/* Opciones extra */}
        <div className="flex items-center justify-between text-xs mt-4">

          <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer">
            <input 
              id="remember"
              type="checkbox" 
              disabled={loading}
            />
            Recordarme
          </label>

          <Link
            to="/forgotpassword"
            className="text-blue-700 hover:underline"
            onClick={(e) => loading && e.preventDefault()}
          >
            ¿Olvidaste tu contraseña?
          </Link>

        </div>

        {/* Botón login */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#004D77] text-white py-2 rounded-lg transition cursor-pointer mt-4 text-sm font-medium
            ${loading 
              ? "opacity-70 cursor-not-allowed" 
              : "hover:bg-[#003D5e]"
            }
          `}
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mt-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs text-gray-500">O continúa con</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
          }}
          disabled={loading}
          className={`w-full flex cursor-pointer items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-lg transition mt-4
            ${loading 
              ? "opacity-70 cursor-not-allowed" 
              : "hover:bg-gray-100"
            }
          `}
          aria-label="Iniciar sesión con Google"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        {/* Registro */}
        <div className="text-center text-xs mt-3">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-700 font-medium hover:underline"
            onClick={(e) => loading && e.preventDefault()}
          >
            Regístrate
          </Link>
        </div>

      </form>

    </div>
  );
}