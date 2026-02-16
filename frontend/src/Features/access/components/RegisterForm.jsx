import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    documentType: "",
    document: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.documentType) newErrors.documentType = "Seleccione tipo de documento";
    if (!formData.document) newErrors.document = "Documento obligatorio";
    if (!formData.fullName) newErrors.fullName = "Nombre obligatorio";
    if (!formData.email) newErrors.email = "Correo obligatorio";
    if (!formData.phone) newErrors.phone = "Teléfono obligatorio";
    if (!formData.address) newErrors.address = "Dirección obligatoria";
    if (!formData.password) newErrors.password = "Contraseña obligatoria";
    if (formData.password && formData.password.length < 6)
      newErrors.password = "Mínimo 6 caracteres";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (!formData.terms) newErrors.terms = "Debe aceptar términos";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Formulario válido", formData);
    }
  };

  const Label = ({ text }) => (
    <label className="flex items-center gap-1 mb-1 text-sm font-medium text-gray-700">
      {text}
      <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

      {/*  Encabezado Azul */}
      <div className="bg-[#004D77] py-3">
        <h2 className="font-lexend text-lg md:text-xl font-semibold text-white text-center">
          Crear Cuenta
        </h2>
      </div>

      <div className="p-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Tipo Documento */}
          <div>
            <Label text="Tipo de Documento" />
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
            >
              <option value="">Seleccione</option>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
            </select>
            {errors.documentType && (
              <p className="text-red-500 text-xs mt-1">{errors.documentType}</p>
            )}
          </div>

          {/* Documento */}
          <div>
            <Label text="Documento" />
            <input
              type="text"
              name="document"
              value={formData.document}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
            {errors.document && (
              <p className="text-red-500 text-xs mt-1">{errors.document}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <Label text="Nombre Completo" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label text="Correo Electrónico" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <Label text="Dirección" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <Label text="Teléfono" />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Label text="Contraseña" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[32px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar */}
          <div className="relative">
            <Label text="Confirmar Contraseña" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[32px] text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Términos */}
          <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
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
            <div className="col-span-1 md:col-span-2">
              <p className="text-red-500 text-xs">{errors.terms}</p>
            </div>
          )}

          {/* Botones */}
          <div className="col-span-1 md:col-span-2 flex justify-between mt-4">
            <button
              type="submit"
              className="bg-blue-900 text-white px-20 py-2 rounded-lg text-sm hover:bg-blue-800 transition cursor-pointer"
            >
              Registrar
            </button>

            <button
              type="button"
              className="bg-gray-500 text-white px-20 py-2 rounded-lg text-sm hover:bg-gray-600 transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
