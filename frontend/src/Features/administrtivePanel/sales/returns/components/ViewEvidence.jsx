import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Image as ImageIcon } from 'lucide-react';

const ViewEvidence = ({ 
  isOpen, 
  onClose, 
  evidences = [], 
  title = 'Evidencias de la devolución' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !evidences || evidences.length === 0) return null;

  // ✅ REVERTIR ORDEN
  const evidenciasOrdenadas = [...evidences].reverse();
  const currentEvidence = evidenciasOrdenadas[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? evidenciasOrdenadas.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev === evidenciasOrdenadas.length - 1 ? 0 : prev + 1);
  };

  const handleDownload = async (imageUrl, name) => {
    try {
      if (imageUrl?.startsWith('http')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name || 'evidencia.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (imageUrl?.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = name || 'evidencia.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('No se puede descargar esta imagen');
      }
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar la imagen');
    }
  };

  const getFileName = (url) => {
    if (!url) return 'evidencia.jpg';
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('?')[0] || 'evidencia.jpg';
  };

  const currentImageUrl = currentEvidence?.imageUrl || currentEvidence?.image_path || currentEvidence?.preview || currentEvidence?.url || '';
  const currentDescription = currentEvidence?.image_description || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,77,119,0.3)] w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden border border-[#004D77]/20">

        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#004D77]/20 flex-shrink-0 bg-gradient-to-r from-[#004D77] to-[#006699] rounded-t-3xl">
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            <p className="text-xs text-white/70">
              {evidences.length} {evidences.length === 1 ? 'evidencia' : 'evidencias'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-xl transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative min-h-[400px] bg-gray-50">
          <div className="flex items-center justify-center h-full p-6">
            <div className="relative w-full h-full flex items-center justify-center">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={`Evidencia ${currentIndex + 1}`}
                  className="max-w-full max-h-[65vh] w-auto h-auto object-contain rounded-2xl shadow-lg border border-[#004D77]/20"
                  onError={(e) => {
                    console.error('Error cargando imagen:', currentImageUrl);
                    e.target.src = '';
                    e.target.alt = 'Error al cargar imagen';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p className="text-sm">Imagen no disponible</p>
                </div>
              )}
              
              {evidenciasOrdenadas.length > 1 && (
                <>
                  <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition hover:shadow-xl hover:scale-105 border border-[#004D77]/20">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition hover:shadow-xl hover:scale-105 border border-[#004D77]/20">
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>
          </div>

          {evidenciasOrdenadas.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-xl backdrop-blur-sm border border-white/20">
              {evidenciasOrdenadas.map((ev, index) => {
                const thumbUrl = ev?.imageUrl || ev?.image_path || ev?.preview || ev?.url || '';
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200
                      ${index === currentIndex ? 'border-[#004D77] shadow-lg scale-110' : 'border-white/30 opacity-60 hover:opacity-100 hover:scale-105'}
                    `}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = ''; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#004D77]/20 flex-shrink-0 bg-white rounded-b-3xl">
          <div className="flex-1 min-w-0">
            {currentDescription ? (
              <p className="text-xs text-gray-600 truncate flex items-center gap-1.5">
                <span className="text-[#004D77]">📝</span>
                <span>{currentDescription}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic flex items-center gap-1.5">
                <span>📝</span>
                <span>Sin descripción</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <span className="text-xs text-gray-400 font-medium">
              {currentIndex + 1} / {evidences.length}
            </span>
            <button
              onClick={() => handleDownload(
                currentImageUrl,
                currentEvidence?.name || getFileName(currentImageUrl)
              )}
              disabled={!currentImageUrl}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 flex items-center gap-1.5 border ${
                currentImageUrl 
                  ? 'bg-[#004D77] text-white hover:bg-[#003d61] hover:shadow-lg hover:scale-105 active:scale-95 border-[#004D77]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvidence;