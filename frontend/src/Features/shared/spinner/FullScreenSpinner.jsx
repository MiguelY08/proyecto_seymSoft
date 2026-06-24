import Spinner from "./Spinner";

function FullScreenSpinner({ message = "Cargando datos..." }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <Spinner message={message} className="min-h-0" />
    </div>
  );
}

export default FullScreenSpinner;
