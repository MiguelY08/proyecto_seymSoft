import { useState, useMemo } from "react";

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
  CreditCard,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import SidebarItem from "./SidebarItem";

import HorizontalLogo from "../../assets/PMLogo_Horizontal.png";

import {
  usePermissions
} from "../../Features/administrtivePanel/configuration/roles/hooks/usePermissions.js";

const ADMIN_BASE = "/admin";

export default function Sidebar() {

  const {
    hasPermission
  } = usePermissions();

  const [isOpen,setIsOpen] =
    useState(false);

  const [openItem,setOpenItem] =
    useState(null);

  const { pathname } =
    useLocation();

  // ─────────────────────────────
  // CONFIGURACIÓN DINÁMICA
  // ─────────────────────────────
  const sidebarConfig = [
    {
      label: "Inicio",
      icon: Home,
      href: `${ADMIN_BASE}`
    },
    {
      label: "Usuarios",
      icon: Users,
      permission: "usuarios.ver",
      children: [
        {
          label: "Usuarios",
          href: `${ADMIN_BASE}/users`,
          icon: Users,
          permission: "usuarios.ver"
        }
      ]
    },
    {
      label: "Compras",
      icon: ShoppingBag,
      children: [
        {
          label: "Categorías",
          href: `${ADMIN_BASE}/purchases/categories`,
          icon: LayoutGrid,
          permission: "categorias.ver"
        },
        {
          label: "Productos",
          href: `${ADMIN_BASE}/purchases/products`,
          icon: Package,
          permission: "productos.ver"
        },
        {
          label: "Proveedores",
          href: `${ADMIN_BASE}/purchases/providers`,
          icon: Truck,
          permission: "proveedores.ver"
        },
        {
          label: "Compras",
          href: `${ADMIN_BASE}/purchases`,
          icon: ShoppingBag,
          permission: "compras.ver"
        },
        {
          label: "Devoluciones",
          href: `${ADMIN_BASE}/purchases/returns-p`,
          icon: RefreshCcw,
          permission: "devoluciones_en_compras.ver"
        },
        {
          label: "Prod. no conforme",
          href: `${ADMIN_BASE}/purchases/non-conforming-products`,
          icon: ThumbsDown,
          permission: "producto_no_conforme.ver"
        }
      ]
    },
    {
      label: "Ventas",
      icon: DollarSign,
      children: [
        {
          label: "Clientes",
          href: `${ADMIN_BASE}/sales/clients`,
          icon: UserRound,
          permission: "clientes.ver"
        },
        {
          label: "Pedidos",
          href: `${ADMIN_BASE}/sales/orders`,
          icon: ClipboardList,
          permission: "pedidos.ver"
        },
        {
          label: "Ventas",
          href: `${ADMIN_BASE}/sales`,
          icon: ShoppingCart,
          permission: "ventas.ver"
        },
        {
          label: "Devoluciones",
          href: `${ADMIN_BASE}/sales/returns-s`,
          icon: RefreshCcw,
          permission: "devoluciones_en_ventas.ver"
        },
        {
          label: "Pagos y abonos",
          href: `${ADMIN_BASE}/sales/payments-and-credits`,
          icon: CreditCard,
          permission: "pagos_y_abonos.ver"
        }
      ]
    }
  ];

  // ─────────────────────────────
  // CONFIGURACIÓN
  // ─────────────────────────────
  const configItems = [
    {
      label: "Gest. roles",
      href: `${ADMIN_BASE}/configuration/roles`,
      icon: SlidersHorizontal,
      permission: "roles.ver"
    },
    {
      label: "Banner",
      href: `${ADMIN_BASE}/configuration/banners`,
      icon: ImagePlay,
      permission: "banners.ver"
    }
  ];

  // ─────────────────────────────
  // FILTRAR SIDEBAR
  // ─────────────────────────────
  const filteredSidebar =
    useMemo(() => {
      return sidebarConfig
        .map((item) => {

          // ITEM SIMPLE
          if (!item.children) {
            if (
              item.permission
              &&
              !hasPermission(item.permission)
            ) {
              return null;
            }
            return item;
          }

          // ITEM PADRE
          const allowedChildren =
            item.children.filter(
              (child) =>
                hasPermission(
                  child.permission
                )
            );

          // SI NO HAY HIJOS
          if (
            allowedChildren.length === 0
          ) {
            return null;
          }

          return {
            ...item,
            children:
              allowedChildren
          };
        })
        .filter(Boolean);
    }, [hasPermission]);

  // ─────────────────────────────
  // FILTRAR CONFIG
  // ─────────────────────────────
  const filteredConfig =
    configItems.filter(
      (item) =>
        hasPermission(
          item.permission
        )
    );

  return (
    <>
      {/* BOTÓN MOBILE */}
      <button
        onClick={() =>
          setIsOpen(true)
        }
        className="md:hidden p-3"
      >
        <Menu size={24} />
      </button>

      {/* OVERLAY */}
      {
        isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() =>
              setIsOpen(false)
            }
          />
        )
      }

      {/* SIDEBAR */}
      <aside
        className={`
          font-lexend
          fixed md:static top-0 left-0 z-50
          w-64 min-h-screen flex flex-col
          bg-[#F0F0F0]
          border-r border-slate-200
          transform transition-transform duration-300
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >

        {/* HEADER */}
        <div className="px-3 pt-3 pb-4 relative">
          <div className="flex items-center pr-8">
            <div className="h-20 w-full overflow-hidden">
              <img
                src={HorizontalLogo}
                alt="Logo Papelería Magic"
                className="h-full w-full object-contain object-left"
              />
            </div>
          </div>
          <button
            onClick={() =>
              setIsOpen(false)
            }
            className="absolute top-4 right-4 md:hidden"
          >
            <X size={20} />
          </button>
          <div className="mt-3 h-[2px] w-full bg-[#004D77]" />
        </div>

        {/* NAV */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {
            filteredSidebar.map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
                children={item.children ?? []}
                openItem={openItem}
                setOpenItem={setOpenItem}
              />
            ))
          }
        </nav>

        {/* CONFIG */}
        {
          filteredConfig.length > 0 && (
            <div className="border-t border-slate-100 px-2 py-3">
              <SidebarItem
                icon={Settings}
                label="Configuración"
                href={`${ADMIN_BASE}/configuration`}
                children={filteredConfig}
                openItem={openItem}
                setOpenItem={setOpenItem}
              />
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Powered by SeymsSoft © 2025
              </p>
            </div>
          )
        }
      </aside>
    </>
  );
}
