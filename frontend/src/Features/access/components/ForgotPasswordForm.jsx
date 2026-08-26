import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, KeyRound, Loader2, Send } from "lucide-react";
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
      <header className="relative overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
        <div className="relative flex items-center justify-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
            <KeyRound className="h-5 w-5 text-white" strokeWidth={1.8} />
          </div>
          <h2 className="font-lexend text-lg font-bold text-[#f9f9f9] sm:text-xl">
            Recuperar contraseña
          </h2>
        </div>
      </header>

      {/* Body */}
      <div className="p-6 sm:p-7 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div className="flex items-start gap-2.5 rounded-lg border border-[#004D77]/15 bg-[#004D77]/5 px-3.5 py-3 text-sm text-[#003b5c]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#004D77]" strokeWidth={2} />
            <p className="leading-relaxed">
              Ingresa tu correo registrado y te enviaremos un código para restablecer tu contraseña.
            </p>
          </div>

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
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 ${
              loading || !isValid
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer hover:bg-[#003b5c] hover:shadow-md"
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" strokeWidth={1.8} />
            )}
            {loading ? "Enviando..." : "Enviar código"}
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
