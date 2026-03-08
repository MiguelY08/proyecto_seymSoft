import RegisterForm from "../components/RegisterForm";
import LoginBanner from "../components/LoginBanner";
import AuthFooter from "../../shared/AuthFooter";

import imagenBanner from "../../../assets/imagenBanner.png";
import logo from "../../../assets/PapeleriaMagicLogo.png";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-col flex-1">

        {/* Banner */}
        <LoginBanner
          titulo="Regístrate"
          imagen={imagenBanner}
          logo={logo}
        />

        {/* Contenedor del formulario */}
        <div className="flex flex-1 justify-center items-center bg-gray-100 px-3 py-3">
          <RegisterForm />
        </div>

      </main>

      {/* Footer */}
      <AuthFooter />

    </div>
  );
}