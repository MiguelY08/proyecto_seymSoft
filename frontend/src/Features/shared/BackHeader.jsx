import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const BackHeader = ({ title, to }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={handleBack}
      className="
        flex items-center gap-2
        mt-4 ml-6
        text-[#004D77]
        hover:text-[#003D5e]
        transition-colors
        cursor-pointer
      "
    >
      <ChevronLeft size={22} />

      <span className="font-lexend text-lg font-semibold">
        {title}
      </span>
    </button>
  );
};

export default BackHeader;