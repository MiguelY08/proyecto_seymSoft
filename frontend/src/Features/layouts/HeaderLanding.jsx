import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Home,
  Store,
  Package,
  Heart,
  ShoppingCart,
  Menu,
  SquarePen,
  LogOut,
  User,
  LogIn,
  UserPlus,
  X
} from "lucide-react";
import logo from "../../assets/PapeleriaMagicLogo.png";

// ─── Usuario hardcodeado para pruebas ────────────────────────────────────────
const testUser = {
  name:      "Yorman Alirio Ocampo Giraldo",
  email:     "yorman123@gmail.com",
  role:      "Administrador",
  avatarUrl: null,
  initials:  "YO",
};

function HeaderLanding() {
  const [searchQuery,   setSearchQuery]   = useState("");
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [profileModal,  setProfileModal]  = useState(false);
  const modalRef  = useRef(null);
  const location  = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setProfileModal(false);
      }
    };
    if (profileModal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileModal]);

  useEffect(() => {
    setProfileModal(false);
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 shadow-sm transition-all duration-150 backdrop-blur-md ${
          scrolled ? "bg-white/85" : "bg-white/85"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between gap-3 sm:gap-6 transition-all duration-150 ${
              scrolled ? "h-12 sm:h-14" : "h-16 sm:h-20"
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className={`rounded-full overflow-hidden cursor-pointer transition-all duration-150 ${scrolled ? "w-8 h-8 sm:w-12 sm:h-12" : "w-10 h-10 sm:w-20 sm:h-20"}`}>
                <img src={logo} alt="Logo Papelería Magic" className="w-full h-full object-cover" />
              </div>
              <h1 className={`font-serif italic text-[#004D77] font-semibold tracking-tight hidden md:block transition-all duration-150 ${scrolled ? "text-lg sm:text-xl" : "text-lg sm:text-2xl"}`}>
                Papelería Magic
              </h1>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-2xl">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-3 sm:pl-4 pr-10 sm:pr-12 rounded-full border-2 border-gray-300 focus:border-[#004D77] focus:ring-4 focus:ring-[#004D77]/20 outline-none transition-all duration-150 text-sm sm:text-base text-gray-700 placeholder-gray-400 bg-white shadow-sm ${scrolled ? "h-8 sm:h-9" : "h-9 sm:h-11"}`}
                />
                <button className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <Search
                    className={`text-gray-500 hover:text-[#004D77] transition-all duration-150 ${scrolled ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"}`}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>

            {/* Nav Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink icon={Home}    label="Inicio"  to="/"        active={isActive("/")}        scrolled={scrolled} />
              <NavLink icon={Store}   label="Tienda"  to="/shop"    active={isActive("/shop")}    scrolled={scrolled} />
              <NavLink icon={Package} label="Pedidos" to="/orders-l" active={isActive("/orders-l")} scrolled={scrolled} />
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <IconButton icon={Heart}        to="/favorites" badge={0} className="hidden sm:block" scrolled={scrolled} />
              <IconButton icon={ShoppingCart} to="/cart"      badge={0} scrolled={scrolled} />

              {/* ── Perfil: versión SESIÓN INICIADA (pruebas) ─────────────── */}
              {/* <div className="relative hidden sm:block" ref={modalRef}>
                <button
                  onClick={() => setProfileModal(!profileModal)}
                  className={`relative rounded-full bg-[#004D77] hover:bg-[#003d5e] transition-all duration-150 cursor-pointer flex items-center justify-center font-bold text-white ${
                    scrolled ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm"
                  }`}
                >
                  {testUser.initials}
                </button>

                {profileModal && (
                  <div className="absolute right-0 top-full mt-3 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">

                    <div className="flex flex-col items-center gap-1 px-5 py-5 bg-slate-50 border-b border-slate-200">
                      <div className="w-14 h-14 rounded-full bg-[#004D77] flex items-center justify-center text-white font-bold text-xl mb-1">
                        {testUser.initials}
                      </div>
                      <p className="text-sm font-semibold text-[#004D77] text-center leading-tight">
                        {testUser.name}
                      </p>
                      <p className="text-xs text-[#004D77] break-all">
                        {testUser.email}
                      </p>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {testUser.role}
                      </p>
                    </div>

                    <div className="py-1.5">
                      <a
                        href="/perfil/editar"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#004D77] hover:bg-gray-100 transition-colors"
                      >
                        <SquarePen size={16} strokeWidth={1.8} />
                        Editar Mi Perfil
                      </a>
                      <button
                        onClick={() => {}}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} strokeWidth={1.8} />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div> */}

              {/* ── Perfil: versión SIN SESIÓN (original — comentado) ──────── */}
              <div className="relative hidden sm:block" ref={modalRef}>
                <button
                  onClick={() => setProfileModal(!profileModal)}
                  className={`relative rounded-full hover:bg-[#004D77]/10 transition-all duration-150 group cursor-pointer flex items-center justify-center ${
                    scrolled ? "p-1.5 sm:p-2" : "p-2 sm:p-2.5"
                  } ${profileModal ? "bg-[#004D77]/10" : ""}`}
                >
                  <User
                    className={`transition-all duration-150 ${
                      profileModal ? "text-[#004D77]" : "text-gray-700 group-hover:text-[#004D77]"
                    } ${scrolled ? "w-4 h-4" : "w-5 h-5"}`}
                    strokeWidth={2}
                  />
                </button>

                {profileModal && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Mi cuenta</span>
                      <button
                        onClick={() => setProfileModal(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link
                        to="/login"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#004D77]/10 hover:text-[#004D77] transition-all duration-200 cursor-pointer group"
                      >
                        <LogIn className="w-5 h-5 text-gray-400 group-hover:text-[#004D77] transition-colors" strokeWidth={2} />
                        <div>
                          <p className="text-sm font-semibold">Iniciar sesión</p>
                          <p className="text-[10px] text-gray-400">Accede a tu cuenta</p>
                        </div>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#004D77]/10 hover:text-[#004D77] transition-all duration-200 cursor-pointer group"
                      >
                        <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-[#004D77] transition-colors" strokeWidth={2} />
                        <div>
                          <p className="text-sm font-semibold">Registrarse</p>
                          <p className="text-[10px] text-gray-400">Crea una cuenta nueva</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              {/* ─────────────────────────────────────────────────────────────── */}

              {/* Menú hamburguesa */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-[#004D77]/10 transition-colors cursor-pointer"
              >
                <Menu className={`text-gray-700 transition-all duration-150 ${scrolled ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6"}`} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Nav Mobile */}
          {menuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-3">
              <nav className="flex flex-col gap-2">
                <NavLinkMobile icon={Home}    label="Inicio"  to="/"        active={isActive("/")}        onClick={() => setMenuOpen(false)} />
                <NavLinkMobile icon={Store}   label="Tienda"  to="/shop"    active={isActive("/shop")}    onClick={() => setMenuOpen(false)} />
                <NavLinkMobile icon={Package} label="Pedidos" to="/orders-l" active={isActive("/orders-l")} onClick={() => setMenuOpen(false)} />
              </nav>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200">
                <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-[#004D77] transition-colors cursor-pointer">
                  <Heart className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm">Favoritos</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer */}
      <div className={`transition-all duration-150 ${scrolled ? "h-12 sm:h-14" : "h-16 sm:h-20"}`} />
    </>
  );
}

const NavLink = ({ icon: Icon, label, to, active, scrolled }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 rounded-lg transition-all duration-200 cursor-pointer ${scrolled ? "px-3 py-1.5" : "px-4 py-2"} ${
      active ? "text-[#004D77] font-semibold bg-[#004D77]/10" : "text-gray-700 hover:text-[#004D77] hover:bg-[#004D77]/5"
    }`}
  >
    <Icon className={`transition-all duration-150 ${scrolled ? "w-4 h-4" : "w-5 h-5"}`} strokeWidth={active ? 2.5 : 2} />
    <span className={`transition-all duration-150 ${scrolled ? "text-xs" : "text-sm"}`}>{label}</span>
  </Link>
);

const NavLinkMobile = ({ icon: Icon, label, to, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
      active ? "text-[#004D77] font-semibold bg-[#004D77]/10" : "text-gray-700 hover:text-[#004D77] hover:bg-[#004D77]/5"
    }`}
  >
    <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
    <span className="text-base">{label}</span>
  </Link>
);

const IconButton = ({ icon: Icon, to, badge, className = "", scrolled }) => (
  <Link
    to={to}
    className={`relative rounded-full hover:bg-[#004D77]/10 transition-all duration-150 group cursor-pointer flex items-center justify-center ${
      scrolled ? "p-1.5 sm:p-2" : "p-2 sm:p-2.5"
    } ${className}`}
  >
    <Icon className={`text-gray-700 group-hover:text-[#004D77] transition-all duration-150 ${scrolled ? "w-4 h-4" : "w-5 h-5"}`} strokeWidth={2} />
    {badge !== undefined && badge > 0 && (
      <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white transition-all duration-150 ${scrolled ? "w-3.5 h-3.5 text-[9px]" : "w-4 h-4 sm:w-5 sm:h-5"}`}>
        {badge}
      </span>
    )}
  </Link>
);

export default HeaderLanding;