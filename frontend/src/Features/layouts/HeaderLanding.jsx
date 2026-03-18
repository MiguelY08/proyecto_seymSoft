import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Search, Home, Store, Package, Heart, ShoppingCart,
  Menu, SquarePen, LogOut, User, LogIn, UserPlus, X,
  UserCircle2, LayoutDashboard
} from "lucide-react";

import logo from "../../assets/PapeleriaMagicLogo.png";
import { useAuth } from "../access/context/AuthContext";
import { useAlert } from "../shared/alerts/useAlert";
import { useCart } from "../shared/Context/Cartcontext";
import { useFavorites } from "../shared/Context/Favoritescontext";

function HeaderLanding() {

  const { user, logout }  = useAuth();
  const { showConfirm }   = useAlert();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const navigate          = useNavigate();
  const location          = useLocation();

  const [searchQuery,   setSearchQuery]   = useState("");
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [profileModal,  setProfileModal]  = useState(false);

  const modalRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = useCallback(() => {
    logout();
    setProfileModal(false);
    navigate("/login");
  }, [logout, navigate]);

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

  // ── Scroll header ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Click fuera del modal ────────────────────────────────────────────────
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

  // ── Cerrar modal al cambiar ruta ─────────────────────────────────────────
  useEffect(() => {
    setProfileModal(false);
  }, [location]);

  // ── Iniciales ────────────────────────────────────────────────────────────
  const getInitials = useCallback((name) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 shadow-sm transition-all duration-150 backdrop-blur-md bg-white/85`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between gap-3 sm:gap-6 transition-all duration-150 ${
              scrolled ? "h-12 sm:h-14" : "h-16 sm:h-20"
            }`}
          >

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div
                className={`rounded-full overflow-hidden cursor-pointer transition-all duration-150 ${
                  scrolled ? "w-8 h-8 sm:w-12 sm:h-12" : "w-10 h-10 sm:w-20 sm:h-20"
                }`}
              >
                <img src={logo} alt="Logo Papelería Magic" className="w-full h-full object-cover" />
              </div>
              <h1
                className={`font-serif italic text-[#004D77] font-semibold tracking-tight hidden md:block transition-all duration-150 ${
                  scrolled ? "text-lg sm:text-xl" : "text-lg sm:text-2xl"
                }`}
              >
                Papelería Magic
              </h1>
            </Link>

            {/* SEARCH */}
            <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-2xl">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-3 sm:pl-4 pr-10 sm:pr-12 rounded-full border-2 border-gray-300 focus:border-[#004D77] focus:ring-4 focus:ring-[#004D77]/20 outline-none transition-all duration-150 text-sm sm:text-base text-gray-700 placeholder-gray-400 bg-white shadow-sm ${
                    scrolled ? "h-8 sm:h-9" : "h-9 sm:h-11"
                  }`}
                />
                <button className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <Search
                    className={`text-gray-500 hover:text-[#004D77] transition-all duration-150 ${
                      scrolled ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"
                    }`}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>

            {/* NAV DESKTOP */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink icon={Home}    label="Inicio"  to="/"        active={isActive("/")}        scrolled={scrolled} />
              <NavLink icon={Store}   label="Tienda"  to="/shop"    active={isActive("/shop")}    scrolled={scrolled} />
              <NavLink icon={Package} label="Pedidos" to="/orders-l" active={isActive("/orders-l")} scrolled={scrolled} />
            </nav>

            {/* ICONOS */}
            <div className="flex items-center gap-1 sm:gap-2">

              <IconButton icon={Heart}        to="/favorites" badge={favoritesCount} className="hidden sm:block" scrolled={scrolled} />
              <IconButton icon={ShoppingCart} to="/cart"      badge={cartCount} scrolled={scrolled} />

              {/* PERFIL */}
              <div className="relative hidden sm:block" ref={modalRef}>

                {user ? (
                  <>
                    <button
                      onClick={() => setProfileModal(!profileModal)}
                      className={`relative rounded-full bg-[#004D77] hover:bg-[#003d5e] transition-all duration-150 cursor-pointer flex items-center justify-center font-bold text-white ${
                        scrolled ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm"
                      }`}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        getInitials(user?.name) || <UserCircle2 size={18} />
                      )}
                    </button>

                    {profileModal && (
                      <div className="absolute right-0 top-full mt-3 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">

                        {/* Cabecera */}
                        <div className="flex flex-col items-center gap-1 px-5 py-5 bg-slate-50 border-b border-slate-200">
                          <div className="w-14 h-14 rounded-full bg-[#004D77] flex items-center justify-center text-white font-bold text-xl mb-1 overflow-hidden">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} />
                            ) : (
                              getInitials(user?.name)
                            )}
                          </div>
                          <p className="text-sm font-semibold text-[#004D77] text-center">
                            {user.name || "Usuario"}
                          </p>
                          <p className="text-xs text-[#004D77] break-all">
                            {user.email}
                          </p>
                          <p className="text-xs font-semibold text-slate-600 mt-0.5">
                            {user.role ?? "Cliente"}
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="py-1.5">

                          {/* Ir a Dashboard — solo con rol */}
                          {user?.role && (
                            <button
                              onClick={handleGoToDashboard}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#004D77] hover:bg-gray-100 cursor-pointer"
                            >
                              <LayoutDashboard size={16} />
                              Ir a Dashboard
                            </button>
                          )}

                          <Link
                            to="/perfil/editar"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#004D77] hover:bg-gray-100"
                          >
                            <SquarePen size={16} />
                            Editar Mi Perfil
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            <LogOut size={16} />
                            Cerrar sesión
                          </button>

                        </div>
                      </div>
                    )}
                  </>

                ) : (
                  <>
                    <button
                      onClick={() => setProfileModal(!profileModal)}
                      className={`rounded-full hover:bg-[#004D77]/10 transition-all duration-150 flex items-center justify-center ${
                        scrolled ? "p-2" : "p-2.5"
                      }`}
                    >
                      <User className="w-5 h-5 text-gray-700" />
                    </button>

                    {profileModal && (
                      <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between">
                          <span className="text-sm font-semibold text-gray-700">Mi cuenta</span>
                          <button onClick={() => setProfileModal(false)}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                          <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#004D77]/10">
                            <LogIn className="w-5 h-5" />
                            Iniciar sesión
                          </Link>
                          <Link to="/register" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#004D77]/10">
                            <UserPlus className="w-5 h-5" />
                            Registrarse
                          </Link>
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* MENU MOBILE */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-[#004D77]/10"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>

            </div>
          </div>
        </div>
      </header>

      <div className={`${scrolled ? "h-12 sm:h-14" : "h-16 sm:h-20"}`} />
    </>
  );
}

/* COMPONENTES */

const NavLink = ({ icon: Icon, label, to, active, scrolled }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 rounded-lg transition-all ${
      scrolled ? "px-3 py-1.5" : "px-4 py-2"
    } ${
      active
        ? "text-[#004D77] font-semibold bg-[#004D77]/10"
        : "text-gray-700 hover:text-[#004D77] hover:bg-[#004D77]/5"
    }`}
  >
    <Icon className={`${scrolled ? "w-4 h-4" : "w-5 h-5"}`} />
    <span className={`${scrolled ? "text-xs" : "text-sm"}`}>{label}</span>
  </Link>
);

const IconButton = ({ icon: Icon, to, badge, className = "", scrolled }) => (
  <Link
    to={to}
    className={`relative rounded-full hover:bg-[#004D77]/10 flex items-center justify-center ${
      scrolled ? "p-2" : "p-2.5"
    } ${className}`}
  >
    <Icon className={`${scrolled ? "w-4 h-4" : "w-5 h-5"} text-gray-700`} />
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
);

export default HeaderLanding;