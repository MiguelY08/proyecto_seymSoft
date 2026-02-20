import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown, UserCircle2, SquarePen, LogOut } from "lucide-react";

export default function HeaderSidebar({
  user = {
    name: "Yorman Alirio Ocampo Giraldo",
    email: "yorman123@gmail.com",
    role: "Administrador",
    avatarUrl: null,
  },
}) {
  const location = useLocation();
  const { pathname } = location;

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔹 Cerrar dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Convertir ruta a breadcrumb automático
  const segments = pathname.split("/").filter(Boolean);

  const formatText = (text) =>
    text.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const moduleName = segments[1] ? formatText(segments[1]) : "Inicio";
  const subModuleName = segments[2] ? formatText(segments[2]) : "";

  const shortName =
    user.name.length > 18 ? user.name.slice(0, 16) + "..." : user.name;

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 md:px-6 bg-[#F0F0F0] border-b border-slate-200 font-lexend">
      {/* ───────── Breadcrumb Responsive ───────── */}
      <div className="flex items-center gap-2 text-[#004D77] text-sm md:text-base font-medium truncate">
        <span className="truncate">{moduleName}</span>
        {subModuleName && (
          <>
            <span className="text-slate-400 hidden sm:block">/</span>
            <span className="truncate hidden sm:block">{subModuleName}</span>
          </>
        )}
      </div>

      {/* ───────── Perfil Usuario ───────── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-slate-500">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle2 size={26} strokeWidth={1.5} />
            )}
          </div>

          {/* Nombre oculto en móvil */}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[#004D77] leading-tight">
              {shortName}
            </p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>

          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ───────── Dropdown Grande (EL TUYO) ───────── */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden ">
            {/* Cabecera dropdown */}
            <div className="flex flex-col items-center gap-1 px-5 py-5 bg-slate-50 border-b border-slate-200 ">
              <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden mb-1 ">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle2 size={48} strokeWidth={1.2} />
                )}
              </div>

              <p className="text-sm font-semibold text-[#004D77] text-center leading-tight">
                {user.name}
              </p>

              <p className="text-xs text-[#004D77] break-all">{user.email}</p>

              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {user.role}
              </p>
            </div>

            {/* Acciones */}
            <div className="py-1.5">
              <a
                href="/perfil/editar"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#004D77] hover:bg-gray-200 transition-colors"
              >
                <SquarePen size={16} strokeWidth={1.8} />
                Editar Mi Perfil
              </a>

              <Link to="/login">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={16} strokeWidth={1.8} />
                  Cerrar sesión
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
