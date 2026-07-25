import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../access/context/AuthContext";
import { useAlert } from "../shared/alerts/useAlert";
import { useCart } from "../shared/Context/CartContext";
import { useFavorites } from "../shared/Context/Favoritescontext";
import EditProfileForm from "../access/components/EditProfileForm";
import {
  HeaderActions,
  HeaderLogo,
  HeaderNav,
  HeaderSearch,
  MobileMenu,
  useHeaderSearch
} from "./landingHeader";

function HeaderLanding() {
  const {
    user,
    role,
    isAuthenticated,
    logout
  } = useAuth();

  const {
    showConfirm,
    showSuccess
  } = useAlert();

  const {
    cartCount
  } = useCart();

  const {
    favoritesCount
  } = useFavorites();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const headerSearch =
    useHeaderSearch();

  const [
    menuOpen,
    setMenuOpen
  ] = useState(false);

  const [
    profileModal,
    setProfileModal
  ] = useState(false);

  const [
    isEditProfileOpen,
    setIsEditProfileOpen
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut
  ] = useState(false);

  const modalRef =
    useRef(null);

  const isActive =
    (path) =>
      location.pathname === path;

  const handleLogout =
  useCallback(async () => {
    setIsLoggingOut(
      true
    );
    try {
      await logout();
      showSuccess(
        "Sesión cerrada",
        "Has cerrado Sesión correctamente"
      );
      setProfileModal(
        false
      );
      navigate(
        "/login"
      );
    } catch (error) {
      console.error(
        "Error logout:",
        error
      );
    } finally {
      setIsLoggingOut(
        false
      );
    }
  }, [
    logout,
    navigate,
    showSuccess
  ]);

  const handleGoToAdmin =
  async () => {
    setProfileModal(
      false
    );
    const result =
    await showConfirm(
      "info",
      "¿Ir al panel administrativo?",
      "Entrarás al panel administrativo",
      {
        confirmButtonText:
          "Ir",
        cancelButtonText:
          "Cancelar"
      }
    );
    if (
      result?.isConfirmed
    ) {
      navigate(
        "/admin"
      );
    }
  };

  useEffect(() => {
    const handleClickOutside =
    (e) => {
      if (
        modalRef.current
        &&
        !modalRef.current.contains(
          e.target
        )
      ) {
        setProfileModal(
          false
        );
      }
    };
    if (profileModal) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, [profileModal]);

  useEffect(() => {
    setProfileModal(
      false
    );
    setMenuOpen(
      false
    );
  }, [location]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }
    return () => {
      document.body.style.overflow =
        "";
    };
  }, [menuOpen]);

  const getInitials =
  useCallback((name) => {
    if (!name)
      return "";
    const words =
      name.trim().split(/\s+/);
    return words
      .slice(0, 2)
      .map(
        (word) =>
          word
          .charAt(0)
          .toUpperCase()
      )
      .join("");
  }, []);

  const roleName =
    role?.nameRole
    ||
    role?.name_role
    ||
    "Cliente";

  const openProfileEdit = () => {
    setIsEditProfileOpen(
      true
    );
    setProfileModal(
      false
    );
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b bg-white/85 shadow-md backdrop-blur-md transition-all duration-150"
        style={{
          borderBottomColor:
            "#e2edf5"
        }}
      >
        <div className="mx-auto max-w-[var(--store-content-max)] px-3 sm:px-[var(--store-content-x)]">
          <div className="flex h-14 items-center gap-2 transition-all duration-150 sm:h-16 sm:gap-3 lg:gap-4">
            <HeaderLogo />
            <HeaderSearch
              searchQuery={headerSearch.query}
              setSearchQuery={headerSearch.setQuery}
              onSubmit={headerSearch.submitSearch}
              results={headerSearch.results}
              recentSearches={headerSearch.recentSearches}
              shouldShowResults={headerSearch.shouldShowResults}
              shouldShowRecentSearches={headerSearch.shouldShowRecentSearches}
              hasResults={headerSearch.hasResults}
              isLoading={headerSearch.isLoading}
              error={headerSearch.error}
              onFocus={headerSearch.openSearch}
              onSelectResult={headerSearch.selectResult}
              onSelectRecentSearch={headerSearch.selectRecentSearch}
              onRemoveRecentSearch={headerSearch.removeRecentSearch}
              onClearRecentSearches={headerSearch.clearRecentSearches}
              onClose={headerSearch.closeSearch}
              onClear={headerSearch.clearSearch}
            />
            <HeaderNav
              isActive={isActive}
              showOrders={isAuthenticated}
            />
            <HeaderActions
              cartCount={cartCount}
              favoritesCount={favoritesCount}
              getInitials={getInitials}
              handleGoToAdmin={handleGoToAdmin}
              handleLogout={handleLogout}
              isActive={isActive}
              isLoggingOut={isLoggingOut}
              menuOpen={menuOpen}
              modalRef={modalRef}
              onOpenMobileMenu={() => setMenuOpen(true)}
              onOpenProfileEdit={openProfileEdit}
              profileModal={profileModal}
              role={role}
              roleName={roleName}
              setProfileModal={setProfileModal}
              user={user}
            />
          </div>
        </div>
      </header>
      <div className="h-14 sm:h-16" />

      {menuOpen && (
        <MobileMenu
          cartCount={cartCount}
          favoritesCount={favoritesCount}
          getInitials={getInitials}
          handleGoToAdmin={handleGoToAdmin}
          handleLogout={handleLogout}
          isActive={isActive}
          isLoggingOut={isLoggingOut}
          onClose={() => setMenuOpen(false)}
          onOpenProfileEdit={() => setIsEditProfileOpen(true)}
          role={role}
          showOrders={isAuthenticated}
          user={user}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileForm
          onClose={() => setIsEditProfileOpen(false)}
          isModal={true}
        />
      )}
    </>
  );
}

export default HeaderLanding;
