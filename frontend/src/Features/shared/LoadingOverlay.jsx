import Spinner from './spinner';

function LoadingOverlay({ show, message = 'Procesando...' }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
      <Spinner message={message} className="min-h-0" />
    </div>
  );
}

export default LoadingOverlay;
