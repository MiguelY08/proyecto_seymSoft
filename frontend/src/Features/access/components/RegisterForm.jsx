import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";
import { validateRegister, sanitizeInput } from "../validators/authValidators";
import { useAlert } from "../../shared/alerts/useAlert";

export default function RegisterForm() {

  // ─── Navegación ───────────────────────────────────────────────────────────
  const navigate = useNavigate();

  // ─── Sistema de alertas ───────────────────────────────────────────────────
  const { showSuccess, showError, showWarning, showConfirm } = useAlert();

  // ─── Mostrar / ocultar contraseñas ────────────────────────────────────────
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── Estado del formulario ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    documentType:    "",
    document:        "",
    fullName:        "",
    email:           "",
    phone:           "",
    address:         "",
    password:        "",
    confirmPassword: "",
    terms:           false,
  });

  // ─── Errores de validación ────────────────────────────────────────────────
  const [errors, setErrors] = useState({});


  /* ==========================================================================
     handleChange
  ========================================================================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = type === "checkbox" ? checked : value;
    newValue = sanitizeInput(name, newValue);

    const updatedForm = { ...formData, [name]: newValue };
    setFormData(updatedForm);

    const validationErrors = validateRegister(updatedForm);
    setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
  };


  /* ==========================================================================
     handleSubmit
  ========================================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegister(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showWarning(
        "Campos incompletos",
        "Por favor revisa los campos obligatorios"
      );
      return;
    }

    // ── Alerta de confirmación con resumen de datos ───────────────────────
    const result = await showConfirm(
      "info",
      "¿Confirmar registro?",
      `Revisa tus datos antes de continuar:\n\n👤 Nombre: ${formData.fullName}\n🪪 Documento: ${formData.documentType} - ${formData.document}\n📧 Correo: ${formData.email}\n📞 Teléfono: ${formData.phone}\n📍 Dirección: ${formData.address}\n\n¿Estás seguro de que deseas crear tu cuenta con estos datos?`,
      { confirmButtonText: "Sí, registrarme", cancelButtonText: "Revisar de nuevo" }
    );

    if (!result?.isConfirmed) return;

    try {
      const { confirmPassword, terms, ...userData } = formData;
      registerUser(userData);
      showSuccess("Registro exitoso", "Tu cuenta fue creada correctamente");
      navigate("/login");
    } catch (error) {
      showError("Error en el registro", error.message);
    }
  };


  /* ==========================================================================
     Label reutilizable
  ========================================================================== */
  const Label = ({ text }) => (
    <label className="flex items-center gap-1 mb-1 text-sm font-medium text-gray-700">
      {text}
      <span className="text-red-500">*</span>
    </label>
  );


  /* ==========================================================================
     inputStyle
  ========================================================================== */
  const inputStyle = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none
    ${errors[field]
      ? "border-red-500 focus:ring-red-500"
      : "focus:ring-2 focus:ring-blue-600"
    }`;


  return (
    <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-[#004D77] py-4">
        <h2 className="font-lexend text-xl md:text-2xl font-semibold text-white text-center">
          Crear Cuenta
        </h2>
      </div>

      <div className="p-5 md:p-5">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >

          {/* Tipo Documento */}
          <div>
            <Label text="Tipo de Documento" />
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className={inputStyle("documentType")}
            >
              <option value="">Seleccione</option>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
            </select>
            {errors.documentType &&
              <p className="text-red-500 text-xs mt-1">{errors.documentType}</p>}
          </div>

          {/* Documento */}
          <div>
            <Label text="Documento" />
            <input
              type="text"
              name="document"
              inputMode="numeric"
              value={formData.document}
              onChange={handleChange}
              className={inputStyle("document")}
            />
            {errors.document &&
              <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
          </div>

          {/* Nombre */}
          <div>
            <Label text="Nombre Completo" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={inputStyle("fullName")}
            />
            {errors.fullName &&
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <Label text="Correo Electrónico" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle("email")}
            />
            {errors.email &&
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Dirección */}
          <div>
            <Label text="Dirección" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputStyle("address")}
            />
            {errors.address &&
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <Label text="Teléfono" />
            <input
              type="text"
              name="phone"
              inputMode="numeric"
              value={formData.phone}
              onChange={handleChange}
              className={inputStyle("phone")}
            />
            {errors.phone &&
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Label text="Contraseña" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputStyle("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.password &&
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <Label text="Confirmar Contraseña" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputStyle("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[34px] text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.confirmPassword &&
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Términos */}
          <div className="col-span-full flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <label className="text-sm">
              Aceptar términos y condiciones
            </label>
          </div>

          {errors.terms && (
            <div className="col-span-full">
              <p className="text-red-500 text-xs">{errors.terms}</p>
            </div>
          )}

          {/* Botones */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <button
              type="submit"
              className="w-full bg-[#004D77] text-white py-2.5 rounded-lg text-sm hover:bg-[#005D8A] transition cursor-pointer"
            >
              Registrar
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-gray-500 text-white py-2.5 rounded-lg text-sm hover:bg-gray-600 transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}