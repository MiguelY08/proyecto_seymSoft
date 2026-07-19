import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Home,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Package,
  ShoppingCart,
  SquarePen,
  Store,
  UserCircle2,
  UserPlus,
  X
} from "lucide-react";

import logo from "../../../assets/PapeleriaMagicLogo.png";
import MobileNavLink from "./MobileNavLink";

function MobileMenu({
  cartCount,
  favoritesCount,
  getInitials,
  handleGoToAdmin,
  handleLogout,
  isActive,
  isLoggingOut,
  onClose,
  onOpenProfileEdit,
  role,
  user
}) {
  const mobileMenuRef =
    useRef(null);

  const handleAdminClick = () => {
    onClose();
    handleGoToAdmin();
  };

  const handleEditProfileClick = () => {
    onClose();
    onOpenProfileEdit();
  };

  const handleLogoutClick = () => {
    onClose();
    handleLogout();
  };

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Cerrar menú"
      />

      <aside
        ref={mobileMenuRef}
        className="absolute right-0 top-0 flex h-dvh w-[min(22rem,88vw)] flex-col overflow-hidden bg-white shadow-2xl"
        aria-label="Menú móvil"
      >
        <div className="flex items-center justify-between border-b border-[#e2edf5] px-4 py-3">
          <Link
            to="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-2"
            aria-label="Inicio Papelería Magic"
          >
            <img
              src={logo}
              alt="Papelería Magic"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="truncate font-serif text-lg font-semibold italic text-[#004D77]">
              Papelería Magic
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-[#004D77]/10"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <MobileNavLink
            icon={Home}
            label="Inicio"
            to="/"
            active={isActive("/")}
            onClick={onClose}
          />
          <MobileNavLink
            icon={Store}
            label="Tienda"
            to="/shop"
            active={isActive("/shop")}
            onClick={onClose}
          />
          <MobileNavLink
            icon={Package}
            label="Pedidos"
            to="/orders-l"
            active={isActive("/orders-l")}
            onClick={onClose}
          />
          <MobileNavLink
            icon={Heart}
            label="Favoritos"
            to="/favorites"
            active={isActive("/favorites")}
            badge={favoritesCount}
            onClick={onClose}
          />
          <MobileNavLink
            icon={ShoppingCart}
            label="Carrito"
            to="/cart"
            active={isActive("/cart")}
            badge={cartCount}
            onClick={onClose}
          />
        </nav>

        <div className="border-t border-[#e2edf5] bg-slate-50 px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#004D77] text-sm font-bold text-white">
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
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#004D77]">
                {
                  user?.fullName
                  ||
                  user?.name
                  ||
                  "Invitado"
                }
              </p>
              <p className="truncate text-xs text-slate-500">
                {
                  user?.email
                  ||
                  "No autenticado"
                }
              </p>
            </div>
          </div>

          {
            user
            ?
            <div className="space-y-1">
              {
                role
                &&
                <button
                  type="button"
                  onClick={handleAdminClick}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#004D77] transition-colors hover:bg-white"
                >
                  <LayoutDashboard size={18} />
                  Panel administrativo
                </button>
              }
              <button
                type="button"
                onClick={handleEditProfileClick}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#004D77] transition-colors hover:bg-white"
              >
                <SquarePen size={18} />
                Editar Perfil
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {
                  isLoggingOut
                  ?
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  :
                  <LogOut size={18} />
                }
                {
                  isLoggingOut
                  ?
                  "Cerrando..."
                  :
                  "Cerrar Sesión"
                }
              </button>
            </div>
            :
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#004D77] px-3 py-2.5 text-sm font-semibold text-white"
              >
                <LogIn size={17} />
                Iniciar
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#004D77] px-3 py-2.5 text-sm font-semibold text-[#004D77]"
              >
                <UserPlus size={17} />
                Registro
              </Link>
            </div>
          }
        </div>
      </aside>
    </div>
  );
}

export default MobileMenu;
