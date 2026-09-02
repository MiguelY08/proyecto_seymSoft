import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Eye, EyeOff, Loader2, SquarePen } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useAlert } from "../../shared/alerts/useAlert.js";
import { getSession } from "../helpers/authStorage.js";
import { checkEmailAvailability } from "../services/authService.js";
import useBodyScrollLock from "../../shared/hooks/useBodyScrollLock.js";
import {
  normalizeDigits,
  normalizeEmailInput,
  normalizeNameInput,
} from "../validators/authValidators.js";

const ErrorMsg = ({ field, touched, errors }) =>
  touched[field] && errors[field] ? (
    <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
  ) : null;

const buildSanitizedInputValue = (target, input, sanitizer) => {
  const value = String(target.value ?? "");
  const start = target.selectionStart ?? value.length;
  const end = target.selectionEnd ?? value.length;
  return sanitizer(`${value.slice(0, start)}${input}${value.slice(end)}`);
};

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  touched,
  errors,
  disabled,
  required,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
      {!required && (
        <span className="text-xs text-gray-400 font-normal ml-1">
          (opcional)
        </span>
      )}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        disabled={disabled}
        autoComplete="new-password"
        className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 pr-10
          ${
            touched[name] && errors[name]
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      />
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
    <ErrorMsg field={name} touched={touched} errors={errors} />
  </div>
);

function EditProfileForm({ onClose, isModal = false }) {
  const { user, client, updateProfile, clearLocalSession, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith("/admin");
  useBodyScrollLock(isModal || isAdminContext);
  const { showSuccess, showError, showWarning, showInfo } = useAlert();
  const sessionClient = getSession()?.client ?? null;
  const clientData = client ?? sessionClient;
  const currentAddress = clientData?.address ?? "";
  const canEditAddress = clientData?.canEditAddress === true;

  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: currentAddress,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const emailTimeoutRef = useRef(null);

  const validateField = (name, value, currentForm = form) => {
    const v = String(value ?? "").trim();

    switch (name) {
      case "fullName":
        if (!v) return "El nombre es obligatorio.";
        if (v.length < 3) return "El nombre debe tener al menos 3 caracteres.";
        if (!/^[\p{L}\s]+$/u.test(v))
          return "El nombre solo debe contener letras.";
        return "";

      case "email":
        if (!v) return "El correo es obligatorio.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo invalido.";
        return "";

      case "phone":
        if (!v) return "El telefono es obligatorio.";
        if (!/^\d{7,10}$/.test(v.replace(/\D/g, ""))) {
          return "El telefono debe contener entre 7 y 10 digitos numericos.";
        }
        return "";

      case "address":
        if (v && v.length < 5)
          return "La direccion debe tener al menos 5 caracteres.";
        return "";

      case "currentPassword":
        if (currentForm.newPassword && !v) {
          return "Ingresa tu contrasena actual para cambiarla.";
        }
        return "";

      case "newPassword":
        if (v && v.length < 8) {
          return "La contrasena debe tener al menos 8 caracteres.";
        }
        return "";

      case "confirmPassword":
        if (currentForm.newPassword && !v) {
          return "Confirma tu nueva contrasena.";
        }
        if (v && v !== currentForm.newPassword) {
          return "Las contrasenas no coinciden.";
        }
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const hasInvalidPhoneChars = name === "phone" && /\D/.test(String(value));

    if (hasInvalidPhoneChars) {
      setTouched((prev) => ({ ...prev, phone: true }));
      setErrors((prev) => ({
        ...prev,
        phone: "El telefono solo debe contener numeros",
      }));
      return;
    }

    let filtered = value;
    if (name === "phone") {
      filtered = normalizeDigits(value, 10);
    }

    if (name === "email") {
      filtered = normalizeEmailInput(value);
    }

    if (name === "fullName") {
      filtered = normalizeNameInput(value);
    }

    const updatedForm = { ...form, [name]: filtered };
    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "newPassword") {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, filtered, updatedForm),
        confirmPassword: validateField(
          "confirmPassword",
          updatedForm.confirmPassword,
          updatedForm,
        ),
        currentPassword: validateField(
          "currentPassword",
          updatedForm.currentPassword,
          updatedForm,
        ),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]:
          name === "phone" ? "" : validateField(name, filtered, updatedForm),
      }));
    }
  };

  useEffect(() => {
    if (!touched.email) return undefined;

    clearTimeout(emailTimeoutRef.current);
    const email = normalizeEmailInput(form.email);
    const currentEmail = normalizeEmailInput(user?.email ?? "");

    if (!email) {
      setCheckingEmail(false);
      setErrors((prev) => ({ ...prev, email: "El correo es obligatorio." }));
      return undefined;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCheckingEmail(false);
      setErrors((prev) => ({ ...prev, email: "Correo invalido." }));
      return undefined;
    }

    if (email === currentEmail) {
      setCheckingEmail(false);
      setErrors((prev) => ({ ...prev, email: "" }));
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
          email: data?.exists ? "El correo ya esta registrado" : "",
        }));
      } catch {
        if (!cancelled) {
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      } finally {
        if (!cancelled) setCheckingEmail(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(emailTimeoutRef.current);
    };
  }, [form.email, touched.email, user?.email]);

  const handleNumericBeforeInput = (e) => {
    if (!e.data || /^\d+$/.test(e.data)) return;
    e.preventDefault();
    const { name } = e.currentTarget;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: "El telefono solo debe contener numeros",
    }));
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pastedValue = e.clipboardData.getData("text");

    if (/\D/.test(pastedValue)) {
      setTouched((prev) => ({ ...prev, phone: true }));
      setErrors((prev) => ({
        ...prev,
        phone: "El telefono solo debe contener numeros",
      }));
      return;
    }

    const nextPhone = buildSanitizedInputValue(
      e.currentTarget,
      pastedValue,
      (nextValue) => normalizeDigits(nextValue, 10),
    );
    const updatedForm = { ...form, phone: nextPhone };

    setForm(updatedForm);
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
    const updatedForm = { ...form, email: nextEmail };

    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({
      ...prev,
      email: validateField("email", nextEmail, updatedForm),
    }));
  };

  const isDirty =
    form.fullName !== (user?.fullName ?? "") ||
    form.email !== (user?.email ?? "") ||
    form.phone !== (user?.phone ?? "") ||
    (canEditAddress && form.address !== currentAddress) ||
    form.newPassword.trim() !== "";

  const handleCancel = () => {
    if (!isDirty) {
      // Si es modal, cierra el modal
      if (isModal || isAdminContext) {
        onClose?.();
      } else {
        // Si es pagina, navega atras
        navigate(-1);
      }
      return;
    }

    showWarning("Cambios sin guardar", "Los cambios seran descartados");
    setTimeout(() => {
      if (isModal || isAdminContext) {
        onClose?.();
      } else {
        navigate(-1);
      }
    }, 1500);
  };

  const showUnchangedFieldAlerts = (
    unchangedFields = {},
    userTouchedFields = {},
  ) => {
    Object.entries(unchangedFields).forEach(([field, message]) => {
      const aliases = {
        full_name: "fullName",
        fullName: "fullName",
        email: "email",
        phone: "phone",
        address: "address",
      };
      const formField = aliases[field] || field;

      if (message && userTouchedFields[formField]) {
        showInfo("Sin cambios", message);
      }
    });
  };

  const handleSubmit = async () => {
    const userTouchedFields = { ...touched };

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      ...(canEditAddress ? ["address"] : []),
    ];

    const allFields = [
      ...requiredFields,
      "currentPassword",
      "newPassword",
      "confirmPassword",
    ];

    setTouched(
      allFields.reduce(
        (acc, key) => ({
          ...acc,
          [key]: true,
        }),
        {},
      ),
    );

    const newErrors = {};

    allFields.forEach((field) => {
      const error = validateField(field, form[field], form);

      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      showWarning("Campos con error", "Revisa la informacion");

      return;
    }

    if (checkingEmail) {
      showWarning(
        "Validando datos",
        "Espera a que termine la validacion de correo",
      );

      return;
    }

    if (errors.email || errors.phone) {
      showWarning("Campos con error", "Revisa la informacion");

      return;
    }

    try {
      const normalizedEmail = normalizeEmailInput(form.email);
      const normalizedPhone = normalizeDigits(form.phone, 10);
      const currentEmail = normalizeEmailInput(user?.email ?? "");
      const currentPhone = normalizeDigits(user?.phone ?? "", 10);

      setForm((prev) => ({
        ...prev,
        email: normalizedEmail,
        phone: normalizedPhone,
      }));

      if (normalizedEmail !== currentEmail) {
        const emailCheck = await checkEmailAvailability(normalizedEmail);

        if (emailCheck?.exists) {
          setErrors((prev) => ({
            ...prev,
            email: "El correo ya esta registrado",
          }));
          setTouched((prev) => ({ ...prev, email: true }));
          showWarning("Correo registrado", "El correo ya esta registrado");
          return;
        }
      }

      const profileChanged =
        form.fullName.trim() !== (user?.fullName ?? "") ||
        normalizedEmail !== currentEmail ||
        normalizedPhone !== currentPhone ||
        (canEditAddress && form.address.trim() !== currentAddress);

      const passwordChanged = form.newPassword.trim() !== "";

      if (!profileChanged && !passwordChanged) {
        showInfo(
          "Sin cambios",
          "Los datos enviados son iguales a los datos actuales",
        );

        return;
      }

      const profileChanges = {
        fullName: form.fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
      };

      if (canEditAddress) {
        profileChanges.address = form.address.trim();
      }

      if (passwordChanged) {
        profileChanges.currentPassword = form.currentPassword.trim();
        profileChanges.newPassword = form.newPassword.trim();
        profileChanges.confirmPassword = form.confirmPassword.trim();
      }

      // =====================================
      // ACTUALIZAR PERFIL
      // =====================================

      if (profileChanged || passwordChanged) {
        const profileResult = await updateProfile(profileChanges);

        if (!profileResult.success) {
          if (
            profileResult.status === 400 &&
            /iguales|igual/i.test(profileResult.error || "")
          ) {
            showInfo("Sin cambios", profileResult.error);

            return;
          }

          showError("Error", profileResult.error);

          return;
        }

        showUnchangedFieldAlerts(
          profileResult.unchangedFields,
          userTouchedFields,
        );

        if (profileResult.requiresReLogin) {
          showSuccess(
            "Perfil actualizado",
            "Por seguridad, inicia sesion nuevamente.",
          );

          clearLocalSession?.();

          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 1500);

          return;
        }

        setForm({
          fullName: profileResult.user?.fullName ?? form.fullName,
          email: profileResult.user?.email ?? form.email,
          phone: profileResult.user?.phone ?? form.phone,
          address: profileResult.client?.address ?? "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        showSuccess(
          passwordChanged ? "Contrasena actualizada" : "Perfil actualizado",
          "Los cambios se guardaron correctamente",
        );

        setTimeout(() => {
          if (isModal || isAdminContext) {
            onClose?.();
          } else {
            navigate(-1);
          }
        }, 1500);

        return;
      }

      // =====================================
      // CAMBIO DE CONTRASENA
      // =====================================

      if (passwordChanged) {
        const passwordResult = await updateProfile({
          currentPassword: form.currentPassword.trim(),

          newPassword: form.newPassword.trim(),

          confirmPassword: form.confirmPassword.trim(),
        });

        if (!passwordResult.success) {
          if (
            passwordResult.status === 400 &&
            /iguales|igual/i.test(passwordResult.error || "")
          ) {
            showInfo("Sin cambios", passwordResult.error);

            return;
          }

          showError("Error", passwordResult.error);

          return;
        }

        showUnchangedFieldAlerts(
          passwordResult.unchangedFields,
          userTouchedFields,
        );

        if (passwordResult.requiresReLogin) {
          showSuccess(
            "Perfil actualizado",
            "Por seguridad, inicia sesion nuevamente.",
          );

          clearLocalSession?.();

          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 1500);

          return;
        }

        showSuccess(
          "Contrasena actualizada",
          "Los cambios se guardaron correctamente",
        );

        setTimeout(() => {
          if (isModal || isAdminContext) {
            onClose?.();
          } else {
            navigate(-1);
          }
        }, 1500);

        return;
      }

      // =====================================
      // SOLO PERFIL
      // =====================================

      if (profileChanged) {
        showSuccess(
          "Perfil actualizado",
          "Los cambios se guardaron correctamente",
        );

        setTimeout(() => {
          if (isModal || isAdminContext) {
            onClose?.();
          } else {
            navigate(-1);
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Error handleSubmit:", error);

      showError("Error", "Ocurrio un error inesperado");
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200
    ${
      touched[field] && errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
    }`;

  const hasBlockingErrors = Boolean(errors.email || errors.phone);

  const formContent = (
    <>
      <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
              <SquarePen className="h-5 w-5 text-white" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                Editar mi perfil
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            aria-label="Cerrar edición de perfil"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Juan Perez Garcia"
              className={inputClass("fullName")}
              disabled={loading}
            />
            <ErrorMsg field="fullName" touched={touched} errors={errors} />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Correo Electronico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBeforeInput={handleEmailBeforeInput}
              onPaste={handleEmailPaste}
              placeholder="ejemplo@mail.com"
              className={inputClass("email")}
              disabled={loading}
              autoComplete="email"
            />
            <ErrorMsg field="email" touched={touched} errors={errors} />
            {checkingEmail && touched.email && !errors.email && (
              <p className="mt-1 text-xs text-[#004D77]">
                Verificando correo...
              </p>
            )}
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Telefono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBeforeInput={handleNumericBeforeInput}
              onPaste={handlePhonePaste}
              placeholder="3001234567"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              className={inputClass("phone")}
              disabled={loading}
            />
            <ErrorMsg field="phone" touched={touched} errors={errors} />
          </div>

          {canEditAddress && (
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Direccion
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Nueva direccion"
                maxLength={255}
                className={inputClass("address")}
                disabled={loading}
              />
              <ErrorMsg field="address" touched={touched} errors={errors} />
            </div>
          )}

          <div className="sm:col-span-2 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Cambio de contrasena (opcional)
            </p>
          </div>

          <div className="sm:col-span-2">
            <PasswordField
              label="Contrasena Actual"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              touched={touched}
              errors={errors}
              disabled={loading}
              required={!!form.newPassword}
            />
          </div>

          <div className="sm:col-span-2">
            <PasswordField
              label="Nueva Contrasena"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              touched={touched}
              errors={errors}
              disabled={loading}
              required={false}
            />
          </div>

          <div className="sm:col-span-2">
            <PasswordField
              label="Confirmar Contrasena"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              touched={touched}
              errors={errors}
              disabled={loading}
              required={!!form.newPassword}
            />
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          Cerrar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || checkingEmail || hasBlockingErrors}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto ${
            loading || checkingEmail || hasBlockingErrors
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:bg-[#003b5c] hover:shadow-md"
          }`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && <SquarePen className="h-4 w-4" strokeWidth={1.8} />}
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </footer>
    </>
  );

  // Renderiza como modal si isModal=true O si esta en ruta /admin
  const shouldRenderAsModal = isModal || isAdminContext;

  if (shouldRenderAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm">
        <div className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-lg md:max-w-lg">
          {formContent}
        </div>
      </div>
    );
  }

  // Renderiza como pagina completa
  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-6">
      {formContent}
    </div>
  );
}

export default EditProfileForm;
