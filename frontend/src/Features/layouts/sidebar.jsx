import { useEffect, useState } from "react";

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

import SidebarItem from "./SIdebarItem";

import HorizontalLogo from "../../assets/PMLogo_Horizontal.png";

import {
  usePermissions
} from "../../Features/administrtivePanel/configuration/roles/hooks/usePermissions.js";

const ADMIN_BASE = "/admin";

export default function Sidebar() {
  const { hasPermission } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [openItem, setOpenItem] = useState(null);
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
      href: `${ADMIN_BASE}/users`
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
      sidebarConfig
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
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-3 top-3 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[#004D77] transition-colors hover:bg-[#004D77]/10 md:hidden"
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
      >
        <Menu size={24} />
      </button>

      {/* OVERLAY */}
      {
        isOpen && (
          <div
            role="presentation"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )
      }

      {/* SIDEBAR */}
      <aside
        aria-label="Menú principal"
        className={`
          font-lexend
          fixed md:static top-0 left-0 z-50
          h-dvh w-64 max-w-[85vw] md:h-screen md:max-w-none flex flex-col
          bg-[#F0F0F0]
          border-r border-slate-200
          shadow-xl md:shadow-none
          transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
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
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#004D77] transition-colors hover:bg-[#004D77]/10 md:hidden"
            aria-label="Cerrar menú de navegación"
          >
            <X size={20} />
          </button>
          <div className="mx-2 mt-2 h-px rounded-full bg-gradient-to-r from-transparent via-[#004D77]/25 to-transparent" />
        </div>

        {/* NAV */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto overscroll-contain">
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
                onNavigate={() => setIsOpen(false)}
              />
            ))
          }
        </nav>

        {/* CONFIG */}
        {
          filteredConfig.length > 0 && (
            <div className="px-2 pb-3 pt-1">
              <div className="mx-2 mb-3 h-px rounded-full bg-gradient-to-r from-transparent via-[#004D77]/25 to-transparent" />
              <SidebarItem
                icon={Settings}
                label="Configuración"
                href={`${ADMIN_BASE}/configuration`}
                children={filteredConfig}
                openItem={openItem}
                setOpenItem={setOpenItem}
                onNavigate={() => setIsOpen(false)}
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

