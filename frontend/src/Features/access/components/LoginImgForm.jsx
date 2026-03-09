import loginPapeleria from "../../../assets/loginPapeleria.jpg";

export default function LoginImgForm() {
  return (
    <div className="hidden md:block md:w-1/2">
      <img
        src={loginPapeleria}
        alt="Papelería Magic - Login"
        className="w-full h-[420px] lg:h-[440px] object-cover"
      />
    </div>
  );
}