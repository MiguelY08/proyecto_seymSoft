/**
 * Archivo: Evidence.jsx
 * 
 * Modal para adjuntar evidencias (fotos, videos, documentos) a una devolución.
 * Permite al usuario cargar archivos, visualizarlos y agregar una descripcón.
 * Maneja la carga de múltiples archivos con validación de tipos.
 * 
 * Responsabilidades principales:
 * - Permitir carga de archivos (fotos, videos, PDFs)
 * - Mostrar lista de archivos cargados
 * - Permitir eliminar archivos antes de guardar
 * - Permitir abrir/previsualizar archivos
 * - Agregar descripción general de las evidencias
 * - Guardar metadata de evidencias en la devolución
 * - Validar tipos de archivo permitidos
 */

import React, { useRef, useState, useEffect } from 'react';
import { X, Link, Image } from 'lucide-react';
import { saveEvidence } from '../data/returnsService';

/**
 * Componente: Evidence
 * 
 * Modal temporal para cargar y gestionar evidencias de una devolución.
 * Permite al usuario cargar múltiples archivos con descripción.
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar sin guardar
 * @param {Function} props.onSave - Callback cuando se guardan evidencias
 * @param {Array} props.files - Array de evidencias ya guardadas
 * @param {string} props.descripcion - Descripción de las evidencias
 * 
 * @returns {JSX.Element|null} Modal si está abierto, null si no
 */
function Evidence({ isOpen, onClose, onSave, files = [], descripcion = '' }) {
  // Referencia al input file para disparar clic
  const inputRef = useRef(null);

  // Estado local para los archivos en edición
  const [localFiles, setLocalFiles] = useState([]);
  
  // Estado local para la descripción
  const [localDesc, setLocalDesc] = useState(descripcion);

  // ======================= USEEFFECT: INICIALIZACIÓN =======================
  
  // Se ejecuta cuando el modal se abre
  // Carga los archivos y descripción existentes
  useEffect(() => {
    if (isOpen) {
      setLocalFiles(files);
      setLocalDesc(descripcion);
    }
  }, [isOpen, files, descripcion]);

  // ======================= FUNCIONALIDAD: CARGA DE ARCHIVOS =======================
  
  /**
   * Agrega nuevos archivos a la lista de evidencias.
   * Convierte FileList a Array y los concatena con los existentes.
   * 
   * @param {FileList} incoming - Archivos a agregar
   */
  const addFiles = (incoming) => {
    const arr = Array.from(incoming);
    setLocalFiles((prev) => [...prev, ...arr]);
  };

  // ======================= FUNCIONALIDAD: ELIMINAR ARCHIVOS =======================
  
  /**
   * Elimina un archivo de la lista por su índice.
   * 
   * @param {number} index - Índice del archivo a eliminar
   */
  const removeFile = (index) => {
    setLocalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================= FUNCIONALIDAD: VER ARCHIVOS =======================
  
  /**
   * Abre un archivo en nueva pestaña.
   * Soporta archivos File nuevos y metadata con base64.
   * 
   * @param {File|Object} file - Archivo a abrir
   */
  const openFile = (file) => {
    // Si es un objeto File (nuevo)
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    } else if (file.base64) {
      // Si ya tiene base64 (solo para vista previa temporal)
      window.open(file.base64, '_blank');
    }
  };

  // ======================= FUNCIONALIDAD: GUARDAR =======================
  
  /**
   * Guarda las evidencias cargadas.
   * Procesa los archivos y llama al callback onSave.
   * Cierra el modal después de guardar.
   */
  const handleSave = async () => {
    try {
      // Guardar evidencias (solo retorna metadata)
      const evidenceMetadata = await saveEvidence('temp-id', localFiles);
      
      // Llamar callback con datos de evidencias
      onSave?.({
        files: evidenceMetadata,
        descripcion: localDesc
      });
      onClose?.();
    } catch (error) {
      console.error('Error al guardar evidencias:', error);
      alert('Error al guardar evidencias');
    }
  };

  // Validar si el modal debe mostrarse
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">

        {/* Header del modal */}
        <div className="bg-[#004D77] px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-white font-bold text-[15px] tracking-wide">Evidencias</h2>
          {/* Botón para cerrar el modal */}
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body del modal */}
        <div className="px-6 py-5 flex flex-col gap-4">

          <p className="text-sm text-gray-600 text-center leading-snug">
            Adjunta fotos, videos o documentos que demuestren el<br />
            estado del producto o el motivo de la devolución
          </p>

          {/* Botón para cargar archivos */}
          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#004D77] hover:bg-[#003d61] text-white text-sm font-bold rounded-xl transition cursor-pointer">
            <Link className="w-4 h-4" />
            Subir Archivos
          </button>
          {/* Input file oculto */}
          <input ref={inputRef} type="file" multiple
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)} />

          {/* Lista de archivos cargados */}
          {localFiles.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              {localFiles.map((file, i) => {
                const fileName = file.name || (file instanceof File ? file.name : 'Archivo');
                
                return (
                  <div key={i}
                    className={`flex items-center gap-3 px-3 py-2.5 ${i !== localFiles.length - 1 ? 'border-b border-gray-200' : ''}`}>

                    {/* Ícono con check verde */}
                    <button type="button" onClick={() => openFile(file)}
                      className="relative flex-shrink-0 cursor-pointer group" title="Abrir archivo">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition">
                        <Image className="w-4 h-4 text-gray-400 group-hover:text-[#004D77] transition" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>

                    {/* Nombre del archivo */}
                    <button type="button" onClick={() => openFile(file)}
                      className="flex-1 text-sm text-[#004D77] hover:underline truncate text-left cursor-pointer transition"
                      title="Abrir archivo">
                      {fileName}
                    </button>

                    {/* Botón eliminar */}
                    <button type="button" onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-gray-700 transition cursor-pointer flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Textarea para descripción de las evidencias */}
          <div>
            <p className="text-sm text-gray-600 text-center mb-2">
              Explica brevemente el motivo de la devolución
            </p>
            <textarea value={localDesc} onChange={(e) => setLocalDesc(e.target.value)}
              placeholder="Agrega una breve explicación" rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-600 outline-none focus:border-[#004D77] resize-none placeholder-gray-300" />
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className="flex gap-3 px-6 pb-5">
          {/* Botón guardar evidencias */}
          <button type="button" onClick={handleSave}
            className="flex-1 py-3 bg-[#004D77] hover:bg-[#003d61] text-white text-sm font-bold rounded-xl transition cursor-pointer">
            Guardar
          </button>
          {/* Botón cancelar sin guardar */}
          <button type="button" onClick={onClose}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-bold rounded-xl transition cursor-pointer">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Evidence;