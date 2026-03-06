import React from 'react';
import { X, Image } from 'lucide-react';

/**
 * Props:
 *   isOpen      {boolean}   - controla visibilidad
 *   onClose     {function}  - cierra el modal
 *   files       {File[]}    - archivos de evidencia
 *   descripcion {string}    - explicación del cliente
 */
function ViewEvidence({ isOpen, onClose, files = [], descripcion = '' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden" style={{ maxWidth: 540 }}>

        {/* Header */}
        <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-white font-bold text-[15px]">Evidencia del motivo de devolución</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          <p className="text-sm text-gray-600 text-center leading-snug">
            Fotos, videos o documentos que el cliente adjunto como<br />evidencia.
          </p>

          {/* Lista de archivos */}
          {files.length > 0 ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {files.map((file, i) => {
                const isImg = file.type?.startsWith('image/');
                const isVid = file.type?.startsWith('video/');
                const url   = file instanceof File ? URL.createObjectURL(file) : file.url;
                const name  = file instanceof File ? file.name : file.name;

                return (
                  <div
                    key={i}
                    className={`flex flex-col ${i !== files.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    {/* Fila nombre */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Image className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="flex-1 text-sm text-gray-700 font-medium">{name}</span>
                    </div>

                    {/* Preview imagen */}
                    {isImg && url && (
                      <div className="px-4 pb-3">
                        <img
                          src={url}
                          alt={name}
                          className="w-full max-h-52 object-contain rounded-lg border border-gray-200 bg-gray-50"
                        />
                      </div>
                    )}

                    {/* Preview video */}
                    {isVid && url && (
                      <div className="px-4 pb-3">
                        <video
                          src={url}
                          controls
                          className="w-full max-h-52 rounded-lg border border-gray-200 bg-black"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic text-center">Sin evidencias adjuntas</p>
          )}

          {/* Explicación del cliente */}
          <div>
            <p className="text-sm text-gray-600 text-center mb-2 font-medium">
              Explicación del cliente sobre el por que de la devolución.
            </p>
            <div className="border border-gray-300 rounded-xl px-4 py-3 min-h-[80px]">
              <p className="text-sm text-gray-600 leading-relaxed">
                {descripcion || <span className="text-gray-300 italic">Sin explicación</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#004D77] hover:bg-[#003d61] text-white text-sm font-bold rounded-xl transition cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewEvidence;
