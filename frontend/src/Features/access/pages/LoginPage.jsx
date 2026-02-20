import LoginBanner from "../components/LoginBanner"
import LoginCard from "../components/LoginCard"
import imagenBanner from "../../../assets/imagenBanner.png"
import HeaderLanding from "../../layouts/HeaderLanding"
import Footer from "../../layouts/Footer"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <HeaderLanding />

      <main className="grow flex flex-col">

        <LoginBanner 
          titulo="Iniciar Sesión"
          imagen={imagenBanner}
        />

        {/* Contenedor optimizado */}
        <div className="flex justify-center items-center bg-gray-100 py-6 px-4 grow">
          <LoginCard />
        </div>

      </main>

      <Footer />

    </div>
  );
};
