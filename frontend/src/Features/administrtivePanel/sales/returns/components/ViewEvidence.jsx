import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Image as ImageIcon } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

const ViewEvidence = ({ 
  isOpen, 
  onClose, 
  evidences = [], 
  title = 'Evidencias de la devolución' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const { showError } = useAlert();

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [currentIndex]);

  if (!isOpen || !evidences || evidences.length === 0) return null;

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
        showError('No se puede descargar la imagen', 'La evidencia no tiene una ruta válida para descargar.');
      }
    } catch (error) {
      showError(
        'Error al descargar la imagen',
        error?.message || 'Intenta nuevamente en unos segundos.'
      );
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
  const DESCRIPTION_PREVIEW_LIMIT = 180;
  const shouldCollapseDescription = currentDescription.length > DESCRIPTION_PREVIEW_LIMIT;
  const visibleDescription = shouldCollapseDescription && !descriptionExpanded
    ? `${currentDescription.slice(0, DESCRIPTION_PREVIEW_LIMIT).trim()}...`
    : currentDescription;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-sm sm:p-4">
      <div className="flex h-dvh w-full max-w-5xl flex-col overflow-hidden bg-white shadow-[0_20px_60px_-10px_rgba(0,77,119,0.3)] sm:h-auto sm:max-h-[95vh] sm:rounded-2xl">

        <div className="relative flex flex-shrink-0 items-center justify-between overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-6 py-3.5">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-16 h-28 w-28 rounded-full bg-sky-300/10" />
          <div className="relative flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <ImageIcon className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-white">{title}</h2>
              <p className="text-xs text-white/70">
                {evidences.length} {evidences.length === 1 ? 'evidencia' : 'evidencias'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="relative cursor-pointer rounded-full border border-white/10 p-1.5 text-white transition hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-gray-50">
          <div className="flex h-full items-center justify-center p-3 sm:p-6">
            <div className="relative w-full h-full flex items-center justify-center">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={`Evidencia ${currentIndex + 1}`}
                  className="h-auto max-h-[58vh] w-auto max-w-full rounded-2xl object-contain shadow-lg sm:max-h-[65vh]"
                  onError={(e) => {
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
            <div className="absolute bottom-4 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl border border-white/20 bg-black/50 p-2 backdrop-blur-sm">
              {evidenciasOrdenadas.map((ev, index) => {
                const thumbUrl = ev?.imageUrl || ev?.image_path || ev?.preview || ev?.url || '';
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      h-12 w-12 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-14 sm:w-14
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

        <div className="flex flex-shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex-1 min-w-0">
            {currentDescription ? (
              <div className="max-w-full">
                <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600 [overflow-wrap:anywhere]">
                  {visibleDescription}
                </p>
                {shouldCollapseDescription && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded((current) => !current)}
                    className="mt-1 text-xs font-semibold text-[#004D77] transition hover:underline"
                  >
                    {descriptionExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Sin descripción</p>
            )}
          </div>
          
          <div className="flex flex-shrink-0 flex-col gap-2 sm:ml-4 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-xs text-gray-400 font-medium">
              {currentIndex + 1} / {evidences.length}
            </span>
            <button
              onClick={() => handleDownload(
                currentImageUrl,
                currentEvidence?.name || getFileName(currentImageUrl)
              )}
              disabled={!currentImageUrl}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                currentImageUrl 
                  ? 'text-gray-600 border-gray-400 hover:bg-gray-200 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-100'
              }`}
            >
              <Download className="w-4 h-4" strokeWidth={1.8} />
              Descargar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#004D77] bg-white px-6 py-2 text-sm font-medium text-[#004D77] shadow-sm transition-colors hover:bg-sky-100 hover:shadow-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvidence;
