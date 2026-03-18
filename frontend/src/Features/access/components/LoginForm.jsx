import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { loginUser } from "../services/authService";
import { saveSession } from "../helpers/authStorage";
import { validateLogin } from "../validators/authValidators";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../../shared/alerts/useAlert";

export default function LoginForm() {

  // ─── Contexto de autenticación ─────────────────────────────────────────────
  // Permite guardar el usuario autenticado en el contexto global
  const { setUser } = useAuth();

  // ─── Navegación entre rutas ────────────────────────────────────────────────
  const navigate = useNavigate();

  // ─── Sistema de alertas compartido ─────────────────────────────────────────
  const { showError, showSuccess, showWarning } = useAlert();

  // ─── Control de visibilidad de contraseña ──────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);

  // ─── Estado del formulario ─────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // ─── Estado de errores de validación ───────────────────────────────────────
  const [errors, setErrors] = useState({});


  /* ========================================================================== 
     handleChange
     Se ejecuta cada vez que el usuario escribe en un input.
     - Actualiza el estado del formulario
     - Ejecuta validación en tiempo real
  ========================================================================== */

  const handleChange = (e) => {

    const { name, value } = e.target;

    const updatedForm = {
      ...formData,
      [name]: value
    };

    setFormData(updatedForm);

    // validar solo el campo modificado
    const validationErrors = validateLogin(updatedForm);

    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name]
    }));
  };


  /* ========================================================================== 
     handleSubmit
     Se ejecuta cuando el usuario envía el formulario.
     Flujo:
     1. Validar campos
     2. Intentar login
     3. Guardar sesión
     4. Actualizar contexto
     5. Redirigir al dashboard
  ========================================================================== */

  const handleSubmit = (e) => {

    e.preventDefault();

    // validar formulario completo antes de enviar
    const validationErrors = validateLogin(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      showWarning(
        "Campos incompletos",
        "Por favor corrige los campos del formulario"
      );

      return;
    }

    try {

      const session = loginUser(
        formData.email,
        formData.password
      );

      console.log("SESSION GENERADA:", session);
      console.log("ROL DEL USUARIO:", session.user.role);
      console.log("REDIRECT TO:", session.redirectTo);

      saveSession(session);
      setUser(session.user);

      showSuccess(
        "Inicio de sesión exitoso",
        `Bienvenido ${session.user.name}`
      );

      navigate(session.redirectTo);

    } catch (error) {

      showError(
        "Error de autenticación",
        error.message
      );

      setErrors({
        general: error.message
      });

    }

  } ;

  /* ========================================================================== 
     inputStyle
     Genera estilos dinámicos para inputs dependiendo si tienen error.
  ========================================================================== */

  const inputStyle = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none
    ${errors[field]
      ? "border-red-500 focus:ring-red-500"
      : "focus:ring-2 focus:ring-blue-600"
    }`;


  return (

    <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">

      {/* ─── Título del sistema ───────────────────────────────────────────── */}
      <h2 className="font-lexend text-xl md:text-2xl font-semibold mb-2 text-gray-800 text-center">
        Papelería Magic
      </h2>

      <p className="mb-5 text-sm text-gray-600 text-center">
        ¡Qué gusto verte otra vez! Ingresa para continuar.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col"
      >

        <div className="flex flex-col gap-4">

          {/* ─── Campo correo ───────────────────────────────────────────── */}
          <div>

            <label className="block mb-1 text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@email.com"
              className={inputStyle("email")}
            />

            {errors.email &&
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            }

          </div>

          {/* ─── Campo contraseña ───────────────────────────────────────── */}
          <div className="relative">

            <label className="block mb-1 text-sm font-medium text-gray-700">
              Contraseña
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className={inputStyle("password")}
            />

            {/* botón mostrar contraseña */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>

            {errors.password &&
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            }

          </div>

        </div>

        {/* ─── Error general ───────────────────────────────────────────── */}
        {errors.general &&
          <p className="text-red-500 text-xs mt-3 text-center">
            {errors.general}
          </p>
        }

        {/* ─── Opciones extra ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-xs mt-4">

          <label className="flex items-center gap-2">
            <input type="checkbox"/>
            Recordarme
          </label>

          <Link
            to="/forgotpassword"
            className="text-blue-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>

        </div>

        {/* ─── Botón login ───────────────────────────────────────────── */}
        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition cursor-pointer mt-4 text-sm"
        >
          Ingresar
        </button>

        {/* ─── Registro ─────────────────────────────────────────────── */}
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

  );
}