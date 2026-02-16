import loginPapeleria from '../../../assets/loginPapeleria.jpg'

export default function LoginImagForm() {
  return (
    <div className="hidden md:block md:w-1/2">
      <img
        src={loginPapeleria}
        alt="Papelería Magic - Login"
        className="w-full h-[380px] object-cover"
      />
    </div>
  )
}
