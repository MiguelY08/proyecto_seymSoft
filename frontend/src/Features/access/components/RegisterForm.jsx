import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import {
  normalizeEmailInput,
  normalizeDigits,
  sanitizeInput,
  toTitleCaseName,
  validateRegister,
} from "../validators/authValidators.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useAlert } from "../../shared/alerts/useAlert.js";
import { checkEmailAvailability, validatePhone } from "../services/authService.js";

const Label = ({ text, htmlFor }) => (
  <label htmlFor={htmlFor} className="flex items-center gap-1 mb-1 text-sm font-medium text-gray-700">
    {text}
    <span className="text-red-500">*</span>
  </label>
);

const buildSanitizedInputValue = (target, input, sanitizer) => {
  const value = String(target.value ?? "");
  const start = target.selectionStart ?? value.length;
  const end = target.selectionEnd ?? value.length;
  return sanitizer(`${value.slice(0, start)}${input}${value.slice(end)}`);
};

const getPhoneValidationError = (data) => {
  if (!data?.valid) {
    return "El teléfono debe contener entre 7 y 10 dígitos numéricos.";
  }

  if (data?.exists === true || data?.available === false) {
    return "El teléfono ya está registrado";
  }

  return null;
};

export default function RegisterForm() {

  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useAlert();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    const hasInvalidPhoneChars = name === "phone" && /\D/.test(String(newValue));

    if (hasInvalidPhoneChars) {
      setTouched((prev) => ({ ...prev, phone: true }));
      setErrors((prev) => ({ ...prev, phone: "El teléfono solo debe contener números" }));
      return;
    }

    newValue = sanitizeInput(name, newValue);
    
    const updatedForm = { ...formData, [name]: newValue };
    setFormData(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));

    const validationErrors = validateRegister(updatedForm);
    setErrors((prev) => ({
      ...prev,
      [name]: name === "phone" ? "" : validationErrors[name],
    }));
  };

  useEffect(() => {
    if (!touched.email) return undefined;

    clearTimeout(emailTimeoutRef.current);
    const email = normalizeEmailInput(formData.email);

    if (!email) {
      setCheckingEmail(false);
      setErrors((prev) => ({ ...prev, email: "El correo es obligatorio" }));
      return undefined;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCheckingEmail(false);
      setErrors((prev) => ({ ...prev, email: "Ingresa un correo válido" }));
      return undefined;
    }

    setCheckingEmail(true);
    let cancelled = false;

    emailTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await checkEmailAvailability(email);
        if (cancelled) return;

        setErrors((prev) => ({
          ...prev,
          email: data?.exists ? "El correo ya está registrado" : null,
        }));
      } catch {
        if (!cancelled) {
          setErrors((prev) => ({ ...prev, email: null }));
        }
      } finally {
        if (!cancelled) setCheckingEmail(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(emailTimeoutRef.current);
    };
  }, [formData.email, touched.email]);

  const handleNumericBeforeInput = (e) => {
    if (!e.data || /^\d+$/.test(e.data)) return;
    e.preventDefault();
    const { name } = e.currentTarget;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: "El teléfono solo debe contener números" }));
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pastedValue = e.clipboardData.getData("text");

    if (/\D/.test(pastedValue)) {
      setTouched((prev) => ({ ...prev, phone: true }));
      setErrors((prev) => ({ ...prev, phone: "El teléfono solo debe contener números" }));
      return;
    }

    const nextPhone = buildSanitizedInputValue(
      e.currentTarget,
      pastedValue,
      (value) => normalizeDigits(value, 10),
    );
    const updatedForm = { ...formData, phone: nextPhone };

    setFormData(updatedForm);
    setTouched((prev) => ({ ...prev, phone: true }));
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleEmailBeforeInput = (e) => {
    if (!e.data || !/\s/.test(e.data)) return;
    e.preventDefault();
    const { name } = e.currentTarget;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: "El correo no debe contener espacios." }));
  };

  const handleEmailPaste = (e) => {
    e.preventDefault();
    const nextEmail = buildSanitizedInputValue(
      e.currentTarget,
      e.clipboardData.getData("text"),
      normalizeEmailInput,
    );
    const updatedForm = { ...formData, email: nextEmail };
    const validationErrors = validateRegister(updatedForm);

    setFormData(updatedForm);
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validationErrors.email }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (name !== "fullName") return;

    const formattedName = toTitleCaseName(formData.fullName);
    const updatedForm = { ...formData, fullName: formattedName };
    const validationErrors = validateRegister(updatedForm);

    setFormData(updatedForm);
    setTouched((prev) => ({ ...prev, fullName: true }));
    setErrors((prev) => ({ ...prev, fullName: validationErrors.fullName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedForm = {
      ...formData,
      fullName: toTitleCaseName(formData.fullName),
      email: normalizeEmailInput(formData.email),
      phone: normalizeDigits(formData.phone, 10),
    };

    setFormData(normalizedForm);

    // Marcar todos como tocados
    const allFields = ["fullName", "email", "phone", "password", "confirmPassword", "terms"];
    setTouched(allFields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    // Validar formulario completo
    const validationErrors = validateRegister(normalizedForm);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showWarning("Campos incompletos", "Por favor revisa los campos marcados");
      return;
    }

    const emailCheck = await checkEmailAvailability(normalizedForm.email);
    if (emailCheck?.exists) {
      setErrors((prev) => ({ ...prev, email: "El correo ya está registrado" }));
      setTouched((prev) => ({ ...prev, email: true }));
      showWarning("Correo registrado", "El correo ya está registrado");
      return;
    }

    const phoneValidation = await validatePhone(normalizedForm.phone, "client");
    const phoneValidationError = getPhoneValidationError(phoneValidation);
    if (phoneValidationError) {
      setErrors((prev) => ({ ...prev, phone: phoneValidationError }));
      setTouched((prev) => ({ ...prev, phone: true }));
      showWarning("Teléfono inválido", phoneValidationError);
      return;
    }

    try {
      // Llamar register con objeto correcto
      const result = await register({
        fullName: normalizedForm.fullName,
        email: normalizedForm.email,
        password: formData.password,
        phone: parseInt(normalizedForm.phone, 10)
      });

      if (result.success) {
        showSuccess("¡Bienvenido!", "Cuenta creada exitosamente");
        navigate(result.redirectTo);
      } else {
        setErrors({ general: result.error });
        showError("Error en registro", result.error);
      }

    } catch (error) {
      console.error("Error en handleSubmit:", error);
      showError("Error inesperado", "No pudimos procesar tu registro. Intenta de nuevo.");
      setErrors({ general: "Error inesperado" });
    }
  };

  const inputStyle = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors
    ${touched[field] && errors[field]
      ? "border-red-500 focus:ring-2 focus:ring-red-200"
      : "border-gray-300 focus:ring-2 focus:ring-blue-600"
    }`;

  const hasBlockingErrors = Boolean(errors.email || errors.phone);

  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      <div className="bg-[#004D77] py-4">
        <h2 className="font-lexend text-xl md:text-2xl font-semibold text-white text-center">
          Crear Cuenta
        </h2>
      </div>

      <div className="p-5 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Nombre Completo */}
          <div>
            <Label text="Nombre Completo" htmlFor="fullName" />
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Juan Pérez García"
              className={inputStyle("fullName")}
              disabled={loading}
              autoComplete="name"
            />
            {touched.fullName && errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label text="Correo Electrónico" htmlFor="email" />
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBeforeInput={handleEmailBeforeInput}
              onPaste={handleEmailPaste}
              placeholder="ejemplo@mail.com"
              className={inputStyle("email")}
              disabled={loading}
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
            {checkingEmail && touched.email && !errors.email && (
              <p className="text-[#004D77] text-xs mt-1">Verificando correo...</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <Label text="Teléfono" htmlFor="phone" />
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBeforeInput={handleNumericBeforeInput}
              onPaste={handlePhonePaste}
              placeholder="3001234567"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              className={inputStyle("phone")}
              disabled={loading}
              autoComplete="tel"
            />
            {touched.phone && errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Label text="Contraseña" htmlFor="password" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className={inputStyle("password")}
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
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="relative">
            <Label text="Confirmar Contraseña" htmlFor="confirmPassword" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              className={inputStyle("confirmPassword")}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={loading}
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Términos
          <div className="flex items-center gap-2">
            <input
              id="terms"
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              Aceptar términos y condiciones
            </label>
          </div> */}

          {/* {touched.terms && errors.terms && (
            <p className="text-red-500 text-xs">{errors.terms}</p>
          )} */}

          {errors.general && (
            <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">
              {errors.general}
            </p>
          )}

          {/* Botones */}
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="submit"
              disabled={loading || checkingEmail || hasBlockingErrors}
              className={`w-full bg-[#004D77] text-white py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                ${loading || checkingEmail || hasBlockingErrors
                  ? "opacity-70 cursor-not-allowed" 
                  : "hover:bg-[#003D5e]"
                }
              `}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={loading}
              className={`w-full bg-gray-500 text-white py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                ${loading 
                  ? "opacity-70 cursor-not-allowed" 
                  : "hover:bg-gray-600"
                }
              `}
            >
              Cancelar
            </button>
          </div>

          <div className="text-center text-xs mt-3">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-blue-700 font-medium hover:underline"
              onClick={(e) => loading && e.preventDefault()}
            >
              Inicia sesión
            </Link>
          </div>

        </form>
      </div>

    </div>
  );
}
