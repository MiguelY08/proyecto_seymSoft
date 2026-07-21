import { useState } from 'react';
import { Loader2 } from 'lucide-react';

function ActiveToggle({ activo, onChange }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onChange?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? 'bg-green-500' : 'bg-red-400'
      } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      title={activo ? 'Activo' : 'Inactivo'}
    >
      {isLoading ? (
        <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-white animate-spin" />
      ) : (
        <>
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-white text-[10px] font-bold transition-all duration-300 ${
              activo ? 'left-1.5' : 'right-1.5'
            }`}
          >
            {activo ? 'A' : 'I'}
          </span>
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
              activo ? 'left-6' : 'left-0.5'
            }`}
          />
        </>
      )}
    </button>
  );
}

export default ActiveToggle;
