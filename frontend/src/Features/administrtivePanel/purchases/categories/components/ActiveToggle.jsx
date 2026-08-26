// features/categories/components/ActiveToggle.jsx
import React from 'react';

function ActiveToggle({ activo, onChange, disabled = false, loading = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && !loading && onChange(!activo)}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        disabled || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${
        activo ? "bg-green-500" : "bg-red-400"
      }`}
    >
      <span
        className={`absolute top-0 h-full flex items-center text-white font-bold text-[10px] transition-all duration-300 ${
          activo ? "left-1.5" : "right-1.5"
        }`}
      >
        {activo ? "A" : "I"}
      </span>
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? "left-6" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default ActiveToggle;
