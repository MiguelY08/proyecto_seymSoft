import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resetPassword as resetPasswordService, forgotPassword } from "../services/authService.js";
import apiClient from "../../../setting/apiClient.js";
import { useAlert } from "../../shared/alerts/useAlert.js";

export default function ResetPasswordForm() {

  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useAlert();

  // Email guardado en sessionStorage
  const [recoveryEmail, setRecoveryEmail] = useState(null);

  // Estado del código OTP (6 campos)
  const [code, setCode] = useState(Array(6).fill(""));
  const [codeStatus, setCodeStatus] = useState(null); // 'valid', 'invalid', null
  const [codeValidating, setCodeValidating] = useState(false);

  // Estado de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Timers
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ═══════════════════════════════════════════════════════════
  // LEER EMAIL DEL sessionStorage AL MONTAR
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    // ✅ LEER email guardado
    const email = sessionStorage.getItem('recovery_email');
    
    if (!email) {
      showWarning("Email no encontrado", "Regresa a recuperar contraseña");
      setTimeout(() => {
        navigate("/forgotpassword");
      }, 2000);
      return;
    }

    setRecoveryEmail(email);
  }, [navigate, showWarning]);

  // ═══════════════════════════════════════════════════════════
  // TIMER DE EXPIRACIÓN DEL CÓDIGO
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    setTimeLeft(600); // 10 minutos

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          showWarning("Código expirado", "Solicita un nuevo código");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  // ═══════════════════════════════════════════════════════════
  // TIMER PARA REENVÍO DE CÓDIGO
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  // ═══════════════════════════════════════════════════════════
  // FUNCIONES HELPER
  // ═══════════════════════════════════════════════════════════

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const validatePassword = (password) => {
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 6) return "Mínimo 6 caracteres";
    if (!/[A-Z]/.test(password)) return "Debe contener al menos 1 mayúscula";
    return "";
  };

  // ═══════════════════════════════════════════════════════════
  // VALIDAR CÓDIGO EN TIEMPO REAL
  // ═══════════════════════════════════════════════════════════

  const validateCodeRealTime = async (fullCode) => {
    if (fullCode.length !== 6) {
      setCodeStatus(null);
      return;
    }

    try {
      setCodeValidating(true);

      // Llamar al endpoint de validación
      const response = await apiClient.post("/auth/validate-code", {
        token: fullCode,
      });

      if (response.data.valid) {
        setCodeStatus("valid");
      } else {
        setCodeStatus("invalid");
      }

    } catch (error) {
      console.error("Error validando código:", error);
      setCodeStatus("invalid");

    } finally {
      setCodeValidating(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // MANEJO DE CÓDIGO OTP
  // ═══════════════════════════════════════════════════════════

  const handleCodeChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Validar cuando completa 6 dígitos
    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      validateCodeRealTime(fullCode);
    }

    // Auto-focus al siguiente campo
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace: ir al campo anterior
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    const digits = pastedData.slice(0, 6).split("");
    const newCode = [...code];
    digits.forEach((digit, i) => {
      newCode[i] = digit;
    });
    setCode(newCode);

    // Validar si completó 6 dígitos
    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      validateCodeRealTime(fullCode);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // MANEJO DE CONTRASEÑAS
  // ═══════════════════════════════════════════════════════════

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validar en tiempo real
    const newErrors = {};

    if (name === "password" || name === "confirmPassword") {
      const pwd = name === "password" ? value : formData.password;
      const confirm = name === "confirmPassword" ? value : formData.confirmPassword;

      if (name === "password") {
        newErrors.password = validatePassword(value);
      }

      if (confirm && pwd !== confirm) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      } else if (confirm && pwd === confirm) {
        newErrors.confirmPassword = "";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  };

  // ═══════════════════════════════════════════════════════════
  // ENVÍO DEL FORMULARIO
  // ═══════════════════════════════════════════════════════════

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCode = code.join("");

    // Validar código
    if (codeStatus !== "valid") {
      showWarning("Código inválido", "Ingresa un código válido");
      return;
    }

    const newErrors = {};

    // Validar contraseña
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validar confirmación
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ password: true, confirmPassword: true });
      showWarning("Campos con error", "Por favor revisa los campos");
      return;
    }

    try {
      setLoading(true);

      // El código es el token que se envía al backend
      const result = await resetPasswordService(finalCode, formData.password);

      if (result.success) {
        showSuccess("¡Éxito!", "Contraseña actualizada. Inicia sesión");
        
        // ✅ LIMPIAR sessionStorage
        sessionStorage.removeItem('recovery_email');
        
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        showError("Error", result.error);
        setCodeStatus("invalid");
      }

    } catch (error) {
      console.error("Error en handleSubmit:", error);
      showError("Error inesperado", "No pudimos procesar tu solicitud");
      setCodeStatus("invalid");

    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // REENVIAR CÓDIGO
  // ═══════════════════════════════════════════════════════════

  const handleResendCode = async () => {
    if (!recoveryEmail) {
      showWarning("Error", "Email no disponible");
      return;
    }

    try {
      setLoading(true);

      // ✅ LLAMAR forgotPassword para reenviar
      const result = await forgotPassword(recoveryEmail);

      if (result.success) {
        showInfo("Código reenviado", "Revisa tu correo");
        setResendTimer(60);
        
        // Resetear código y validación
        setCode(Array(6).fill(""));
        setCodeStatus(null);
      } else {
        showError("Error", result.error);
      }

    } catch (error) {
      console.error("Error reenviar código:", error);
      showError("Error inesperado", "No pudimos reenviar el código");

    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ESTILOS
  // ═══════════════════════════════════════════════════════════

  const inputCodeClass = (index) => `
    w-10 h-10 md:w-11 md:h-11 text-center text-lg font-semibold border rounded-lg outline-none transition-colors
    ${codeStatus === "valid"
      ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-300"
      : codeStatus === "invalid"
        ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-300"
        : "border-gray-300 focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
    }
  `;

  const inputPasswordClass = (field) => `
    w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors
    ${touched[field] && errors[field]
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
    }
    ${loading ? "opacity-50 cursor-not-allowed" : ""}
  `;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="bg-blue-900 py-4">
        <h2 className="font-lexend text-lg md:text-xl font-semibold text-white text-center">
          Restablecer Contraseña
        </h2>
      </div>

      {/* Body */}
      <div className="px-6 py-5 md:px-7 md:py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email Info */}
          {recoveryEmail && (
            <div className="text-center text-xs text-gray-600 bg-gray-50 p-2 rounded">
              Código enviado a: <strong>{recoveryEmail}</strong>
            </div>
          )}

          {/* SECCIÓN: Código OTP */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700 text-center">
              Código de recuperación (6 dígitos)
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
                  className={inputCodeClass(index)}
                  disabled={loading}
                  inputMode="numeric"
                  aria-label={`Dígito ${index + 1} del código`}
                />
              ))}
            </div>

            {codeValidating && (
              <p className="text-center text-xs text-blue-600 mt-2">
                ⏳ Validando código...
              </p>
            )}

            {codeStatus === "valid" && !codeValidating && (
              <p className="text-center text-xs text-green-600 mt-2 font-medium">
                ✓ Código válido
              </p>
            )}

            {codeStatus === "invalid" && !codeValidating && (
              <p className="text-center text-xs text-red-500 mt-2 font-medium">
                ✗ Código incorrecto
              </p>
            )}

            {timeLeft > 0 ? (
              <p className="text-center text-xs text-gray-500 mt-2">
                El código expira en: {formatTime(timeLeft)}
              </p>
            ) : (
              <p className="text-center text-xs text-red-500 mt-2 font-medium">
                El código ha expirado
              </p>
            )}
          </div>

          {/* SECCIÓN: Contraseñas */}
          <div className="grid md:grid-cols-2 gap-4 pt-2">

            {/* Nueva Contraseña */}
            <div className="relative">
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputPasswordClass("password")}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={loading}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {touched.password && errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputPasswordClass("confirmPassword")}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={loading}
                aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

          </div>

          {/* Botón Enviar */}
          <button
            type="submit"
            disabled={loading || codeStatus !== "valid"}
            className={`w-full bg-blue-900 text-white py-2.5 rounded-lg transition cursor-pointer text-sm font-medium
              ${loading || codeStatus !== "valid"
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-800"
              }
            `}
          >
            {loading ? "Actualizando..." : "Restablecer Contraseña"}
          </button>

          {/* Reenviar Código */}
          <div className="text-center mt-1">
            {resendTimer > 0 ? (
              <p className="text-xs text-gray-500">
                Reenviar código en {resendTimer}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-xs text-blue-700 hover:underline cursor-pointer disabled:opacity-50"
              >
                Reenviar código
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
}