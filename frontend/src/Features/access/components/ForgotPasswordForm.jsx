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
  const [isValid, setIsValid] = useState(false); // ← Nuevo

  // ✅ Validación mejorada
  const validateEmail = (emailValue) => {
    const v = emailValue.trim().toLowerCase();
    
    // Campo vacío
    if (!v) return { error: "El correo es obligatorio.", isValid: false };
    
    // Sin @
    if (!v.includes("@")) return { error: "Correo debe contener @.", isValid: false };
    
    // Sin punto
    if (!v.includes(".")) return { error: "Correo debe contener un dominio.", isValid: false };
    
    // Formato general
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return { error: "Formato de correo inválido.", isValid: false };
    }
    
    // Email válido ✅
    return { error: "", isValid: true };
  };

  // ✅ Validación en tiempo real
  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value.trim()) {
      setTouched(true);
    }

    const { error, isValid } = validateEmail(value);
    setErrors({ email: error });
    setIsValid(isValid);
  };

  // ✅ Validación al perder el foco
  const handleBlur = () => {
    setTouched(true);
    const { error, isValid } = validateEmail(email);
    setErrors({ email: error });
    setIsValid(isValid);
  };

  // ✅ Validación al enviar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    const { error, isValid } = validateEmail(email);

    if (!isValid) {
      setErrors({ email: error });
      showWarning("Correo inválido", error);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await forgotPassword(email);

      if (result.success) {
        // ✅ GUARDAR EMAIL EN sessionStorage
        sessionStorage.setItem("recovery_email", email);

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

  // ✅ Estilos dinámicos mejorados
  const inputClass = `w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all duration-200
    ${
      touched && errors.email
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
        : touched && isValid
        ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-green-50"
        : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
    }
    ${loading ? "opacity-50 cursor-not-allowed" : ""}
  `;

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#004D77] py-4">
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
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Correo Electrónico Registrado <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="ejemplo@mail.com"
                className={inputClass}
                disabled={loading}
                autoComplete="email"
              />

              {/* ✅ Ícono de validación */}
              {touched && !loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValid ? (
                    <span className="text-green-500 text-lg">✓</span>
                  ) : (
                    <span className="text-red-500 text-lg">✕</span>
                  )}
                </div>
              )}
            </div>

            {/* ✅ Mensaje de error o éxito */}
            {touched && errors.email && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <span>⚠</span> {errors.email}
              </p>
            )}

            {touched && isValid && !errors.email && (
              <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                <span>✓</span> Correo válido
              </p>
            )}
          </div>

          {/* ✅ Botón con validación visual */}
          <button
            type="submit"
            disabled={loading || !isValid}
            className={`w-full py-2.5 rounded-lg transition cursor-pointer text-sm font-medium
              ${
                !isValid
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#004D77] text-white hover:bg-[#003D5E]"
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