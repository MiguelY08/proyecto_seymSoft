import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  children = [],
  openItem,
  setOpenItem,
}) {
  const { pathname } = useLocation();

  const hasChildren = children.length > 0;
  const isOpen = openItem === label;

  const isActiveParent = children.some(child =>
    pathname.startsWith(child.href)
  );

  // 🔥 Abrir automáticamente si la ruta pertenece al padre
  useEffect(() => {
    if (isActiveParent) {
      setOpenItem(label);
    }
  }, [pathname]);

  const handleClick = () => {
    if (hasChildren) {
      setOpenItem(isOpen ? null : label);
    }
  };

  return (
    <div className="font-lexend text-[15px]">

      {/* ITEM PADRE */}
      <div
        onClick={handleClick}
        className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isOpen
            ? "bg-[#004D77] text-white"
            : "text-[#004D77] hover:bg-[#004D77] hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-current" />}
          <span className="font-medium">{label}</span>
        </div>

        {hasChildren && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
          />
        )}
      </div>

      {/* SUBMENU */}
      {hasChildren && isOpen && (
        <div className="ml-6 mt-2 flex flex-col gap-1">
          {children.map((child) => {

            const isActiveChild = pathname === child.href;

            return (
              <Link
                key={child.href}
                to={child.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isActiveChild
                    ? "bg-[#004D77]/20 text-[#004D77]"
                    : "text-[#004D77] hover:bg-[#004D77]/20"
                }`}
              >
                {child.icon && <child.icon size={18} />}
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}