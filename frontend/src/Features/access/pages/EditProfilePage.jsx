import EditProfileForm from "../components/EditProfileForm";
import LoginBanner from "../components/LoginBanner";
import AuthFooter from "../../shared/AuthFooter";

import imagenBanner from "../../../assets/imagenBanner.png";
import logo from "../../../assets/PapeleriaMagicLogo.png";

export default function EditProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-col flex-1">

        {/* Banner */}
        <LoginBanner
          titulo="Editar Perfil"
          imagen={imagenBanner}
          logo={logo}
        />

        {/* Contenedor del formulario */}
        <div className="flex flex-1 justify-center items-center bg-gray-100 px-6 py-6">
          <EditProfileForm />
        </div>

      </main>

      {/* Footer */}
      <AuthFooter />

    </div>
  );
}