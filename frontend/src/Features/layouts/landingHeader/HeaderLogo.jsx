import { Link } from "react-router-dom";

import logo from "../../../assets/PapeleriaMagicLogo.png";
import horizontalLogo from "../../../assets/PMLogo_Horizontal.png";

function HeaderLogo() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center"
      aria-label="Inicio Papelería Magic"
    >
      <div className="w-9 h-9 rounded-full overflow-hidden cursor-pointer transition-all duration-150 md:hidden">
        <img
          src={logo}
          alt="Logo"
          className="w-full h-full object-cover"
        />
      </div>
      <img
        src={horizontalLogo}
        alt="Papelería Magic"
        className="hidden h-11 max-w-[160px] object-contain transition-all duration-150 md:block lg:max-w-[220px]"
      />
      <h1 className="hidden font-serif italic text-[#004D77] font-semibold tracking-tight transition-all duration-150 text-lg sm:text-2xl">
        Papelería Magic
      </h1>
    </Link>
  );
}

export default HeaderLogo;
