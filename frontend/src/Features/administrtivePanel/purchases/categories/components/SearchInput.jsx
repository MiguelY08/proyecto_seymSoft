// features/categories/components/SearchInput.jsx
import React from "react";
import { Search } from "lucide-react";

const SearchInput = ({ value, onChange, placeholder = "Buscar" }) => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
      />
      <Search
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        strokeWidth={2}
      />
    </div>
  );
};

export default SearchInput;
