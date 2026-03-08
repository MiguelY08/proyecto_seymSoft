import imagenBanner from "../../../assets/imagenBanner.png"
import LoginBanner from "../components/LoginBanner"
import BackHeader from "../../shared/BackHeader"
import AuthFooter from "../../shared/AuthFooter"
import ResetPasswordForm from "../components/ResetPasswordForm"
import logo from "../../../assets/PapeleriaMagicLogo.png"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex flex-col flex-1">

        <LoginBanner 
          titulo="Restablecer contraseña"
          imagen={imagenBanner}
          logo={logo}
        />

        {/* Fondo gris */}
        <div className="bg-gray-100 flex flex-col flex-1">

          <BackHeader
            title="Volver"
            to="/login"
          />

          {/* Formulario */}
          <div className="flex flex-1 justify-center items-start lg:items-center px-4 py-3">
            <ResetPasswordForm />
          </div>

        </div>

      </main>

      <AuthFooter />

    </div>
  )
}