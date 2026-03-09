import imagenBanner from "../../../assets/imagenBanner.png"
import LoginBanner from "../components/LoginBanner"
import BackHeader from "../../shared/BackHeader"
import AuthFooter from "../../shared/AuthFooter"

import logo from "../../../assets/PapeleriaMagicLogo.png"
import ForgotPasswordForm from "../components/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex flex-col flex-1">

        <LoginBanner 
          titulo="Recuperar contraseña"
          imagen={imagenBanner}
          logo={logo}
        />

        {/* Contenedor gris */}
        <div className="bg-gray-100 flex flex-col flex-1">

          <BackHeader
            title="Volver"
            to="/login"
          />

          {/* Formulario */}
          <div className="flex justify-center items-center flex-1 px-4 py-4">
            <ForgotPasswordForm />
          </div>

        </div>

      </main>

      <AuthFooter />

    </div>
  )
}