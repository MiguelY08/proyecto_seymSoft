import imagenBanner from "../../../assets/imagenBanner.png";
import LoginBanner from "../components/LoginBanner";
import HeaderLanding from "../../layouts/HeaderLanding";
import Footer from "../../layouts/Footer";
import ResetPasswordForm from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-grow flex flex-col">
        <LoginBanner titulo="Restablecer Contraseña" imagen={imagenBanner} />

        {/* Contenedor optimizado */}
        <div className="flex justify-center items-center bg-gray-100 py-6 px-4 flex-grow">
          <ResetPasswordForm />
        </div>
      </main>

    </div>
  );
}
