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
      setOpenItem(isOpen ? null : label);
    } else if (href) {
      setOpenItem(null);
      onNavigate?.();
      navigate(href);
    }
  };

  return (
    <div className="font-lexend text-[15px]">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={hasChildren ? isOpen : undefined}
        className={`group flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-left
          transition-[background-color,color,box-shadow] duration-200 ease-out
          ${
            isParentHighlighted
              ? "bg-[#004D77] text-white shadow-md"
              : "text-[#004D77] hover:bg-[#004D77]/10"
          }`}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              size={20}
              className="text-current transition-transform duration-200 ease-out group-hover:scale-[1.04]"
            />
          )}
          <span className="font-medium transition-transform duration-200 ease-out group-hover:translate-x-px">
            {label}
          </span>
        </div>

        {hasChildren && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isOpen
                ? "rotate-180 text-white"
                : ""
            }`}
          />
        )}
      </button>

      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isOpen
              ? "grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`ml-6 flex flex-col gap-1 pb-1 transition-[transform,margin] duration-250 ease-out ${
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
                      transitionDelay: isOpen ? `${index * 35}ms` : "0ms",
                    }}
                    className={`group/child grid grid-cols-[8px_minmax(0,1fr)] items-center gap-2 px-3 py-0.5 text-sm
                      transition-[background-color,color,transform,opacity] duration-200 ease-out
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
                      className={`h-2 w-2 rounded-full bg-[#004D77] transition-opacity duration-200 ${
                        isActiveChild
                          ? "animate-pulse opacity-100"
                          : "opacity-0 group-hover/child:opacity-35"
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`flex min-w-0 items-center gap-3 rounded-md px-2.5 py-1.5 transition-colors duration-200 ${
                        isActiveChild
                          ? "bg-[#004D77]/10"
                          : "group-hover/child:bg-[#004D77]/10"
                      }`}
                    >
                      {child.icon && (
                        <child.icon
                          size={18}
                          className="transition-transform duration-200 ease-out"
                        />
                      )}
                      <span className="min-w-0 truncate transition-transform duration-200">
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
