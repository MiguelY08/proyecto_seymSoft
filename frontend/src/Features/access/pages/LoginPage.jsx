import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import LoginBanner from "../components/LoginBanner";
import LoginCard from "../components/LoginCard";
// import BackHeader from "../../shared/BackHeader"
import AuthFooter from "../../shared/AuthFooter";
// import imagenBanner from "../../../assets/imagenBanner.png"
import logo from "../../../assets/PapeleriaMagicLogo.png";
import HeaderLanding from "../../layouts/HeaderLanding";

import { useAlert } from "../../shared/alerts/useAlert";

export default function LoginPage() {

  const handledErrorRef = useRef(null);
  const [searchParams] = useSearchParams();

  const { showError } = useAlert();

  useEffect(() => {

    const error =
      searchParams.get("error");

    if (!error || handledErrorRef.current === error) {
      return;
    }

    handledErrorRef.current = error;

    if (
      error === "account_inactive"
    ) {

      showError(
        "Acceso denegado",
        "Tu cuenta se encuentra inactiva. Contacta al administrador."
      );

    }

     if (
      error === "google_auth_failed"
    ) {

      showError(
        "Error",
        "No se pudo iniciar sesión con Google."
      );

    }

    if (
      error === "session_timeout"
    ) {

      showError(
        "Sesión finalizada",
        "La sesión expiró por inactividad"
      );

    }

  }, [searchParams, showError]);

  return (
    <div className="min-h-screen flex flex-col">

      <HeaderLanding />

      {/* <LoginBanner
        titulo="Iniciar Sesión"
        imagen={imagenBanner}
        logo={logo}
      /> */}

      <div className="bg-gray-100 flex flex-col flex-1">

        {/* <BackHeader
          title="Volver"
          to="/"
        /> */}

        <div className="flex justify-center items-center flex-1 px-4 py-6">
          <LoginCard />
        </div>

      </div>

      <AuthFooter />

    </div>
  );
}
