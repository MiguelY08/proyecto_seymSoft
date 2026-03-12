// ─── Toggle activo/inactivo ───────────────────────────────────────────────────
function ActiveToggle({ activo, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? 'bg-green-500' : 'bg-red-400'
      }`}
    >
      <span
        className={`absolute top-0 h-full flex items-center text-white font-bold text-[9px] transition-all duration-300 ${
          activo ? 'left-1.5' : 'right-1.5'
        }`}
      >
        {activo ? 'A' : 'I'}
      </span>
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? 'left-[1.4rem]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default ActiveToggle;