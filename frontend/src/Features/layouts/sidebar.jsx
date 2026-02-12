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
} from "lucide-react";

import SidebarItem from "./SidebarItem";

export default function Sidebar({ activePath = "/" }) {

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
        { label: "Usuarios", href: "/usuarios", icon: Users },
      ],
    },
    {
      label: "Compras",
      icon: ShoppingBag,
      children: [
        { label: "Categorías", href: "/compras/categorias", icon: LayoutGrid },
        { label: "Productos", href: "/compras/productos", icon: Package },
        { label: "Proveedores", href: "/compras/proveedores", icon: Truck },
        { label: "Compras", href: "/compras", icon: ShoppingBag },
        { label: "Devoluciones", href: "/compras/devoluciones", icon: RefreshCcw },
        { label: "Prod. no conforme", href: "/compras/no-conforme", icon: ThumbsDown },
      ],
    },
    {
      label: "Ventas",
      icon: DollarSign,
      children: [
        { label: "Clientes", href: "/ventas/clientes", icon: UserRound },
        { label: "Pedidos", href: "/ventas/pedidos", icon: ClipboardList },
        { label: "Ventas", href: "/ventas", icon: ShoppingCart },
        { label: "Devoluciones", href: "/ventas/devoluciones", icon: RefreshCcw },
        { label: "Pagos y abonos", href: "/ventas/pagos", icon: DollarSign },
      ],
    },

    // 🔹 NUEVO MÓDULO INDEPENDIENTE
    {
      label: "Apariencia",
      icon: ImagePlay,
      children: [
        { label: "Carrusel", href: "/apariencia/carrusel", icon: ImagePlay },
      ],
    },
  ];

  const configChildren = [
    { label: "Gest. roles", href: "/configuracion/roles", icon: SlidersHorizontal },
  ];

  return (
    <aside className="w-48 min-h-screen flex flex-col bg-[#F0F0F0] border-r border-slate-200">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center overflow-hidden shrink-0">
          <span className="text-white text-xs font-bold">PM</span>
        </div>
        <span className="text-sm font-semibold text-blue-900 leading-tight">
          Papelería<br />Magic
        </span>
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
            active={!item.children && activePath === item.href}
            activePath={activePath}
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
          active={activePath === "/configuracion"}
          activePath={activePath}
        />

        <p className="text-[10px] text-slate-400 text-center mt-2">
          Powered by SeymsSoft © 2025
        </p>
      </div>
    </aside>
  );
}
