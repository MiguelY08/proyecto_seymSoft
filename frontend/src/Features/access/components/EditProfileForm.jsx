import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../access/context/AuthContext";
import { useAlert } from "../../shared/alerts/useAlert";
import { updateProfile } from "../services/authService";
import { patterns } from "../validators/authValidators";
import { emailExists } from "../services/authService";

// ── Componentes fuera del componente principal ───────────────────────────────

const ErrorMsg = ({ field, touched, errors }) =>
  touched[field] && errors[field]
    ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
    : null;

const ReadOnlyField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed select-none">
      {value ?? "—"}
    </div>
  </div>
);

const PasswordField = ({ label, name, form, show, onToggle, inputClass, handleChange, errors, touched }) => (
  <div className="flex flex-col gap-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {name === "currentPassword" && form.newPassword && (
        <span className="text-red-500">*</span>
      )}
      {name === "newPassword" && (
        <span className="text-xs text-gray-400 font-normal ml-1">(opcional)</span>
      )}
      {name === "confirmPassword" && form.newPassword && (
        <span className="text-red-500">*</span>
      )}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder="xxxxxxxxxxxx"
        autoComplete="new-password"
        className={`${inputClass(name)} pr-10`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={16}/> : <Eye size={16}/>}
      </button>
    </div>
    {touched[name] && errors[name] && (
      <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
    )}
  </div>
);

// ── Componente principal ─────────────────────────────────────────────────────

function EditProfileForm({ onClose }) {
  const { user, setUser, logout }                            = useAuth();
  const { showSuccess, showWarning, showConfirm, showError } = useAlert();
  const navigate                                             = useNavigate();
  const location                                             = useLocation();

  const isAdminContext = location.pathname.startsWith("/admin");

  const [form, setForm] = useState({
    documentType:    user?.documentType ?? "",
    document:        user?.document     ?? "",
    name:            user?.name         ?? "",
    email:           user?.email        ?? "",
    phone:           user?.phone        ?? "",
    address:         user?.address      ?? "",
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  const [errors,         setErrors]         = useState({});
  const [touched,        setTouched]        = useState({});
  const [showCurrent,    setShowCurrent]    = useState(false);
  const [showNew,        setShowNew]        = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // ── Validación por campo ─────────────────────────────────────────────────
  const validateField = (name, value, currentForm = form) => {
    const v = value.trim();

    switch (name) {

      case "documentType":
        if (!v) return "Seleccione tipo de documento.";
        return "";

      case "document":
        if (!v)                         return "El documento es obligatorio.";
        if (!patterns.document.test(v)) return "Documento inválido (6-12 números).";
        return "";

      case "name":
        if (!v)                         return "El nombre es obligatorio.";
        if (!patterns.fullName.test(v)) return "Solo letras y espacios (3-50 caracteres).";
        return "";

      case "email":
        if (!v)                         return "El correo es obligatorio.";
        if (!patterns.email.test(v))    return "Correo inválido.";
        if (
          v.toLowerCase() !== user?.email?.toLowerCase() &&
          emailExists(v)
        )                               return "Este correo ya está registrado.";
        return "";

      case "phone":
        if (!v)                         return "El teléfono es obligatorio.";
        if (!patterns.phone.test(v))    return "Teléfono inválido (10 números).";
        return "";

      case "address":
        if (!v)                         return "La dirección es obligatoria.";
        return "";

      case "currentPassword":
        if (currentForm.newPassword && !v) return "Ingresa tu contraseña actual para cambiarla.";
        if (v && v !== user?.password)     return "La contraseña actual no es correcta.";
        return "";

      case "newPassword":
        if (v && !patterns.password.test(v)) return "Mínimo 8 caracteres.";
        return "";

      case "confirmPassword":
        if (currentForm.newPassword && !v)      return "Confirma tu nueva contraseña.";
        if (v && v !== currentForm.newPassword) return "Las contraseñas no coinciden.";
        return "";

      default:
        return "";
    }
  };

  // ── handleChange ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    let filtered = value;
    if (name === "phone" || name === "document") {
      filtered = value.replace(/\D/g, "");
    }

    const updatedForm = { ...form, [name]: filtered };
    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "newPassword") {
      setErrors((prev) => ({
        ...prev,
        [name]:          validateField(name, filtered, updatedForm),
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

  // ── isDirty ──────────────────────────────────────────────────────────────
  const isDirty =
    form.documentType    !== (user?.documentType ?? "") ||
    form.document        !== (user?.document     ?? "") ||
    form.name            !== (user?.name         ?? "") ||
    form.email           !== (user?.email        ?? "") ||
    form.phone           !== (user?.phone        ?? "") ||
    form.address         !== (user?.address      ?? "") ||
    form.newPassword.trim() !== "";

  // ── Cancelar ─────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!isDirty) {
      isAdminContext ? onClose?.() : navigate(-1);
      return;
    }
    const result = await showConfirm(
      "warning",
      "¿Salir sin guardar?",
      "Tienes cambios sin guardar. ¿Deseas salir de todas formas?",
      { confirmButtonText: "Sí, salir", cancelButtonText: "Seguir editando" }
    );
    if (result?.isConfirmed) {
      isAdminContext ? onClose?.() : navigate(-1);
    }
  };

  // ── Guardar ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {

    const fields = [
      "documentType", "document", "name", "email",
      "phone", "address", "currentPassword", "newPassword", "confirmPassword"
    ];

    setTouched(fields.reduce((acc, k) => ({ ...acc, [k]: true }), {}));

    const newErrors = {};
    fields.forEach((f) => {
      const e = validateField(f, form[f], form);
      if (e) newErrors[f] = e;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning("Formulario incompleto", "Revisa los campos marcados en rojo.");
      return;
    }

    const result = await showConfirm(
      "info",
      "¿Guardar cambios?",
      "Se actualizarán tus datos de perfil.",
      { confirmButtonText: "Sí, guardar", cancelButtonText: "Cancelar" }
    );

    if (!result?.isConfirmed) return;

    const changes = {
      documentType: form.documentType.trim(),
      document:     form.document.trim(),
      name:         form.name.trim(),
      email:        form.email.trim().toLowerCase(),
      phone:        form.phone.trim(),
      address:      form.address.trim(),
    };

    const isChangingPassword = form.newPassword.trim() !== "";
    if (isChangingPassword) {
      changes.password = form.newPassword.trim();
    }

    try {
      const updatedUser = updateProfile(user.id, changes);

      if (isChangingPassword) {
        await showSuccess(
          "Contraseña actualizada",
          "Tu contraseña fue cambiada. Por seguridad debes volver a iniciar sesión."
        );
        logout();
        navigate("/login");
      } else {
        setUser((prev) => ({ ...prev, ...updatedUser }));
        showSuccess("Perfil actualizado", "Tus datos han sido actualizados correctamente.");
        isAdminContext ? onClose?.() : navigate(-1);
      }

    } catch (err) {
      showError("Error al actualizar", err.message);
      setErrors({ email: err.message });
    }
  };

  // ── Helpers de estilo ────────────────────────────────────────────────────
  const isValid = (field) =>
    touched[field] && !errors[field] && form[field].toString().trim() !== "";

  const inputClass = (field) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      touched[field] && errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : isValid(field)
        ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
        : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
    }`;

  // ── Contenido ────────────────────────────────────────────────────────────
  const formContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
        <h2 className="text-white font-semibold text-lg">Editar Mi Perfil</h2>
        <button
          onClick={handleCancel}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Tipo Documento */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Tipo Documento<span className="text-red-500">*</span>
            </label>
            <select
              name="documentType"
              value={form.documentType}
              onChange={handleChange}
              className={inputClass("documentType")}
            >
              <option value="">Seleccione</option>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
            </select>
            <ErrorMsg field="documentType" touched={touched} errors={errors} />
          </div>

          {/* Documento */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Documento<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="document"
              inputMode="numeric"
              value={form.document}
              onChange={handleChange}
              maxLength={12}
              className={inputClass("document")}
            />
            <ErrorMsg field="document" touched={touched} errors={errors} />
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Nombre Completo<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass("name")}
            />
            <ErrorMsg field="name" touched={touched} errors={errors} />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
              className={inputClass("phone")}
            />
            <ErrorMsg field="phone" touched={touched} errors={errors} />
          </div>

          {/* Dirección — fila completa */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Dirección<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Tu dirección"
              className={inputClass("address")}
            />
            <ErrorMsg field="address" touched={touched} errors={errors} />
          </div>

          {/* Rol — solo lectura */}
          <ReadOnlyField label="Rol" value={user?.role ?? "Cliente"} />

          {/* Correo */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass("email")}
            />
            <ErrorMsg field="email" touched={touched} errors={errors} />
          </div>

          {/* Contraseña actual */}
          <PasswordField
            label="Contraseña Actual"
            name="currentPassword"
            form={form}
            show={showCurrent}
            onToggle={() => setShowCurrent((p) => !p)}
            inputClass={inputClass}
            handleChange={handleChange}
            errors={errors}
            touched={touched}
          />

          {/* Nueva contraseña */}
          <PasswordField
            label="Cambiar Contraseña"
            name="newPassword"
            form={form}
            show={showNew}
            onToggle={() => setShowNew((p) => !p)}
            inputClass={inputClass}
            handleChange={handleChange}
            errors={errors}
            touched={touched}
          />

          {/* Confirmar contraseña — fila completa */}
          <div className="sm:col-span-2">
            <PasswordField
              label="Confirmar Contraseña"
              name="confirmPassword"
              form={form}
              show={showConfirmPwd}
              onToggle={() => setShowConfirmPwd((p) => !p)}
              inputClass={inputClass}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center gap-3 shrink-0">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
        >
          Guardar Cambios
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </>
  );

  // ── Render según contexto ────────────────────────────────────────────────
  if (isAdminContext) {
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

  return (
    <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-6">
      {formContent}
    </div>
  );
}

export default EditProfileForm;