import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Home,
  Users,
  ShoppingBag,
  LayoutGrid,
  Package,
  Truck,
  ShoppingCart,
  RefreshCcw,
  ThumbsDown,
  DollarSign,
  ClipboardList,
  UserRound,
  Settings,
  ImagePlay,
  SlidersHorizontal,
  Menu,
  X,
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import PapeleriaMagicLogo from "../../assets/PapeleriaMagiclogo.png";

const ADMIN_BASE = "/admin";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation(); // 🔥 Detecta ruta actual automáticamente

  const navItems = [
    {
      label: "Inicio",
      icon: Home,
      href: `${ADMIN_BASE}`,
    },
    {
      label: "Usuarios",
      icon: Users,
      children: [
        { label: "Usuarios", href: `${ADMIN_BASE}/users`, icon: Users },
      ],
    },
    {
      label: "Compras",
      icon: ShoppingBag,
      children: [
        { label: "Categorías", href: `${ADMIN_BASE}/purchases/categories`, icon: LayoutGrid },
        { label: "Productos", href: `${ADMIN_BASE}/purchases/products`, icon: Package },
        { label: "Proveedores", href: `${ADMIN_BASE}/purchases/providers`, icon: Truck },
        { label: "Compras", href: `${ADMIN_BASE}/purchases`, icon: ShoppingBag },
        { label: "Devoluciones", href: `${ADMIN_BASE}/purchases/returns-p`, icon: RefreshCcw },
        { label: "Prod. no conforme", href: `${ADMIN_BASE}/purchases/non-conforming-products`, icon: ThumbsDown },
      ],
    },
    {
      label: "Ventas",
      icon: DollarSign,
      children: [
        { label: "Clientes", href: `${ADMIN_BASE}/sales/clients`, icon: UserRound },
        { label: "Pedidos", href: `${ADMIN_BASE}/sales/orders`, icon: ClipboardList },
        { label: "Ventas", href: `${ADMIN_BASE}/sales`, icon: ShoppingCart },
        { label: "Devoluciones", href: `${ADMIN_BASE}/sales/returns-s`, icon: RefreshCcw },
        { label: "Pagos y abonos", href: `${ADMIN_BASE}/sales/payments-and-credits`, icon: DollarSign },
      ],
    },
    {
      label: "Apariencia",
      icon: ImagePlay,
      children: [
        { label: "Carrusel", href: `${ADMIN_BASE}/appearance/carousel`, icon: ImagePlay },
      ],
    },
  ];

  const configChildren = [
    {
      label: "Gest. roles",
      href: `${ADMIN_BASE}/configuration/roles`,
      icon: SlidersHorizontal,
    },
  ];

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-3"
      >
        <Menu size={24} />
      </button>

      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          w-64 min-h-screen flex flex-col
          bg-[#F0F0F0] border-r border-slate-200
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header Logo */}
        <div className="px-4 pt-1 pb-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={PapeleriaMagicLogo}
                alt="Logo Papelería Magic"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-xl font-serif italic text-[#004D77] font-semibold">
                Papelería
              </h1>
              <h2 className="text-xl font-serif italic text-[#004D77] font-semibold">
                Magic
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 md:hidden"
          >
            <X size={20} />
          </button>

          <div className="mt-2 h-2px w-full bg-[#004D77]" />
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              children={item.children ?? []}
              activePath={pathname}
            />
          ))}
        </nav>

        {/* Configuración */}
        <div className="border-t border-slate-100 px-2 py-3">
          <SidebarItem
            icon={Settings}
            label="Configuración"
            href={`${ADMIN_BASE}/configuration`}
            children={configChildren}
            activePath={pathname}
          />

          <p className="text-[10px] text-slate-400 text-center mt-2">
            Powered by SeymsSoft © 2025
          </p>
        </div>
      </aside>
    </>
  );
}
