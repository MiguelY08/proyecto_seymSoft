import AuthFooter from "../../shared/AuthFooter"
import HeaderLanding from "../../layouts/HeaderLanding"
import AuthAnimatedBackground from "../components/AuthAnimatedBackground"
import ForgotPasswordForm from "../components/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-1 flex-col">
        <HeaderLanding />
        <AuthAnimatedBackground>
          <div className="flex flex-1 items-center justify-center px-4 py-4">
            <ForgotPasswordForm />
          </div>
        </AuthAnimatedBackground>
      </main>
      <AuthFooter />
    </div>
  )
}
