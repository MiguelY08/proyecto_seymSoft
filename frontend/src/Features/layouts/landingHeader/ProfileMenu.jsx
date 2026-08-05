import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  SquarePen,
  User,
  UserCircle2,
  UserPlus,
} from "lucide-react";

function ProfileMenu({
  getInitials,
  handleGoToAdmin,
  handleLogout,
  isLoggingOut,
  modalRef,
  onOpenProfileSummary,
  onOpenProfileEdit,
  profileModal,
  role,
  roleName,
  setProfileModal,
  user,
}) {
  const isAuthenticated = Boolean(user);

  return (
    <div className="relative hidden sm:block" ref={modalRef}>
      <button
        type="button"
        onClick={() => setProfileModal(!profileModal)}
        className={
          isAuthenticated
            ? "relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#004D77] text-xs font-bold text-white transition-all duration-150 hover:bg-[#003d5e]"
            : "relative inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[#004D77] bg-white px-3 text-xs font-semibold text-[#004D77] transition-all duration-150 hover:bg-[#004D77]/8"
        }
        aria-label={isAuthenticated ? "Abrir menú de perfil" : "Abrir opciones de ingreso"}
        aria-expanded={profileModal}
        aria-haspopup="menu"
      >
        {isAuthenticated ? (
          getInitials(user.fullName || user.name)
        ) : (
          <>
            <LogIn size={15} />
            <span>Ingresar</span>
          </>
        )}
      </button>

      {profileModal && (
        <div
          className="absolute right-0 top-full mt-2 w-60 sm:w-64 bg-white rounded-xl shadow-xl border border-[#e2edf5] z-50 overflow-hidden"
          role="menu"
        >
          <div className="flex flex-col items-center gap-1 px-4 py-3 border-b border-[#e2edf5]">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base mb-1 ${
                isAuthenticated
                  ? "bg-[#004D77] text-white"
                  : "bg-[#004D77]/8 text-[#004D77] ring-1 ring-[#004D77]/15"
              }`}
            >
              {isAuthenticated ? (
                getInitials(user.fullName || user.name)
              ) : (
                <UserCircle2 size={28} />
              )}
            </div>
            <p className="text-xs font-semibold text-[#004D77] text-center">
              {user?.fullName || user?.name || "Cuenta"}
            </p>
            <p className="text-[0.68rem] text-[#004D77] text-center break-words">
              {user?.email || "Inicia sesión para ver tus pedidos"}
            </p>
            {isAuthenticated && (
              <p className="text-[0.68rem] font-semibold text-slate-600 mt-0.5">
                {roleName}
              </p>
            )}
          </div>

          <div className="py-1">
            {isAuthenticated ? (
              <>
                {role && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleGoToAdmin}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Panel administrativo
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  aria-label="Datos Financieros"
                  title="Datos Financieros"
                  onClick={() => {
                    setProfileModal(false);
                    onOpenProfileSummary();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] transition-colors hover:bg-gray-100"
                >
                  <User size={16} />
                  Datos Financieros
                </button>
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
                  {isLoggingOut ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LogOut size={16} />
                  )}
                  {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  role="menuitem"
                  onClick={() => setProfileModal(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 transition-colors"
                >
                  <LogIn size={16} />
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  role="menuitem"
                  onClick={() => setProfileModal(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 transition-colors"
                >
                  <UserPlus size={16} />
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
