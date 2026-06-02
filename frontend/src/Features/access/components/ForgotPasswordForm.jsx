import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService.js";
import { useAlert } from "../../shared/alerts/useAlert.js";

export default function ForgotPasswordForm() {

  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useAlert();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  const validateEmail = (emailValue) => {
    const v = emailValue.trim().toLowerCase();
    if (!v) return "El correo es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo inválido.";
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value.trim().toLowerCase();
    setEmail(value);
    setTouched(true);

    // Validar en tiempo real
    const error = validateEmail(value);
    setErrors({ email: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    // Validar antes de enviar
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      showWarning("Correo incompleto", emailError);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await forgotPassword(email);

      if (result.success) {
        // ✅ GUARDAR EMAIL EN sessionStorage
        sessionStorage.setItem('recovery_email', email);

        // Alert de éxito
        showSuccess("Código enviado", "Revisa tu correo para el código de recuperación");
        
        // Redirigir a reset password
        setTimeout(() => {
          navigate("/resetpassword");
        }, 1500);
      } else {
        // Error del servidor
        setErrors({ email: result.error });
        showError("Error", result.error);
      }

    } catch (error) {
      console.error("Error en handleSubmit:", error);
      const errorMsg = "Error al solicitar recuperación de contraseña";
      setErrors({ email: errorMsg });
      showError("Error inesperado", errorMsg);

    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors duration-200
    ${touched && errors.email
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
    }
    ${loading ? "opacity-50 cursor-not-allowed" : ""}
  `;

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="bg-blue-900 py-4">
        <h2 className="font-lexend text-xl md:text-2xl font-semibold text-white text-center">
          Recuperar Contraseña
        </h2>
      </div>

      {/* Body */}
      <div className="p-8 md:p-10">

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <p className="text-sm text-gray-600 text-center">
            Ingresa tu correo registrado y te enviaremos un código para restablecer tu contraseña.
          </p>

          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
              Correo Electrónico Registrado <span className="text-red-500">*</span>
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={() => setTouched(true)}
              placeholder="ejemplo@mail.com"
              className={inputClass}
              disabled={loading}
              autoComplete="email"
            />

            {touched && errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Botón Enviar */}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className={`w-full bg-blue-900 text-white py-2.5 rounded-lg transition cursor-pointer text-sm font-medium
              ${loading || !email.trim()
                ? "opacity-70 cursor-not-allowed" 
                : "hover:bg-blue-800"
              }
            `}
          >
            {loading ? "Enviando..." : "Enviar Código"}
          </button>

          {/* Link volver */}
          <div className="text-center text-xs">
            ¿Recordaste tu contraseña?{" "}
            <a
              href="/login"
              className="text-blue-700 font-medium hover:underline"
              onClick={(e) => loading && e.preventDefault()}
            >
              Volver a login
            </a>
          </div>

        </form>

      </div>

    </div>
  );
}