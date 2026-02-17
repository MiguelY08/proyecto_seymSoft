import LoginImgForm from './LoginImgForm'
import LoginForm from './LoginForm'

export default function LoginCard() {
  return (
    <div className="
      flex flex-col md:flex-row
      max-w-4xl
      mx-auto
      bg-white
      rounded-2xl
      shadow-lg
      overflow-hidden
    ">
      <LoginImgForm />
      <LoginForm />
    </div>
  )
}
