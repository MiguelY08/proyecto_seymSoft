import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  SquarePen,
  User,
  UserCircle2,
  UserPlus
} from "lucide-react";

function ProfileMenu({
  getInitials,
  handleGoToAdmin,
  handleLogout,
  isLoggingOut,
  modalRef,
  onOpenProfileEdit,
  profileModal,
  role,
  roleName,
  setProfileModal,
  user
}) {
  return (
    <div
      className="relative hidden sm:block"
      ref={modalRef}
    >
      <button
        type="button"
        onClick={() =>
          setProfileModal(
            !profileModal
          )
        }
        className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#004D77] text-xs font-bold text-white transition-all duration-150 hover:bg-[#003d5e]"
        aria-label="Abrir menú de perfil"
        aria-expanded={profileModal}
        aria-haspopup="menu"
      >
        {
          user
          ?
          getInitials(
            user.fullName
            ||
            user.name
          )
          :
          <User size={15} />
        }
      </button>

      {
        profileModal
        &&
        <div
          className="absolute right-0 top-full mt-2 w-60 sm:w-64 bg-white rounded-xl shadow-xl border border-[#e2edf5] z-50 overflow-hidden"
          role="menu"
        >
          <div className="flex flex-col items-center gap-1 px-4 py-3 border-b border-[#e2edf5]">
            <div className="w-11 h-11 rounded-full bg-[#004D77] flex items-center justify-center text-white font-bold text-base mb-1">
              {
                user
                ?
                getInitials(
                  user.fullName
                  ||
                  user.name
                )
                :
                <UserCircle2 size={28} />
              }
            </div>
            <p className="text-xs font-semibold text-[#004D77] text-center">
              {
                user?.fullName
                ||
                user?.name
                ||
                "Invitado"
              }
            </p>
            <p className="text-[0.68rem] text-[#004D77] break-all">
              {
                user?.email
                ||
                "No autenticado"
              }
            </p>
            <p className="text-[0.68rem] font-semibold text-slate-600 mt-0.5">
              {roleName}
            </p>
          </div>

          <div className="py-1">
            {
              user
              ?
              <>
                {
                  role
                  &&
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleGoToAdmin}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Panel administrativo
                  </button>
                }
                <button
                  type="button"
                  role="menuitem"
                  onClick={onOpenProfileEdit}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <SquarePen size={16} />
                  Editar Perfil
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-500 hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {
                    isLoggingOut
                    ?
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    :
                    <LogOut size={16} />
                  }
                  {
                    isLoggingOut
                    ?
                    "Cerrando..."
                    :
                    "Cerrar Sesión"
                  }
                </button>
              </>
              :
              <>
                <Link
                  to="/login"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 transition-colors"
                >
                  <LogIn size={16} />
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 transition-colors"
                >
                  <UserPlus size={16} />
                  Registrarse
                </Link>
              </>
            }
          </div>
        </div>
      }
    </div>
  );
}

export default ProfileMenu;
