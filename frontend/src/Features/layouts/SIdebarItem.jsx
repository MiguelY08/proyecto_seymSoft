import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function SidebarItem({
  icon: Icon,
  label,
  children = [],
  href = "#",
  active = false,
  activePath = "",
}) {
  const hasChildren = children.length > 0;
  const childIsActive =
    hasChildren && children.some((c) => c.href === activePath);

  const [open, setOpen] = useState(childIsActive);

  const handleClick = () => {
    if (hasChildren) {
      setOpen((prev) => !prev);
    }
  };

  return (
    <div>
      {/* Ítem principal */}
      <button
        onClick={handleClick}
        className={`
          relative w-full flex items-center justify-between px-3 py-2 rounded-lg
          text-sm font-medium transition-colors duration-150 group
          ${
            active || childIsActive
              ? "bg-gray-200 text-[#004D77]"
              : "text-[#004D77] hover:bg-gray-200 hover:text-[#004D77] cursor-pointer"
          }
        `}
      >
        <span className="flex items-center gap-2.5 pl-1">
          {Icon && (
            <Icon
              size={17}
              strokeWidth={1.8}
              color="#004D77"
            />
          )}
          <span>{label}</span>
        </span>

        {hasChildren && (
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={`shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Submenú */}
      {hasChildren && open && (
        <div className="ml-3 mt-0.5 mb-1 flex flex-col border-l-2 border-gray-200 pl-2">
          {children.map((child) => {
            const ChildIcon = child.icon;
            const childActive = child.href === activePath;

            return (
              <a
                key={child.label}
                href={child.href ?? "#"}
                className={`
                  flex items-center gap-2 px-2 py-1.5 rounded-md text-xs
                  transition-colors duration-150
                  ${
                    childActive
                      ? "text-[#004D77] font-semibold bg-gray-200"
                      : "text-[#004D77] hover:text-[#004D77] hover:bg-gray-200"
                  }
                `}
              >
                {ChildIcon && (
                  <ChildIcon
                    size={13}
                    strokeWidth={1.8}
                    color="#004D77"
                  />
                )}
                {child.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
