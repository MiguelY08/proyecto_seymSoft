import { ChevronDown } from "lucide-react";

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  children = [],
  openItem,
  setOpenItem,
}) {
  const hasChildren = children.length > 0;
  const isOpen = openItem === label;

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
          {Icon && (
            <Icon size={20} className="text-current" />
          )}
          <span className="font-medium">{label}</span>
        </div>

        {hasChildren && (
          <ChevronDown
            size={16}
            color={isOpen ? "white" : "#004D77"}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* SUBMENU */}
      {hasChildren && isOpen && (
        <div className="ml-6 mt-2 flex flex-col gap-1">
          {children.map((child) => (
            <a
              key={child.href}
              href={child.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 text-[#004D77] hover:bg-[#004D77]/20"
            >
              {child.icon && <child.icon size={18} />}
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
