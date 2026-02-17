import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  children = [],
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  //  Activo exacto para Inicio
  const isExactActive = href === "/" ? currentPath === "/" : false;

  //  Activo normal (para items con href)
  const isActive = href && href !== "/" && currentPath.startsWith(href);

  //  Activo si algún hijo coincide
  const isChildActive =
    children.length > 0 &&
    children.some((child) => currentPath.startsWith(child.href));

  //  Estado final activo
  const isItemActive = isExactActive || isActive || isChildActive;

  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  //  Handler para items con y sin hijos
  const handleClick = () => {
    if (children.length > 0) {
      setOpen(!open);
    }
  };

  const ItemContent = () => (
    <>
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="font-medium">{label}</span>
      </div>
      {children.length > 0 && (
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      )}
    </>
  );

  return (
    <div className="font-lexend text-[15px]">
      {/* ITEM PRINCIPAL */}
      {href && children.length === 0 ? (
        // Item con link directo (sin hijos)
        <NavLink
          to={href}
          className={({ isActive }) =>
            `
            flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer
            transition-all duration-200
            ${
              isActive
                ? "bg-[#004D77]/15 text-[#004D77]"
                : "text-[#004D77] hover:bg-[#004D77] hover:text-white"

            }
          `
          }
        >
          <ItemContent />
        </NavLink>
      ) : (
        // Item con hijos o sin href
        <div
          onClick={handleClick}
          className={`
            flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer
            transition-all duration-200
            ${
              isItemActive || open
                ? "bg-[#004D77] text-white"
                : "text-[#004D77] hover:bg-[#004D77] hover:text-white"
            }
          `}
        >
          <ItemContent />
        </div>
      )}

      {/* SUBMENU */}
      {open && children.length > 0 && (
        <div className="ml-6 mt-1 flex flex-col gap-1">
          {children.map((child) => (
            <NavLink
              key={child.href}
              to={child.href}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#004D77] text-white"
                      : "text-slate-600 hover:bg-[#004D77]/10 hover:text-[#004D77]"
                  }
                `
              }
            >
              <child.icon size={16} />
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}