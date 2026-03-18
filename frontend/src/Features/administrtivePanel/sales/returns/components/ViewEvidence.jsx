/**
 * Archivo: ViewEvidence.jsx
 * 
 * Modal de solo lectura para visualizar las evidencias adjuntas a una devolución.
 * Muestra metadata de archivos (nombre, tamaño, tipo).
 * Permite descargar archivos (funcionalidad por implementar).
 * Muestra la descripción del motivo de la devolución.
 * 
 * Responsabilidades principales:
 * - Mostrar lista de evidencias adjuntas
 * - Mostrar tipos de archivo con iconos diferenciados
 * - Permitir apertura/descarga de archivos (estructura lista)
 * - Mostrar tamaño de archivos en KB
 * - Mostrar descripción de las evidencias
 * - Manejar estado de sin evidencias
 */

import React from 'react';
import { X, Image, FileText, Download } from 'lucide-react';

/**
 * Componente: ViewEvidence
 * 
 * Modal temporal de solo lectura para visualizar evidencias guardadas.
 * No permite edición, solo visualización e intento de descarga.
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Array} props.files - Array de objetos evidencia con metadata
 * @param {string} props.descripcion - Descripción de las evidencias
 * 
 * @returns {JSX.Element|null} Modal si está abierto, null si no
 */
function ViewEvidence({ isOpen, onClose, files = [], descripcion = '' }) {
  // Validar si el modal debe mostrarse
  if (!isOpen) return null;

  // Como ya no tenemos base64, mostramos solo la metadata
  // En el futuro, aquí cargarás las evidencias desde servidor/DB

  // ======================= FUNCIONALIDAD: DESCARGAR =======================
  
  /**
   * Intenta descargar un archivo.
   * Actualmente, muestra un mensaje (funcionalidad por implementar).
   * 
   * @param {Object} file - Objeto de evidencia con metadata
   */
  const downloadFile = (file) => {
    // Aquí implementarías la descarga real
    alert(`Descargar ${file.name} - Función por implementar`);
  };

  // ======================= FUNCIONALIDAD: VER =======================
  
  /**
   * Intenta abrir un archivo.
   * Actualmente, muestra un mensaje (funcionalidad por implementar).
   * 
   * @param {Object} file - Objeto de evidencia con metadata
   */
  const openFile = (file) => {
    // Aquí implementarías la apertura del archivo
    alert(`Abrir ${file.name} - Función por implementar`);
  };

  // ======================= UTILIDADES =======================
  
  /**
   * Retorna el icono correspondiente al tipo de archivo.
   * Diferencia entre imágenes y otros archivos.
   * 
   * @param {Object} file - Objeto de evidencia
   * @returns {JSX.Element} Icono apropiado para el tipo
   */
  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) {
      return <Image className="w-5 h-5 text-gray-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden" style={{ maxWidth: 600, maxHeight: '80vh' }}>
        
        {/* Header del modal */}
        <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-white font-bold text-[15px]">Evidencias de la devolución</h2>
          {/* Botón para cerrar el modal */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body del modal con scroll */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 130px)' }}>
          {files.length > 0 ? (
            <div className="space-y-4">
              {/* Listar cada evidencia con su metadata */}
              {files.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  
                  {/* Cabecera del archivo con metadata */}
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
                    {/* Botón para descargar archivo */}
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

          {/* Sección de descripción */}
          {descripcion && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Descripción del motivo</h3>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-600">{descripcion}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botón de cerrar */}
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