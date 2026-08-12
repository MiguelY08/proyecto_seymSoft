import { ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  children = [],
  openItem,
  setOpenItem,
  onNavigate,
  collapsed = false,
  onExpandSidebar,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActiveSingle = href && pathname === href;
  const hasChildren = children.length > 0;
  const isOpen = openItem === label;
  const isActiveParent = children.some((child) =>
    pathname.startsWith(child.href),
  );
  const isActive = isActiveParent || isActiveSingle;
  const isParentHighlighted = hasChildren ? isOpen : isActive;

  useEffect(() => {
    if (isActiveParent) {
      setOpenItem(label);
    }
  }, [isActiveParent, label, setOpenItem]);

  const handleClick = () => {
    if (hasChildren) {
      if (collapsed) {
        onExpandSidebar?.();
        setOpenItem(label);
        return;
      }

      setOpenItem(isOpen ? null : label);
    } else if (href) {
      setOpenItem(null);
      onNavigate?.();
      navigate(href);
    }
  };

  return (
    <div className={`group/item relative font-lexend text-[15px] ${collapsed ? "w-12" : "w-full"}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-label={collapsed ? label : undefined}
        className={`group flex w-full cursor-pointer items-center rounded-lg py-2 text-left
          transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98]
          ${collapsed ? "justify-center px-0" : "justify-between px-4"}
          ${
            isParentHighlighted
              ? "bg-[#004D77] text-white shadow-md"
              : "text-[#004D77] hover:bg-[#004D77]/10"
          }`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          {Icon && (
            <Icon
              size={20}
              className="text-current transition-transform duration-150 ease-out group-hover:scale-[1.06]"
            />
          )}
          {!collapsed && (
            <span className="font-medium transition-transform duration-150 ease-out group-hover:translate-x-px">
              {label}
            </span>
          )}
        </div>

        {hasChildren && !collapsed && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen
                ? "rotate-180 text-white"
                : ""
            }`}
          />
        )}
      </button>

      {collapsed && (
        <span
          className="pointer-events-none absolute left-full top-1/2 z-[70] ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-[#004D77]/15 bg-[#EAF5FB] px-3.5 py-2 text-xs font-semibold text-[#004D77] opacity-0 shadow-[0_14px_30px_rgba(0,77,119,0.18)] ring-1 ring-[#004D77]/10 transition-[opacity,transform] duration-[220ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-y-[7px] before:border-r-[8px] before:border-y-transparent before:border-r-[#EAF5FB] after:absolute after:left-0 after:top-1/2 after:h-6 after:w-1 after:-translate-y-1/2 after:rounded-r-full after:bg-[#004D77] group-hover/item:translate-x-1 group-hover/item:opacity-100"
          role="tooltip"
        >
          {label}
        </span>
      )}

      {hasChildren && !collapsed && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-[300ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            isOpen
              ? "grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`relative ml-5 flex flex-col gap-1 pb-1 pl-5 transition-[transform,margin] duration-[300ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] before:absolute before:left-2 before:top-1 before:bottom-2 before:w-px before:rounded-full before:bg-gradient-to-b before:from-[#004D77]/10 before:via-[#004D77]/45 before:to-[#004D77]/10 ${
                isOpen ? "mt-2 translate-y-0" : "mt-0 -translate-y-1"
              }`}
            >
                {children.map((child, index) => {
                const isActiveChild = pathname === child.href;

                return (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={() => onNavigate?.()}
                    style={{
                      transitionDelay: isOpen ? `${index * 30}ms` : "0ms",
                    }}
                    className={`group/child grid grid-cols-[8px_minmax(0,1fr)] items-center gap-2 px-2 py-0.5 text-sm
                      transition-[background-color,color,transform,opacity] duration-150 ease-out
                      ${
                        isActiveChild
                          ? "text-[#004D77] font-semibold"
                          : "text-[#004D77]"
                      } ${
                        isOpen
                          ? "translate-y-0 opacity-100"
                          : "-translate-y-1 opacity-0"
                      }`}
                  >
                    <span
                      className={`relative z-10 h-2 w-2 rounded-full bg-[#004D77] ring-4 ring-[#F0F0F0] transition-opacity duration-150 ${
                        isActiveChild
                          ? "animate-pulse opacity-100"
                          : "opacity-0 group-hover/child:opacity-35"
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`flex min-w-0 items-center gap-3 rounded-md px-2.5 py-1.5 transition-colors duration-150 ${
                        isActiveChild
                          ? "bg-[#004D77]/10"
                          : "group-hover/child:bg-[#004D77]/10"
                      }`}
                    >
                      {child.icon && (
                        <child.icon
                          size={18}
                          className="transition-transform duration-150 ease-out"
                        />
                      )}
                      <span className="min-w-0 truncate transition-transform duration-150">
                        {child.label}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
