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
  LayoutDashboard,
  Tags,
  AlertTriangle,
  ReceiptText,
  CreditCard,
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import PapeleriaMagicLogo from "../../assets/PapeleriaMagiclogo.png";
import { usePermissions } from "../../Features/administrtivePanel/configuration/roles/hooks/usePermissions.js";

const ADMIN_BASE = "/admin";

export default function Sidebar() {
  const { hasPermission, permissions } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [openItem, setOpenItem] = useState(null);
  const { pathname } = useLocation();

  console.log("PERMISSIONS SIDEBAR:", permissions);

  const navItems = [
    {
      label: "Inicio",
      icon: Home,
      href: `${ADMIN_BASE}`,
    },
    hasPermission("dashboard.ver") && {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `${ADMIN_BASE}/dashboard`,
      permission: "dashboard.ver",
    },
    hasPermission("usuarios.ver") && {
      label: "Usuarios",
      icon: Users,
      permission: "usuarios.ver",
      children: [
        {
          label: "Usuarios",
          href: `${ADMIN_BASE}/users`,
          icon: Users,
          permission: "usuarios.ver",
        },
      ],
    },
    (
      hasPermission("categorias.ver") ||
      hasPermission("productos.ver") ||
      hasPermission("proveedores.ver") ||
      hasPermission("compras.ver") ||
      hasPermission("producto_no_conforme.ver") ||
      hasPermission("devoluciones_en_compras.ver")
    ) && {
      label: "Compras",
      icon: ShoppingBag,
      permission: "compras.ver",
      children: [
        hasPermission("categorias.ver") && {
          label: "Categorías",
          href: `${ADMIN_BASE}/purchases/categories`,
          icon: LayoutGrid,
          permission: "categorias.ver",
        },
        hasPermission("productos.ver") && {
          label: "Productos",
          href: `${ADMIN_BASE}/purchases/products`,
          icon: Package,
          permission: "productos.ver",
        },
        hasPermission("proveedores.ver") && {
          label: "Proveedores",
          href: `${ADMIN_BASE}/purchases/providers`,
          icon: Truck,
          permission: "proveedores.ver",
        },
        hasPermission("compras.ver") && {
          label: "Compras",
          href: `${ADMIN_BASE}/purchases`,
          icon: ShoppingBag,
          permission: "compras.ver",
        },
        hasPermission("devoluciones_en_compras.ver") && {
          label: "Devoluciones",
          href: `${ADMIN_BASE}/purchases/returns-p`,
          icon: RefreshCcw,
          permission: "devoluciones_en_compras.ver",
        },
        hasPermission("producto_no_conforme.ver") && {
          label: "Prod. no conforme",
          href: `${ADMIN_BASE}/purchases/non-conforming-products`,
          icon: ThumbsDown,
          permission: "producto_no_conforme.ver",
        },
      ].filter(Boolean),
    },
    (
      hasPermission("clientes.ver") ||
      hasPermission("ventas.ver") ||
      hasPermission("pedidos.ver") ||
      hasPermission("devoluciones_en_ventas.ver") ||
      hasPermission("pagos_y_abonos.ver")
    ) && {
      label: "Ventas",
      icon: DollarSign,
      permission: "ventas.ver",
      children: [
        hasPermission("clientes.ver") && {
          label: "Clientes",
          href: `${ADMIN_BASE}/sales/clients`,
          icon: UserRound,
          permission: "clientes.ver",
        },
        hasPermission("pedidos.ver") && {
          label: "Pedidos",
          href: `${ADMIN_BASE}/sales/orders`,
          icon: ClipboardList,
          permission: "pedidos.ver",
        },
        hasPermission("ventas.ver") && {
          label: "Ventas",
          href: `${ADMIN_BASE}/sales`,
          icon: ShoppingCart,
          permission: "ventas.ver",
        },
        hasPermission("devoluciones_en_ventas.ver") && {
          label: "Devoluciones",
          href: `${ADMIN_BASE}/sales/returns-s`,
          icon: RefreshCcw,
          permission: "devoluciones_en_ventas.ver",
        },
        hasPermission("pagos_y_abonos.ver") && {
          label: "Pagos y abonos",
          href: `${ADMIN_BASE}/sales/payments-and-credits`,
          icon: CreditCard,
          permission: "pagos_y_abonos.ver",
        },
      ].filter(Boolean),
    },
  ].filter(Boolean);

  const configChildren = [
    hasPermission("roles.ver") && {
      label: "Gest. roles",
      href: `${ADMIN_BASE}/configuration/roles`,
      icon: SlidersHorizontal,
      permission: "roles.ver",
    },
    hasPermission("banners.ver") && {
      label: "Banner",
      href: `${ADMIN_BASE}/configuration/banners`,
      icon: ImagePlay,
      permission: "banners.ver",
      children: [
        {
          label: "Banners",
          href: `${ADMIN_BASE}/appearance/banners`,
          icon: ImagePlay,
          permission: "banners.ver",
        },
      ],
    },
  ].filter(Boolean);

  return (
    <>
      {/* BOTÓN MÓVIL */}
      <button onClick={() => setIsOpen(true)} className="md:hidden p-3">
        <Menu size={24} />
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          font-lexend
          fixed md:static top-0 left-0 z-50
          w-64 min-h-screen flex flex-col
          bg-[#F0F0F0] border-r border-slate-200
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div className="px-1 pt-1 pb-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={PapeleriaMagicLogo}
                alt="Logo Papelería Magic"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-xl italic text-[#004D77] font-semibold">
                Papelería
              </h1>
              <h2 className="text-xl italic text-[#004D77] font-semibold">
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

          {/* FRANJA AZUL CORPORATIVA */}
          <div className="mt-3 h-[2px] w-full bg-[#004D77]" />
        </div>

        {/* NAV */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              children={item.children ?? []}
              openItem={openItem}
              setOpenItem={setOpenItem}
            />
          ))}
        </nav>

        {/* CONFIGURACIÓN */}
        {configChildren.length > 0 && (
          <div className="border-t border-slate-100 px-2 py-3">
            <SidebarItem
              icon={Settings}
              label="Configuración"
              href={`${ADMIN_BASE}/configuration`}
              children={configChildren}
              openItem={openItem}
              setOpenItem={setOpenItem}
            />

            <p className="text-[10px] text-slate-400 text-center mt-2">
              Powered by SeymsSoft © 2025
            </p>
          </div>
        )}
      </aside>
    </>
  );
}