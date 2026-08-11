import LoginImgForm from "./LoginImgForm";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useState } from "react";

export default function LoginCard({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const isRegister = mode === "register";

  return (
    <div
      className={`
        relative
        flex flex-col md:flex-row
        w-full
        mx-auto
        bg-white
        rounded-2xl
        shadow-xl
        overflow-hidden
        max-w-[1200px]
        md:h-[520px]
        lg:h-[540px]
      `}
    >
      <div
        className={`
          hidden md:block absolute inset-y-0 left-0 w-1/2 z-20
          transition-transform duration-700 ease-in-out
          ${isRegister ? "translate-x-full" : "translate-x-0"}
        `}
      >
        <LoginImgForm />
      </div>

      <div className="relative flex w-full flex-col md:h-full md:flex-row">
        <section
          className={`
            w-full md:w-1/2 transition-all duration-700 ease-in-out
            ${isRegister ? "block opacity-100 md:translate-x-0" : "hidden opacity-0 pointer-events-none md:block md:translate-x-full"}
          `}
        >
          <RegisterForm embedded onSwitchToLogin={() => setMode("login")} />
        </section>

        <section
          className={`
            w-full md:w-1/2 transition-all duration-700 ease-in-out
            ${isRegister ? "hidden opacity-0 pointer-events-none md:block md:-translate-x-full" : "block opacity-100 md:translate-x-0"}
          `}
        >
          <LoginForm onSwitchToRegister={() => setMode("register")} />
        </section>
      </div>
    </div>
  );
}
