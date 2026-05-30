import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Search, Home, Store, Package, Heart, ShoppingCart,
  Menu, SquarePen, LogOut, User, UserPlus, X,
  UserCircle2, LayoutDashboard, Loader2, LogIn
} from "lucide-react";

import logo from "../../assets/PapeleriaMagicLogo.png";
import horizontalLogo from "../../assets/PMLogo_Horizontal.png";
import { useAuth } from "../access/context/AuthContext";
import { useAlert } from "../shared/alerts/useAlert";
import { useCart } from "../shared/Context/Cartcontext";
import { useFavorites } from "../shared/Context/Favoritescontext";

function HeaderLanding() {
  const { user, logout } = useAuth();
  const { showConfirm, showSuccess } = useAlert();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const modalRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showSuccess("Sesión cerrada", "Has cerrado sesión correctamente.");
      setProfileModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate, showSuccess]);

  const handleGoToDashboard = async () => {
    setProfileModal(false);
    const result = await showConfirm(
      "info",
      "¿Ir al Dashboard?",
      "Irás al panel administrativo.",
      { confirmButtonText: "Sí, ir al dashboard", cancelButtonText: "Cancelar" }
    );
    if (result?.isConfirmed) navigate("/admin");
  };

  // ── Scroll header ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Click fuera del modal de perfil ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setProfileModal(false);
      }
    };
    if (profileModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileModal]);

  // ── Cerrar modal al cambiar ruta ──
  useEffect(() => {
    setProfileModal(false);
    setMenuOpen(false);
  }, [location]);

  // ── Prevenir scroll del body cuando el menú móvil está abierto ──
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const getInitials = useCallback((name) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-150 backdrop-blur-md bg-white/85 ${
          scrolled ? "shadow-sm" : "shadow-md"
        }`}
        style={{ borderBottomColor: "#e2edf5" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div
            className={`flex items-center justify-between gap-2 sm:gap-4 transition-all duration-150 ${
              scrolled ? "h-11 sm:h-12" : "h-14 sm:h-16"
            }`}
          >
            {/* LOGO */}
            <Link to="/" className="flex shrink-0 items-center" aria-label="Inicio Papelería Magic">
              <div
                className={`rounded-full overflow-hidden cursor-pointer transition-all duration-150 md:hidden ${
                  scrolled ? "w-7 h-7" : "w-9 h-9"
                }`}
              >
                <img src={logo} alt="Logo Papelería Magic" className="w-full h-full object-cover" />
              </div>
              <img
                src={horizontalLogo}
                alt="Papelería Magic"
                className={`hidden object-contain transition-all duration-150 md:block ${
                  scrolled
                    ? "h-10 max-w-[150px] lg:max-w-[190px]"
                    : "h-14 max-w-[190px] lg:max-w-[260px]"               }`}
              />
            </Link>

            {/* SEARCH */}
            <form onSubmit={handleSearch} className="flex-1 max-w-[13rem] sm:max-w-sm lg:max-w-xl">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-3 pr-9 sm:pr-10 rounded-full border border-[#e2edf5] focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none transition-all duration-150 text-xs sm:text-sm text-gray-700 placeholder-gray-400 bg-[#f8fafc] ${
                    scrolled ? "py-1" : "py-1.5"
                  }`}
                  aria-label="Buscar productos"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label="Realizar búsqueda"
                >
                  <Search
                    className={`text-gray-500 hover:text-[#004D77] transition-all duration-150 ${
                      scrolled ? "w-3.5 h-3.5" : "w-4 h-4"
                    }`}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </form>

            {/* NAV DESKTOP */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <NavLink icon={Home} label="Inicio" to="/" active={isActive("/")} scrolled={scrolled} />
              <NavLink icon={Store} label="Tienda" to="/shop" active={isActive("/shop")} scrolled={scrolled} />
              <NavLink icon={Package} label="Pedidos" to="/orders-l" active={isActive("/orders-l")} scrolled={scrolled} />
            </nav>

            {/* ICONOS Y PERFIL */}
            <div className="flex items-center gap-1.5 sm:gap-1.5">
              <IconButton
                icon={Heart}
                to="/favorites"
                badge={favoritesCount}
                className="hidden sm:block"
                scrolled={scrolled}
                ariaLabel="Favoritos"
                active={isActive("/favorites")}
              />
              <IconButton
                icon={ShoppingCart}
                to="/cart"
                badge={cartCount}
                scrolled={scrolled}
                ariaLabel="Carrito"
                active={isActive("/cart")}
              />

              {/* PERFIL - Modal unificado */}
              <div className="relative hidden sm:block" ref={modalRef}>
                <button
                  onClick={() => setProfileModal(!profileModal)}
                  className={`relative rounded-full bg-[#004D77] hover:bg-[#003d5e] transition-all duration-150 cursor-pointer flex items-center justify-center font-bold text-white ${
                    scrolled ? "w-7 h-7 text-[0.68rem]" : "w-8 h-8 text-xs"
                  }`}
                  aria-label="Menú de perfil"
                  aria-expanded={profileModal}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span className={user?.avatarUrl ? "hidden" : "flex items-center justify-center w-full h-full"}>
                    {user ? getInitials(user?.name) : <User size={15} />}
                  </span>
                </button>

                {profileModal && (
                  <div
                    className="absolute right-0 top-full mt-2 w-60 sm:w-64 bg-white rounded-xl shadow-xl border border-[#e2edf5] z-50 overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menú de usuario"
                  >
                    {/* Cabecera unificada */}
                    <div className="flex flex-col items-center gap-1 px-4 py-3 border-b border-[#e2edf5]">
                      <div className="w-11 h-11 rounded-full bg-[#004D77] flex items-center justify-center text-white font-bold text-base mb-1 overflow-hidden">
                        {user ? (
                          user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(user.name)
                          )
                        ) : (
                          <UserCircle2 size={28} />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#004D77] text-center">
                        {user ? user.name : "Invitado"}
                      </p>
                      <p className="text-[0.68rem] text-[#004D77] break-all">
                        {user ? user.email : "No has iniciado sesión"}
                      </p>
                      <p className="text-[0.68rem] font-semibold text-slate-600 mt-0.5">
                        {user ? (user.role ?? "Cliente") : "Visitante"}
                      </p>
                    </div>

                    {/* Acciones - unificadas */}
                    <div className="py-1">
                      {user ? (
                        <>
                          {user.role && (
                            <button
                              onClick={handleGoToDashboard}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                              <LayoutDashboard size={16} />
                              Ir a Dashboard
                            </button>
                          )}
                          <Link
                            to="/perfil/editar"
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 transition-colors"
                          >
                            <SquarePen size={16} />
                            Editar Mi Perfil
                          </Link>
                          <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-500 hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                            {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#004D77] hover:bg-gray-100 transition-colors"
                          >
                            <LogIn size={16} />
                            Iniciar sesión
                          </Link>
                          <Link
                            to="/register"
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

              {/* MENU MOBILE */}
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-1.5 rounded-full hover:bg-[#004D77]/10 transition-colors"
                aria-label="Abrir menú móvil"
              >
                <Menu className="h-[18px] w-[18px] text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={mobileMenuRef}
            className="fixed top-0 right-0 w-64 h-full bg-white z-50 shadow-xl p-5 flex flex-col gap-4 animate-slide-in-right"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            <div className="flex justify-between items-center border-b border-[#e2edf5] pb-3">
              <span className="font-serif italic text-[#004D77] font-semibold">Menú</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              <MobileNavLink icon={Home} label="Inicio" to="/" onClick={() => setMenuOpen(false)} />
              <MobileNavLink icon={Store} label="Tienda" to="/shop" onClick={() => setMenuOpen(false)} />
              <MobileNavLink icon={Package} label="Pedidos" to="/orders-l" onClick={() => setMenuOpen(false)} />
              <MobileNavLink icon={Heart} label="Favoritos" to="/favorites" onClick={() => setMenuOpen(false)} badge={favoritesCount} />
              <MobileNavLink icon={ShoppingCart} label="Carrito" to="/cart" onClick={() => setMenuOpen(false)} badge={cartCount} />
              {!user && (
                <>
                  <MobileNavLink icon={LogIn} label="Iniciar sesión" to="/login" onClick={() => setMenuOpen(false)} />
                  <MobileNavLink icon={UserPlus} label="Registrarse" to="/register" onClick={() => setMenuOpen(false)} />
                </>
              )}
              {user && (
                <>
                  <MobileNavLink icon={SquarePen} label="Editar perfil" to="/perfil/editar" onClick={() => setMenuOpen(false)} />
                  {user.role && (
                    <MobileNavLink icon={LayoutDashboard} label="Dashboard" to="/admin" onClick={() => setMenuOpen(false)} />
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                    {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                  </button>
                </>
              )}
            </nav>
          </aside>
        </>
      )}

      <div className={`${scrolled ? "h-11 sm:h-12" : "h-14 sm:h-16"}`} />
    </>
  );
}

/* COMPONENTES AUXILIARES */

const NavLink = ({ icon: Icon, label, to, active, scrolled }) => (
  <Link
    to={to}
    className={`flex items-center gap-1.5 rounded-full transition-all duration-150 ${
      scrolled ? "px-2.5 py-1" : "px-3 py-1.5"
    } ${
      active
        ? "text-[#004D77] font-semibold bg-[#004D77]/10"
        : "text-gray-700 hover:text-[#004D77] hover:bg-[#004D77]/5"
    }`}
  >
    <Icon className={`${scrolled ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
    <span className={`${scrolled ? "text-[0.72rem]" : "text-[0.8rem]"}`}>{label}</span>
  </Link>
);

const IconButton = ({ icon: Icon, to, badge, className = "", scrolled, ariaLabel, active = false }) => (
  <Link
    to={to}
    className={`relative rounded-full flex items-center justify-center transition-colors ${
      scrolled ? "p-1.5" : "p-2"
    } ${
      active
        ? "bg-[#004D77]/10 text-[#004D77]"
        : "hover:bg-[#004D77]/10 text-gray-700"
    } ${className}`}
    aria-label={ariaLabel}
  >
    <Icon className={`${scrolled ? "w-3.5 h-3.5" : "h-[18px] w-[18px]"} ${active ? "text-[#004D77]" : "text-gray-700"}`} />
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-1">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
);

const MobileNavLink = ({ icon: Icon, label, to, onClick, badge }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-[#004D77] hover:bg-[#004D77]/5 rounded-xl transition-colors"
  >
    <Icon size={18} />
    <span className="flex-1">{label}</span>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
);

// Añadir animación CSS (puede ir en un archivo global o en este mismo componente)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slide-in-right {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`;
if (!document.head.querySelector("#mobile-menu-animation")) {
  styleSheet.id = "mobile-menu-animation";
  document.head.appendChild(styleSheet);
}

export default HeaderLanding;
