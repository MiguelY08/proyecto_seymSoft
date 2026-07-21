import { Link } from "react-router-dom";

function MobileNavLink({
  icon: Icon,
  label,
  to,
  active,
  badge,
  onClick
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`mb-1 flex items-center justify-between rounded-xl px-3 py-3 transition-colors ${
        active
          ? "bg-[#004D77]/10 text-[#004D77]"
          : "text-gray-700 hover:bg-[#004D77]/5 hover:text-[#004D77]"
      }`}
    >
      <span className="flex items-center gap-3 text-sm font-semibold">
        <Icon className="h-5 w-5" />
        {label}
      </span>
      {
        badge > 0
        &&
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
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

export default MobileNavLink;
