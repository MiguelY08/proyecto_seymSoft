import loginPapeleria from "../../../assets/loginBg.png";

export default function LoginImgForm() {
  return (
    <div className="relative h-full overflow-hidden bg-[#004D77]">
      <img
        src={loginPapeleria}
        alt="Papelería Magic - Login"
        className="h-full min-h-[520px] w-full object-cover lg:min-h-[540px]"
      />
    </div>
  );
}
