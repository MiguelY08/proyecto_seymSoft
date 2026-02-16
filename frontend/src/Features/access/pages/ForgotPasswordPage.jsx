

import imagenBanner from "../../../assets/imagenBanner.png"
import LoginBanner from "../components/LoginBannjer"
import HeaderLanding from "../../layouts/HeaderLanding"
import Footer from "../../layouts/Footer"
import ForgotPasswordForm from "../components/ForgotPasswordForm"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <HeaderLanding />

      <main className="flex-grow flex flex-col">

        <LoginBanner 
          titulo="Rescuperar contrseña"
          imagen={imagenBanner}
        />

        {/* Contenedor optimizado */}
        <div className="flex justify-center items-center bg-gray-100 py-6 px-4 flex-grow">
          <ForgotPasswordForm />
        </div>

      </main>

      <Footer />

    </div>
  )
}
