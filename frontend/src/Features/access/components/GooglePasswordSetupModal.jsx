import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { useAlert } from "../../shared/alerts/useAlert.js";

import { changePassword } from "../services/authService.js";

export default function GooglePasswordSetupModal() {

  const {
    setRequiresPasswordSetup
  } = useAuth();

  const {
    showSuccess,
    showError,
    showWarning
  } = useAlert();

  const [saving, setSaving] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      password: "",
      confirmPassword: ""
    });

  const [errors, setErrors] =
    useState({});

  const validate = () => {

    const newErrors = {};

    if (
      formData.password.length < 8
    ) {
      newErrors.password =
        "La contraseña debe tener mínimo 8 caracteres";
    }

    if (
      !/[A-Z]/.test(formData.password)
    ) {
      newErrors.password =
        "Debe contener al menos una mayúscula";
    }

    if (
      !/[0-9]/.test(formData.password)
    ) {
      newErrors.password =
        "Debe contener al menos un número";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Las contraseñas no coinciden";
    }

    return newErrors;
  };

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData(
      prev => ({
        ...prev,
        [name]: value
      })
    );
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const validationErrors =
      validate();

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {

      setErrors(validationErrors);

      showWarning(
        "Datos incompletos",
        "Corrige los campos marcados"
      );

      return;
    }

    try {

      setSaving(true);

      const result =
        await changePassword(
          {
            newPassword:
              formData.password
          }
        );

      if (!result.success) {

        showError(
          "Error",
          result.error
        );

        return;
      }

      showSuccess(
        "Contraseña configurada",
        "Ya puedes acceder al sistema"
      );

      setRequiresPasswordSetup(false);

    } catch (error) {

      console.error(error);

      showError(
        "Error",
        "No fue posible configurar la contraseña"
      );

    } finally {

      setSaving(false);

    }
  };

  return (
    <div className="google-password-setup-modal fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">

        <div className="flex items-center gap-3 mb-4">

          <div className="bg-blue-100 p-2 rounded-full">
            <Shield
              className="text-[#004D77]"
              size={22}
            />
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            Configura tu contraseña
          </h2>

        </div>

        <div className="mb-6 text-sm text-gray-600 space-y-2">

          <p>
            Tu cuenta fue creada mediante Google.
          </p>

          <p>
            Para continuar utilizando la plataforma debes configurar una contraseña personal.
          </p>

          <p>
            Esto te permitirá iniciar sesión tanto con Google como con correo y contraseña.
          </p>

        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">

          <p className="font-medium text-[#004D77] mb-2">
            Requisitos de la contraseña
          </p>

          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Mínimo 8 caracteres</li>
            <li>• Al menos una letra mayúscula</li>
            <li>• Al menos un número</li>
          </ul>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-2.5"
              >
                {
                  showPassword
                    ? <EyeOff size={18}/>
                    : <Eye size={18}/>
                }
              </button>

            </div>

            {
              errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password}
                </p>
              )
            }

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>

            <div className="relative">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-2.5"
              >
                {
                  showConfirmPassword
                    ? <EyeOff size={18}/>
                    : <Eye size={18}/>
                }
              </button>

            </div>

            {
              errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )
            }

          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#004D77] hover:bg-[#003A5C] text-white py-2 rounded-lg transition disabled:opacity-70"
          >
            {
              saving
                ? "Guardando..."
                : "Guardar contraseña"
            }
          </button>

        </form>
</div>

    </div>
  );
}

