// components/ViewEvidence.jsx
import React from 'react';
import { X, Image, FileText, Download } from 'lucide-react';

function ViewEvidence({ isOpen, onClose, files = [], descripcion = '' }) {
  if (!isOpen) return null;

  // Como ya no tenemos base64, mostramos solo la metadata
  // En el futuro, aquí cargarías las evidencias desde servidor/DB

  const downloadFile = (file) => {
    // Aquí implementarías la descarga real
    alert(`Descargar ${file.name} - Función por implementar`);
  };

  const openFile = (file) => {
    // Aquí implementarías la apertura del archivo
    alert(`Abrir ${file.name} - Función por implementar`);
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) {
      return <Image className="w-5 h-5 text-gray-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden" style={{ maxWidth: 600, maxHeight: '80vh' }}>
        
        {/* Header */}
        <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-white font-bold text-[15px]">Evidencias de la devolución</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 130px)' }}>
          {files.length > 0 ? (
            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  
                  {/* Cabecera del archivo */}
                  <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file)}
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors ml-2 flex-shrink-0"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Mensaje de vista previa no disponible */}
                  <div className="p-3 border-t border-gray-200 text-center text-sm text-gray-400">
                    Vista previa no disponible - Implementar sistema de almacenamiento
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-8">
              No hay evidencias adjuntas
            </p>
          )}

          {/* Descripción */}
          {descripcion && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Descripción del motivo</h3>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-600">{descripcion}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#004D77] hover:bg-[#003d61] text-white text-sm font-bold rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewEvidence;