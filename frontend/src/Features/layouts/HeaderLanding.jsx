import React, { useState, useEffect } from "react";
import {
  Search,
  Home,
  Store,
  Package,
  Heart,
  ShoppingCart,
  User,
  Menu,
} from "lucide-react";
import logo from "../../assets/PapeleriaMagicLogo.png";

function HeaderLanding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 shadow-sm transition-all duration-150 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md"
            : "bg-linear-to-r from-slate-50 to-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between gap-3 sm:gap-6 transition-all duration-150 ${
              scrolled ? "h-12 sm:h-14" : "h-16 sm:h-20"
            }`}
          >
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div
                className={`rounded-full overflow-hidden cursor-pointer transition-all duration-150 ${
                  scrolled
                    ? "w-8 h-8 sm:w-12 sm:h-12"
                    : "w-10 h-10 sm:w-20 sm:h-20"
                }`}
              >
                <img
                  src={logo}
                  alt="Logo Papelería Magic"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1
                className={`font-serif italic text-blue-900 font-semibold tracking-tight hidden md:block transition-all duration-150 ${
                  scrolled ? "text-lg sm:text-xl" : "text-lg sm:text-2xl"
                }`}
              >
                Papelería Magic
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-2xl">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-3 sm:pl-4 pr-10 sm:pr-12 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-150 text-sm sm:text-base text-gray-700 placeholder-gray-400 bg-white shadow-sm ${
                    scrolled ? "h-8 sm:h-9" : "h-9 sm:h-11"
                  }`}
                />
                <button className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <Search
                    className={`text-gray-500 hover:text-blue-600 transition-all duration-150 ${
                      scrolled
                        ? "w-3.5 h-3.5 sm:w-4 sm:h-4"
                        : "w-4 h-4 sm:w-5 sm:h-5"
                    }`}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink
                icon={Home}
                label="Inicio"
                active={activeNav === "Inicio"}
                onClick={() => setActiveNav("Inicio")}
                scrolled={scrolled}
              />
              <NavLink
                icon={Store}
                label="Tienda"
                active={activeNav === "Tienda"}
                onClick={() => setActiveNav("Tienda")}
                scrolled={scrolled}
              />
              <NavLink
                icon={Package}
                label="Pedidos"
                active={activeNav === "Pedidos"}
                onClick={() => setActiveNav("Pedidos")}
                scrolled={scrolled}
              />
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <IconButton
                icon={Heart}
                badge={8}
                className="hidden sm:block"
                scrolled={scrolled}
              />
              <IconButton icon={ShoppingCart} badge={0} scrolled={scrolled} />
              <IconButton
                icon={User}
                className="hidden sm:block"
                scrolled={scrolled}
              />

              {/* Menu hamburguesa - Mobile/Tablet */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Menu
                  className={`text-gray-700 transition-all duration-150 ${
                    scrolled ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6"
                  }`}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Navigation Links - Mobile/Tablet */}
          {menuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-3">
              <nav className="flex flex-col gap-2">
                <NavLinkMobile
                  icon={Home}
                  label="Inicio"
                  active={activeNav === "Inicio"}
                  onClick={() => {
                    setActiveNav("Inicio");
                    setMenuOpen(false);
                  }}
                />
                <NavLinkMobile
                  icon={Store}
                  label="Tienda"
                  active={activeNav === "Tienda"}
                  onClick={() => {
                    setActiveNav("Tienda");
                    setMenuOpen(false);
                  }}
                />
                <NavLinkMobile
                  icon={Package}
                  label="Pedidos"
                  active={activeNav === "Pedidos"}
                  onClick={() => {
                    setActiveNav("Pedidos");
                    setMenuOpen(false);
                  }}
                />
              </nav>

              {/* Action Icons adicionales en mobile */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200">
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                  <Heart className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm">Favoritos (8)</span>
                </button>
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                  <User className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm">Perfil</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer para evitar que el contenido quede debajo del header */}
      <div
        className={`transition-all duration-150 ${scrolled ? "h-12 sm:h-14" : "h-16 sm:h-20"}`}
      ></div>
    </>
  );
}

const NavLink = ({ icon: Icon, label, active, onClick, scrolled }) => {
  return (
    <a
      onClick={onClick}
      className={`
        flex items-center gap-2 rounded-lg transition-all duration-200 cursor-pointer
        ${scrolled ? "px-3 py-1.5" : "px-4 py-2"}
        ${
          active
            ? "text-blue-700 font-semibold bg-blue-100"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }
      `}
    >
      <Icon
        className={`transition-all duration-150 ${scrolled ? "w-4 h-4" : "w-5 h-5"}`}
        strokeWidth={active ? 2.5 : 2}
      />
      <span
        className={`transition-all duration-150 ${scrolled ? "text-xs" : "text-sm"}`}
      >
        {label}
      </span>
    </a>
  );
};

const NavLinkMobile = ({ icon: Icon, label, active, onClick }) => {
  return (
    <a
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
        ${
          active
            ? "text-blue-700 font-semibold bg-blue-100"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }
      `}
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
      <span className="text-base">{label}</span>
    </a>
  );
};

const IconButton = ({ icon: Icon, badge, className = "", scrolled }) => {
  return (
    <button
      className={`relative rounded-full hover:bg-blue-50 transition-all duration-150 group cursor-pointer ${
        scrolled ? "p-1.5 sm:p-2" : "p-2 sm:p-2.5"
      } ${className}`}
    >
      <Icon
        className={`text-gray-700 group-hover:text-blue-600 transition-all duration-150 ${
          scrolled ? "w-4 h-4" : "w-5 h-5"
        }`}
        strokeWidth={2}
      />
      {badge !== undefined && badge > 0 && (
        <span
          className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white transition-all duration-150 ${
            scrolled ? "w-3.5 h-3.5 text-[9px]" : "w-4 h-4 sm:w-5 sm:h-5"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default HeaderLanding;
