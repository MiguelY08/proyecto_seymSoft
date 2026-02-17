import { ChevronDown, ImageIcon, UserCircle2, SquarePen, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function HeaderSidebar({
  sidebarOption = "Opción sidebar",
  submenuOption = "opción submenu",
  user = {
    name: "Yorman Alirio Ocampo Giraldo",
    email: "yorman123@gmail.com",
    role: "Administrador",
    avatarUrl: null,
  },
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shortName =
    user.name.length > 18 ? user.name.slice(0, 16) + "..." : user.name;

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-[#F0F0F0] border-b border-slate-200 shrink-0 font-lexend">

      {/* ── Breadcrumb ────────────────────────────────── */}
      <div className="flex items-center gap-2 text-slate-600 min-w-0">
        <div className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center bg-slate-50 shrink-0">
          <ImageIcon size={14} className="text-slate-400" />
        </div>

        <span className="text-xs sm:text-sm font-medium truncate">
          {sidebarOption}
          <span className="mx-1.5 text-slate-400">&gt;</span>
          {submenuOption}
        </span>
      </div>

      {/* ── Perfil de usuario ─────────────────────────── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-slate-500 shrink-0">
            {user.avatarUrl
              ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              )
              : <UserCircle2 size={26} strokeWidth={1.4} />
            }
          </div>

          {/* Nombre + rol (oculto en móvil pequeño) */}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-[#004D77] leading-tight">
              {shortName}
            </p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>

          <ChevronDown
            size={15}
            className={`text-slate-500 transition-transform duration-200 ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ── Dropdown ──────────────────────────────────── */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">

            {/* Cabecera dropdown */}
            <div className="flex flex-col items-center gap-1 px-5 py-5 bg-slate-50 border-b border-slate-200">
              <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden mb-1">
                {user.avatarUrl
                  ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  )
                  : <UserCircle2 size={48} strokeWidth={1.2} />
                }
              </div>

              <p className="text-sm font-semibold text-[#004D77] text-center leading-tight">
                {user.name}
              </p>

              <p className="text-xs text-[#004D77] break-all">
                {user.email}
              </p>

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
      </div>
    </header>
  );
}
