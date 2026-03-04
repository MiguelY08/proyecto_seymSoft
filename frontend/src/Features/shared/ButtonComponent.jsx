import { Link } from "react-router-dom"

export default function ButtonComponent({
  to,
  children,
  onClick,
  className = ""   
}) {

  const baseClass =
    "w-full sm:w-auto px-4 py-2 rounded-lg border  text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 text-sm font-semibold whitespace-nowrap inline-block text-center cursor-pointer"

  if (to) {
    return (
      <Link to={to} className={`${baseClass} ${className}`}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={`${baseClass} ${className}`}>
      {children}
    </button>
  )
}