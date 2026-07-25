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
    <nav className="ml-auto hidden shrink-0 items-center gap-1 lg:flex xl:gap-1.5">
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
    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-all duration-150 xl:px-3.5 ${
      active
        ? "text-[#004D77] font-semibold bg-[#004D77]/10"
        : "text-gray-700 hover:text-[#004D77] hover:bg-[#004D77]/5"
    }`}
  >
    <Icon className="h-4 w-4" />
    <span className="text-[0.8rem] xl:text-[0.84rem]">
      {label}
    </span>
  </Link>
);

export default HeaderNav;
