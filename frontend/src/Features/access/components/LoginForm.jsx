import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { loginUser } from "../services/authService";
import { saveSession } from "../helpers/authStorage";
import { validateLogin } from "../validators/authValidators";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {

    const { name, value } = e.target;

    const updatedForm = {
      ...formData,
      [name]: value
    };

    setFormData(updatedForm);

    // validación en tiempo real
    const validationErrors = validateLogin(updatedForm);

    setErrors(validationErrors);
  };

  const handleSubmit = (e) => {

  e.preventDefault();

  const validationErrors = validateLogin(formData);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {

    const session = loginUser(
      formData.email,
      formData.password
    );

    console.log("SESSION GENERADA:", session);

    // guardar sesión completa
    saveSession(session);

    // actualizar contexto
    setUser(session.user);

    // redirigir al panel
    navigate("/admin");

  } catch (error) {

    setErrors({
      general: error.message
    });

  }

};
  const inputStyle = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none
    ${errors[field]
      ? "border-red-500 focus:ring-red-500"
      : "focus:ring-2 focus:ring-blue-600"
    }`;

  return (

    <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">

      <h2 className="font-lexend text-xl md:text-2xl font-semibold mb-2 text-gray-800 text-center">
        Papelería Magic
      </h2>

      <p className="mb-5 text-sm text-gray-600 text-center">
        ¡Qué gusto verte otra vez! Ingresa para continuar.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col"
      >

        <div className="flex flex-col gap-4">

          {/* Email */}
          <div>

            <label className="block mb-1 text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@email.com"
              className={inputStyle("email")}
            />

            {errors.email &&
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            }

          </div>

          {/* Password */}
          <div className="relative">

            <label className="block mb-1 text-sm font-medium text-gray-700">
              Contraseña
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className={inputStyle("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>

            {errors.password &&
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            }

          </div>

        </div>

        {/* Error general */}
        {errors.general &&
          <p className="text-red-500 text-xs mt-3 text-center">
            {errors.general}
          </p>
        }

        {/* Recordar */}
        <div className="flex items-center justify-between text-xs mt-4">

          <label className="flex items-center gap-2">
            <input type="checkbox"/>
            Recordarme
          </label>

          <Link
            to="/forgotpassword"
            className="text-blue-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>

        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition cursor-pointer mt-4 text-sm"
        >
          Ingresar
        </button>

        {/* Registro */}
        <div className="text-center text-xs mt-3">

          ¿No tienes cuenta?{" "}

          <Link
            to="/register"
            className="text-blue-700 font-medium hover:underline"
          >
            Regístrate
          </Link>

        </div>

      </form>

    </div>

  );
}