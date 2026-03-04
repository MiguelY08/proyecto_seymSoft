// components/common/BackHeader.jsx
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const BackHeader = ({ title, to }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="w-full flex items-center py-4 px-4 md:px-6 bg-white">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 
                   text-[#004D77] 
                   hover:text-[#003D5e]  
                   transition-colors duration-200 cursor-pointer"
      >
        <ChevronLeft size={24} />
        <span className="font-lexend text-lg md:text-xl font-semibold">
          {title}
        </span>
      </button>
    </div>
  );
};

export default BackHeader;