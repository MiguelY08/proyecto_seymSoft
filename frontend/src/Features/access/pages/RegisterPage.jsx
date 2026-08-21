import LoginCard from "../components/LoginCard";
import AuthAnimatedBackground from "../components/AuthAnimatedBackground";
// import LoginBanner from "../components/LoginBanner";
import AuthFooter from "../../shared/AuthFooter";
import HeaderLanding from "../../layouts/HeaderLanding"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-col flex-1">

        {/* Banner
        <LoginBanner
          titulo="Regístrate"
          imagen={imagenBanner}
          logo={logo}
        /> */}
        <HeaderLanding />

        {/* Contenedor del formulario */}
        <AuthAnimatedBackground>
          <div className="flex flex-1 justify-center items-start px-4 py-6 md:items-center">
            <LoginCard initialMode="register" />
          </div>
        </AuthAnimatedBackground>

      </main>

      {/* Footer */}
      <AuthFooter />

    </div>
  );
}
