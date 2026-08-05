import logo from '../../../assets/PapeleriaMagicLogo.png';

function Spinner({
  message = 'Cargando datos...',
  className = '',
}) {
  if (/configurando contrase/i.test(message)) {
    return null;
  }

  return (
    <div
      className={`h-full min-h-[320px] flex items-center justify-center px-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#004D77]/15 animate-ping" />
          <div className="absolute inset-3 rounded-full bg-[#004D77]/10 animate-ping [animation-delay:200ms]" />
          <img
            src={logo}
            alt="Papeleria Magic"
            className="relative h-20 w-20 object-contain drop-shadow-md animate-pulse"
          />
        </div>

        <p className="mt-5 text-sm font-semibold text-gray-700">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Spinner;
