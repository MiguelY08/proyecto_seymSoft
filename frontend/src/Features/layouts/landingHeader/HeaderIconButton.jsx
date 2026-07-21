import { Link } from "react-router-dom";

function HeaderIconButton({
  icon: Icon,
  to,
  badge,
  className = "",
  active = false,
  ariaLabel
}) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center justify-center rounded-full p-2 transition-colors ${
        active
          ? "bg-[#004D77]/10 text-[#004D77]"
          : "hover:bg-[#004D77]/10 text-gray-700"
      } ${className}`}
    >
      <Icon
        className={`h-[18px] w-[18px] ${
          active
            ? "text-[#004D77]"
            : "text-gray-700"
        }`}
      />
      {
        badge > 0
        &&
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-1">
          {
            badge > 99
            ? "99+"
            : badge
          }
        </span>
      }
    </Link>
  );
}

export default HeaderIconButton;
