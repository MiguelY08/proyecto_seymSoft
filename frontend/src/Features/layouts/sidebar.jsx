import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  Home, Users, ShoppingBag, LayoutGrid, Package, Truck,
  ShoppingCart, RefreshCcw, ThumbsDown, DollarSign,
  ClipboardList, UserRound, Settings, ImagePlay, SlidersHorizontal,
} from "lucide-react";

import Logo from "../../assets/PapeleriaMagicLogo.png";

// ─── SidebarItem ────────────────────────────────────────────────────────────
function SidebarItem({ icon: Icon, label, children = [], href = "#", isOpen, onToggle }) {
  const { pathname } = useLocation();
  const hasChildren   = children.length > 0;
  const isActive      = !hasChildren && pathname === href;
  const childIsActive = hasChildren && children.some((c) => c.href === pathname);

  return (
    <div>
      {/* Ítem principal */}
      {hasChildren ? (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer
            ${childIsActive ? "bg-gray-200 text-[#004D77]" : "text-[#004D77] hover:bg-gray-200"}
          `}
        >
          <span className="flex items-center gap-2.5 pl-1">
            {Icon && <Icon size={17} strokeWidth={1.8} color="#004D77" />}
            <span>{label}</span>
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      ) : (
        <Link
          to={href}
          className={`w-full flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
            ${isActive ? "bg-gray-200 text-[#004D77]" : "text-[#004D77] hover:bg-gray-200"}
          `}
        >
          {Icon && <Icon size={17} strokeWidth={1.8} color="#004D77" />}
          <span>{label}</span>
        </Link>
      )}

      {/* Submenú con animación */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-3 mt-0.5 mb-1 flex flex-col border-l-2 border-gray-200 pl-2">
          {children.map((child) => {
            const ChildIcon = child.icon;
            const childActive = child.href === pathname;
            return (
              <Link
                key={child.label}
                to={child.href ?? "#"}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors duration-150
                  ${childActive ? "text-[#004D77] font-semibold bg-gray-200" : "text-[#004D77] hover:bg-gray-200"}
                `}
              >
                {ChildIcon && <ChildIcon size={13} strokeWidth={1.8} color="#004D77" />}
                {child.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { pathname } = useLocation();

  const navItems = [
    {
      label: "Inicio",
      icon: Home,
      href: "/",
    },
    {
      label: "Usuarios",
      icon: Users,
      children: [
        { label: "Usuarios",          href: "/users",                              icon: Users        },
      ],
    },
    {
      label: "Compras",
      icon: ShoppingBag,
      children: [
        { label: "Categorías",        href: "/categories",               icon: LayoutGrid   },
        { label: "Productos",         href: "/products",                 icon: Package      },
        { label: "Proveedores",       href: "/providers",                icon: Truck        },
        { label: "Compras",           href: "/purchases",                          icon: ShoppingBag  },
        { label: "Devoluciones",      href: "/returns-p",                  icon: RefreshCcw   },
        { label: "Prod. no conforme", href: "/non-conforming-products",  icon: ThumbsDown   },
      ],
    },
    {
      label: "Ventas",
      icon: DollarSign,
      children: [
        { label: "Clientes",          href: "/clients",                      icon: UserRound    },
        { label: "Pedidos",           href: "/orders",                       icon: ClipboardList},
        { label: "Ventas",            href: "/sales",                              icon: ShoppingCart },
        { label: "Devoluciones",      href: "/returns-s",                      icon: RefreshCcw   },
        { label: "Pagos y abonos",    href: "/payments-and-credits",         icon: DollarSign   },
      ],
    },
    {
      label: "Apariencia",
      icon: ImagePlay,
      children: [
        { label: "Carrusel",          href: "/carousel",                icon: ImagePlay    },
      ],
    },
  ];

  const configChildren = [
    { label: "Gest. roles", href: "/roles", icon: SlidersHorizontal },
  ];

  const initialOpen = navItems.find(
    (item) => item.children?.some((c) => c.href === pathname)
  )?.label ?? null;

  const [openItem, setOpenItem]   = useState(initialOpen);
  const configIsActive            = configChildren.some((c) => c.href === pathname);
  const [configOpen, setConfigOpen] = useState(configIsActive);

  const handleToggle = (label) => {
    setOpenItem((prev) => (prev === label ? null : label));
  };

  const handleConfigToggle = () => {
    setOpenItem(null);
    setConfigOpen((prev) => !prev);
  };

  return (
    <aside className="w-48 min-h-screen flex flex-col bg-[#F0F0F0] border-r border-slate-200">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100 hover:bg-gray-200 transition-colors">
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
          <img src={Logo} alt="Logo Papelería Magic" className="w-full h-full object-cover" />
        </div>
        <span className="text-sm font-semibold text-[#004D77] leading-tight">
          Papelería<br />Magic
        </span>
      </Link>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            children={item.children ?? []}
            isOpen={openItem === item.label}
            onToggle={() => {
              handleToggle(item.label);
              setConfigOpen(false);
            }}
          />
        ))}
      </nav>

      {/* Configuración */}
      <div className="border-t border-slate-100 px-2 py-3">
        <SidebarItem
          icon={Settings}
          label="Configuración"
          href="/configuracion"
          children={configChildren}
          isOpen={configOpen}
          onToggle={handleConfigToggle}
        />
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Powered by SeymSoft © 2025
        </p>
      </div>
    </aside>
  );
};