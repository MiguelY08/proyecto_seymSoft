import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import {
  normalizeEmailInput,
  normalizeDigits,
  isRegisterEmailValid,
  sanitizeInput,
  toTitleCaseName,
  validateRegister,
} from "../validators/authValidators.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useAlert } from "../../shared/alerts/useAlert.js";
import { checkEmailAvailability } from "../services/authService.js";

const Label = ({ text, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="flex items-center gap-1 mb-0.5 text-xs font-medium text-gray-700"
  >
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

export default function RegisterForm({ embedded = false, onSwitchToLogin }) {
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
    const hasInvalidPhoneChars =
      name === "phone" && /\D/.test(String(newValue));

    if (hasInvalidPhoneChars) {
      setTouched((prev) => ({ ...prev, phone: true }));
      setErrors((prev) => ({
        ...prev,
        phone: "El teléfono solo debe contener números",
      }));
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

    if (!isRegisterEmailValid(email)) {
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
    setErrors((prev) => ({
      ...prev,
      [name]: "El teléfono solo debe contener números",
    }));
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pastedValue = e.clipboardData.getData("text");

    if (/\D/.test(pastedValue)) {
      setTouched((prev) => ({ ...prev, phone: true }));
      setErrors((prev) => ({
        ...prev,
        phone: "El teléfono solo debe contener números",
      }));
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
    setErrors((prev) => ({
      ...prev,
      [name]: "El correo no debe contener espacios.",
    }));
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
    const allFields = [
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "terms",
    ];
    setTouched(allFields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    // Validar formulario completo
    const validationErrors = validateRegister(normalizedForm);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showWarning("Campos incompletos", "Por favor revisa los campos marcados");
      return;
    }

    try {
      const emailCheck = await checkEmailAvailability(normalizedForm.email);
      if (emailCheck?.exists) {
        setErrors((prev) => ({ ...prev, email: "El correo ya está registrado" }));
        setTouched((prev) => ({ ...prev, email: true }));
        showWarning("Correo registrado", "El correo ya está registrado");
        return;
      }
    } catch (error) {
      console.error("Error al verificar correo:", error);
      showWarning("Correo no verificado", "No pudimos verificar el correo. Intenta de nuevo.");
      return;
    }

    try {
      // Llamar register con objeto correcto
      const result = await register({
        fullName: normalizedForm.fullName,
        email: normalizedForm.email,
        password: formData.password,
        phone: parseInt(normalizedForm.phone, 10),
        termsAccepted: normalizedForm.terms,
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
      showError(
        "Error inesperado",
        "No pudimos procesar tu registro. Intenta de nuevo.",
      );
      setErrors({ general: "Error inesperado" });
    }
  };

  const inputStyle = (field) =>
    `w-full border rounded-lg px-3 py-1.5 text-sm outline-none transition-colors
    ${
      touched[field] && errors[field]
        ? "border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:ring-2 focus:ring-blue-600"
    }`;

  const hasBlockingErrors = Boolean(errors.email || errors.phone);
  const errorTextClass = embedded
    ? "absolute left-0 top-full mt-0.5 max-w-full truncate text-[10px] leading-none text-red-500"
    : "text-red-500 text-xs mt-1";
  const emailStatusClass = embedded
    ? "absolute left-0 top-full mt-0.5 text-[10px] leading-none text-[#004D77]"
    : "text-[#004D77] text-xs mt-1";

  const handleBackToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
      return;
    }

    navigate("/login");
  };

  return (
    <div
      className={
        embedded
          ? "w-full bg-white md:flex md:h-full md:flex-col"
          : "max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      }
    >
      <div className={embedded ? "px-4 pt-3 md:px-5 md:pt-4" : "bg-[#004D77] py-4"}>
        <h2
          className={
            embedded
              ? "font-lexend text-base font-semibold text-gray-800 text-center"
              : "font-lexend text-xl md:text-2xl font-semibold text-white text-center"
          }
        >
          Crear Cuenta
        </h2>
        {embedded && (
          <p className="text-center text-xs text-gray-600">
            Únete a Papelería Magic y continúa con tus compras.
          </p>
        )}
      </div>

      <div className={embedded ? "px-4 pb-4 pt-3 md:flex md:flex-1 md:flex-col md:px-5 md:pb-4 md:pt-3" : "p-5 md:p-8"}>
        <form onSubmit={handleSubmit} className={embedded ? "flex flex-col gap-3.5 md:flex-1" : "flex flex-col gap-5"}>
          {/* Nombre Completo */}
          <div className="relative">
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
              <p className={errorTextClass}>{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
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
              <p className={errorTextClass}>{errors.email}</p>
            )}
            {checkingEmail && touched.email && !errors.email && (
              <p className={emailStatusClass}>
                Verificando correo...
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div className="relative">
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
              <p className={errorTextClass}>{errors.phone}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Label text="Contraseña" htmlFor="password" />
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className={`${inputStyle("password")} pr-10`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={loading}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className={errorTextClass}>{errors.password}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="relative">
            <Label text="Confirmar Contraseña" htmlFor="confirmPassword" />
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                className={`${inputStyle("confirmPassword")} pr-10`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className={errorTextClass}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Términos */}
          <div className="relative">
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 h-3 w-3 rounded border-gray-300 text-[#004D77] focus:ring-2 focus:ring-[#004D77] disabled:opacity-60"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                Acepto los{" "}
                <a
                  href="/Terminos_y_Condiciones_Papeleria_Magic.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  términos y condiciones
                </a>
              </label>
            </div>

            {touched.terms && errors.terms && (
              <p className={errorTextClass}>{errors.terms}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">
              {errors.general}
            </p>
          )}

          {/* Botones */}
          <div className={embedded ? "flex flex-col gap-2 mt-1" : "flex flex-col gap-3 mt-4"}>
            <button
              type="submit"
              disabled={loading || checkingEmail || hasBlockingErrors}
              className={`w-full rounded-full bg-[#004D77] px-6 ${embedded ? "py-2" : "py-2.5"} text-sm font-bold text-white shadow-sm transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2
                ${
                  loading || checkingEmail || hasBlockingErrors
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#003b5c] hover:shadow-md"
                }
              `}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              disabled={loading}
              className={`w-full rounded-full border border-[#004D77] bg-white px-6 ${embedded ? "py-2" : "py-2.5"} text-sm font-bold text-[#004D77] shadow-sm transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2
                ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-sky-100 hover:shadow-md"
                }
              `}
            >
              Cancelar
            </button>
          </div>

          <div className={embedded ? "text-center text-xs mt-0.5 mb-0" : "text-center text-xs mt-3"}>
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-blue-700 font-medium hover:underline"
              onClick={(e) => {
                if (loading) {
                  e.preventDefault();
                  return;
                }

                if (onSwitchToLogin) {
                  e.preventDefault();
                  onSwitchToLogin();
                }
              }}
            >
              Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
