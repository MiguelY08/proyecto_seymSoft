import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useAlert } from "../../shared/alerts/useAlert.js";
import { changePassword } from "../services/authService.js";

const ErrorMsg = ({ field, touched, errors }) =>
  touched[field] && errors[field]
    ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
    : null;

const PasswordField = ({ label, name, value, onChange, show, onToggle, touched, errors, disabled, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
      {!required && <span className="text-xs text-gray-400 font-normal ml-1">(opcional)</span>}
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
          ${touched[name] && errors[name]
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
  const { user, updateProfile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith("/admin");
  const { showSuccess, showError, showWarning, showInfo } = useAlert();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateField = (name, value, currentForm = form) => {
    const v = value.trim();

    switch (name) {
      case "fullName":
        if (!v) return "El nombre es obligatorio.";
        if (v.length < 3) return "El nombre debe tener al menos 3 caracteres.";
        return "";

      case "email":
        if (!v) return "El correo es obligatorio.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo inválido.";
        return "";

      case "phone":
        if (!v) return "El teléfono es obligatorio.";
        if (!/^\d{10}$/.test(v.replace(/\D/g, ""))) {
          return "Teléfono inválido (10 dígitos).";
        }
        return "";

      case "currentPassword":
        if (currentForm.newPassword && !v) {
          return "Ingresa tu contraseña actual para cambiarla.";
        }
        return "";

      case "newPassword":
        if (v && v.length < 8) {
          return "La contraseña debe tener al menos 8 caracteres.";
        }
        return "";

      case "confirmPassword":
        if (currentForm.newPassword && !v) {
          return "Confirma tu nueva contraseña.";
        }
        if (v && v !== currentForm.newPassword) {
          return "Las contraseñas no coinciden.";
        }
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let filtered = value;
    if (name === "phone") {
      filtered = value.replace(/\D/g, "");
    }

    const updatedForm = { ...form, [name]: filtered };
    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "newPassword") {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, filtered, updatedForm),
        confirmPassword: validateField("confirmPassword", updatedForm.confirmPassword, updatedForm),
        currentPassword: validateField("currentPassword", updatedForm.currentPassword, updatedForm),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, filtered, updatedForm),
      }));
    }
  };

  const isDirty =
    form.fullName !== (user?.fullName ?? "") ||
    form.email !== (user?.email ?? "") ||
    form.phone !== (user?.phone ?? "") ||
    form.newPassword.trim() !== "";

  const handleCancel = () => {
    if (!isDirty) {
      // Si es modal, cierra el modal
      if (isModal || isAdminContext) {
        onClose?.();
      } else {
        // Si es página, navega atrás
        navigate(-1);
      }
      return;
    }

    showWarning("Cambios sin guardar", "Los cambios serán descartados");
    setTimeout(() => {
      if (isModal || isAdminContext) {
        onClose?.();
      } else {
        navigate(-1);
      }
    }, 1500);
  };

const handleSubmit = async () => {

  const requiredFields = [
    "fullName",
    "email",
    "phone",
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
      {}
    )
  );

  const newErrors = {};

  allFields.forEach((field) => {

    const error = validateField(
      field,
      form[field],
      form
    );

    if (error) {
      newErrors[field] = error;
    }

  });

  if (
    Object.keys(newErrors).length > 0
  ) {

    setErrors(newErrors);

    showWarning(
      "Campos con error",
      "Revisa la información"
    );

    return;
  }

  try {

    const profileChanged =

      form.fullName.trim() !== (user?.fullName ?? "")

      ||

      form.email.trim() !== (user?.email ?? "")

      ||

      form.phone.trim() !== (user?.phone ?? "");

    const passwordChanged =
      form.newPassword.trim() !== "";

    // =====================================
    // ACTUALIZAR PERFIL
    // =====================================

    if (profileChanged) {

      const profileResult =
        await updateProfile({

          fullName:
            form.fullName.trim(),

          email:
            form.email.trim(),

          phone:
            form.phone.trim(),

        });

      if (!profileResult.success) {

        showError(
          "Error",
          profileResult.error
        );

        return;
      }
    }

    // =====================================
    // CAMBIO DE CONTRASEÑA
    // =====================================

    if (passwordChanged) {

      const passwordResult =
        await changePassword({

          currentPassword:
            form.currentPassword.trim(),

          newPassword:
            form.newPassword.trim(),

        });

      if (!passwordResult.success) {

        showError(
          "Error",
          passwordResult.error
        );

        return;
      }

      showSuccess(
        "Contraseña actualizada",
        "Debes iniciar sesión nuevamente"
      );

      setTimeout(
        async () => {

          await logout();

          navigate("/login");

        },
        2000
      );

      return;
    }

    // =====================================
    // SOLO PERFIL
    // =====================================

    if (profileChanged) {

      showSuccess(
        "Perfil actualizado",
        "Los cambios se guardaron correctamente"
      );

      setTimeout(
        () => {

          if (
            isModal ||
            isAdminContext
          ) {

            onClose?.();

          } else {

            navigate(-1);

          }

        },
        1500
      );
    }

  } catch (error) {

    console.error(
      "Error handleSubmit:",
      error
    );

    showError(
      "Error",
      "Ocurrió un error inesperado"
    );
  }
};

  const inputClass = (field) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200
    ${touched[field] && errors[field]
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
    }`;

  const formContent = (
    <>
      <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
        <h2 className="text-white font-semibold text-lg">Editar Mi Perfil</h2>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      <div className="px-6 py-5 overflow-y-auto">
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
              placeholder="Juan Pérez García"
              className={inputClass("fullName")}
              disabled={loading}
            />
            <ErrorMsg field="fullName" touched={touched} errors={errors} />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ejemplo@mail.com"
              className={inputClass("email")}
              disabled={loading}
              autoComplete="email"
            />
            <ErrorMsg field="email" touched={touched} errors={errors} />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="3001234567"
              maxLength={10}
              className={inputClass("phone")}
              disabled={loading}
            />
            <ErrorMsg field="phone" touched={touched} errors={errors} />
          </div>

          <div className="sm:col-span-2 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Cambio de contraseña (opcional)
            </p>
          </div>

          <div className="sm:col-span-2">
            <PasswordField
              label="Contraseña Actual"
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
              label="Nueva Contraseña"
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
              label="Confirmar Contraseña"
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

      <div className="border-t border-gray-200 px-6 py-4 flex items-center gap-3 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`flex-1 py-2.5 text-sm font-medium text-white bg-[#004D77] rounded-lg transition-colors cursor-pointer
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#003A5C]"}
          `}
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className={`flex-1 py-2.5 text-sm font-medium text-white bg-gray-500 rounded-lg transition-colors cursor-pointer
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-600"}
          `}
        >
          Cancelar
        </button>
      </div>
    </>
  );

  // ✅ Renderiza como modal si isModal=true O si está en ruta /admin
  const shouldRenderAsModal = isModal || isAdminContext;

  if (shouldRenderAsModal) {
    return (
      <div
        onClick={handleCancel}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {formContent}
        </div>
      </div>
    );
  }

  // Renderiza como página completa
  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-6">
      {formContent}
    </div>
  );
}

export default EditProfileForm;