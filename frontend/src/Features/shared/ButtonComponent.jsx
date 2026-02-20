import { Link } from "react-router-dom"

export default function ButtonComponent({
  to,
  children,
  onClick
}) {

  const baseClass =
    "w-full sm:w-auto px-4 py-2 rounded-lg border border-sky-700 text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 text-sm font-semibold whitespace-nowrap inline-block text-center cursor-pointer"

  if (to) {
    return (
      <Link to={to} className={baseClass}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={baseClass}>
      {children}
    </button>
  )
}
