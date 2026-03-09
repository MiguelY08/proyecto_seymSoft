import LoginBanner from "../components/LoginBanner"
import LoginCard from "../components/LoginCard"
import BackHeader from "../../shared/BackHeader"
import AuthFooter from "../../shared/AuthFooter"
import imagenBanner from "../../../assets/imagenBanner.png"
import logo from "../../../assets/PapeleriaMagicLogo.png"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <LoginBanner
        titulo="Iniciar Sesión"
        imagen={imagenBanner}
        logo={logo}
      />

      {/* CONTENIDO */}
      <div className="bg-gray-100 flex flex-col flex-1">

        <BackHeader
          title="Volver"
          to="/"
        />

        <div className="flex justify-center items-center flex-1 px-4 py-6">
          <LoginCard />
        </div>

      </div>

      <AuthFooter />

    </div>
  );
}