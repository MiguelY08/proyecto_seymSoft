import { Calendar, Layers, Package, AlertCircle } from "lucide-react";

const ViewDetailsPN = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      
      <div className="w-[520px] bg-white rounded-xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#004D77] text-white text-center py-3 font-semibold text-lg">
          Detalles del Reporte
        </div>

        <div className="p-8">

          {/* Nombre */}
          <h2 className="text-center text-xl font-semibold mb-8">
            {report.nombre}
          </h2>

          {/* Información */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm justify-items-center">

            <div className="flex items-center gap-3 max-w-[200px]">
              <AlertCircle className="text-[#004D77]" size={20}/>
              <div>
                <p className="font-semibold">Motivo del Reporte</p>
                <p className="text-gray-600">{report.motivo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 max-w-[200px]">
              <Layers className="text-[#004D77]" size={20}/>
              <div>
                <p className="font-semibold">Categoría</p>
                <p className="text-gray-600">{report.categoria}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 max-w-[200px]">
              <Calendar className="text-[#004D77]" size={20}/>
              <div>
                <p className="font-semibold">Fecha de Detección</p>
                <p className="text-gray-600">{report.fechaDeteccion}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 max-w-[200px]">
              <Package className="text-[#004D77]" size={20}/>
              <div>
                <p className="font-semibold">Cantidad Afectada</p>
                <p className="text-gray-600">{report.cantidadAfectada}</p>
              </div>
            </div>

          </div>

          {/* Botón */}
          <div className="flex justify-center mt-10">
            <button
              onClick={onClose}
              className="bg-[#004D77] text-white px-12 py-2 rounded-lg hover:bg-[#003a5a] transition"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewDetailsPN;