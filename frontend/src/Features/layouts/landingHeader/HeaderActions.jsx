import {
  Heart,
  Menu,
  ShoppingCart
} from "lucide-react";

import HeaderIconButton from "./HeaderIconButton";
import ProfileMenu from "./ProfileMenu";
import { NotificationBell } from "../../shared/components/notifications";

function HeaderActions({
  cartCount,
  favoritesCount,
  getInitials,
  handleGoToAdmin,
  handleLogout,
  isActive,
  isLoggingOut,
  menuOpen,
  modalRef,
  onOpenMobileMenu,
  onOpenProfileEdit,
  profileModal,
  role,
  roleName,
  setProfileModal,
  user
}) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <HeaderIconButton
        icon={Heart}
        to="/favorites"
        badge={favoritesCount}
        className="hidden sm:block"
        active={isActive("/favorites")}
        ariaLabel="Favoritos"
      />
      <HeaderIconButton
        icon={ShoppingCart}
        to="/cart"
        badge={cartCount}
        active={isActive("/cart")}
        ariaLabel="Carrito"
      />

      {user && (
        <NotificationBell />
      )}

      <ProfileMenu
        getInitials={getInitials}
        handleGoToAdmin={handleGoToAdmin}
        handleLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        modalRef={modalRef}
        onOpenProfileEdit={onOpenProfileEdit}
        profileModal={profileModal}
        role={role}
        roleName={roleName}
        setProfileModal={setProfileModal}
        user={user}
      />

      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="lg:hidden p-1.5 rounded-full hover:bg-[#004D77]/10 transition-colors"
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
      >
        <Menu className="h-[18px] w-[18px] text-gray-700" />
      </button>
    </div>
  );
}

export default HeaderActions;
