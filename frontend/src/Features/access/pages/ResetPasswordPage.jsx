import imagenBanner from "../../../assets/imagenBanner.png"
import LoginBanner from "../components/LoginBanner"
import BackHeader from "../../shared/BackHeader"
import AuthFooter from "../../shared/AuthFooter"
import ResetPasswordForm from "../components/ResetPasswordForm"
import logo from "../../../assets/PapeleriaMagicLogo.png"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">

      <main className="flex flex-col flex-1">

        <LoginBanner 
          titulo="Restablecer contraseña"
          imagen={imagenBanner}
          logo={logo}
        />

        <div className="bg-gray-100 flex flex-col flex-1 overflow-hidden">

          <BackHeader
            title="Volver"
            to="/login"
          />

          <div className="flex flex-1 justify-center items-center px-4 py-2 overflow-y-auto">
            <ResetPasswordForm />
          </div>

        </div>

      </main>

      <AuthFooter />

    </div>
  )
}