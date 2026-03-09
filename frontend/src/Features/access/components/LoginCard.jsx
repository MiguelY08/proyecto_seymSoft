import LoginImgForm from "./LoginImgForm";
import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <div className="
      flex flex-col md:flex-row
      max-w-6xl
      w-full
      mx-auto
      bg-white
      rounded-2xl
      shadow-xl
      overflow-hidden
    ">
      <LoginImgForm />
      <LoginForm />
    </div>
  );
}