import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  children = [],
  openItem,
  setOpenItem,
}) {
  const { pathname } = useLocation();
  const submenuRef = useRef(null);

  const hasChildren = children.length > 0;
  const isOpen = openItem === label;

  const isActiveParent = children.some((child) =>
    pathname.startsWith(child.href)
  );

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
        className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer
          transition-all duration-300 ease-in-out
          ${
            isOpen
              ? "bg-[#004D77] text-white shadow-md"
              : "text-[#004D77] hover:bg-[#004D77] hover:text-white hover:shadow-md"
          }`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-current transition-colors duration-300" />}
          <span className="font-medium">{label}</span>
        </div>

        {hasChildren && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
          />
        )}
      </div>

      {/* SUBMENU con transición de altura */}
      {hasChildren && (
        <div
          ref={submenuRef}
          style={{
            maxHeight: isOpen ? `${submenuRef.current?.scrollHeight ?? 500}px` : "0px",
            opacity: isOpen ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.35s ease-in-out, opacity 0.3s ease-in-out",
          }}
        >
          <div className="ml-6 mt-2 flex flex-col gap-1 pb-1">
            {children.map((child) => {
              const isActiveChild = pathname === child.href;

              return (
                <Link
                  key={child.href}
                  to={child.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm
                    transition-all duration-300 ease-in-out
                    ${
                      isActiveChild
                        ? "bg-[#004D77]/20 text-[#004D77] font-semibold shadow-sm"
                        : "text-[#004D77] hover:bg-[#004D77]/20 hover:translate-x-1"
                    }`}
                >
                  {child.icon && (
                    <child.icon
                      size={18}
                      className="transition-transform duration-300"
                    />
                  )}
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}