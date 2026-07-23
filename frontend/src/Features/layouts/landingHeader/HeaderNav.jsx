import { Home, Package, Store } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
  {
    icon: Home,
    label: "Inicio",
    to: "/"
  },
  {
    icon: Store,
    label: "Tienda",
    to: "/shop"
  },
  {
    icon: Package,
    label: "Pedidos",
    to: "/orders-l"
  }
];

function HeaderNav({ isActive, showOrders = false }) {
  const visibleItems = NAV_ITEMS.filter((item) => (
    item.to !== "/orders-l" || showOrders
  ));

  return (
    <nav className="hidden lg:flex items-center gap-0.5">
      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          icon={item.icon}
          label={item.label}
          to={item.to}
          active={isActive(item.to)}
        />
      ))}
    </nav>
  );
}

const NavLink = ({
  icon: Icon,
  label,
  to,
  active
}) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-150 ${
      active
        ? "text-[#004D77] font-semibold bg-[#004D77]/10"
        : "text-gray-700 hover:text-[#004D77] hover:bg-[#004D77]/5"
    }`}
  >
    <Icon className="h-4 w-4" />
    <span className="text-[0.8rem]">
      {label}
    </span>
  </Link>
);

export default HeaderNav;
