/**
 * Archivo: Evidence.jsx
 * 
 * Modal para adjuntar evidencias (fotos) a una devolución.
 * Solo permite imágenes: JPG, PNG, WebP, GIF.
 */

import React, { useRef, useState, useEffect } from 'react';
import { X, Link, Image } from 'lucide-react';
import { deleteEvidence } from '../data/returnsService';

function Evidence({ 
  isOpen, 
  onClose, 
  onSave, 
  files = [], 
  descripcion = '',
  isEdit = false,
  existingEvidences = []
}) {
  const inputRef = useRef(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [localDesc, setLocalDesc] = useState(descripcion);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [fileError, setFileError] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && existingEvidences.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExistingFiles(existingEvidences);
      } else {
        setExistingFiles([]);
      }
      
      const newFiles = files.filter(f => f instanceof File);
      setLocalFiles(newFiles);
      setLocalDesc(descripcion);
      setDeletedIds([]);
      setFileError('');
      setDescriptionTouched(false);
    }
  }, [isOpen, files, descripcion, isEdit, existingEvidences]);

  // ✅ SOLO IMÁGENES
  // En Evidence.jsx, en addFiles:

// ============================================
// ADD FILES - SIN DUPLICADOS
// ============================================

const addFiles = (incoming) => {
  const arr = Array.from(incoming);
  
  // ✅ Validar tamaño (50MB)
  const maxSize = 50 * 1024 * 1024;
  const oversized = arr.filter(f => f.size > maxSize);
  if (oversized.length > 0) {
    setFileError(`${oversized.map(f => f.name).join(', ')} supera el límite de 50MB`);
    return;
  }

  // ✅ Validar tipo (solo imágenes)
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const invalid = arr.filter(f => !validTypes.includes(f.type));
  if (invalid.length > 0) {
    setFileError('Solo se permiten imágenes JPG, PNG, WebP o GIF');
    return;
  }

  // ✅ Evitar duplicados por nombre y tamaño
  const unique = arr.filter(f => 
    !localFiles.some(p => p.name === f.name && p.size === f.size)
  );

  if (localFiles.length + existingFiles.length + unique.length > 10) {
    setFileError('Puede adjuntar máximo 10 evidencias');
    return;
  }
  
  setFileError(unique.length === arr.length ? '' : 'Se ignoraron archivos duplicados');
  setLocalFiles(prev => [...prev, ...unique]);
};

  const removeFile = (index, isExisting = false) => {
    if (isExisting) {
      const fileToRemove = existingFiles[index];
      if (fileToRemove?.id) {
        setDeletedIds(prev => [...prev, fileToRemove.id]);
      }
      setExistingFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setLocalFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const openFile = (file) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    } else if (file.base64) {
      window.open(file.base64, '_blank');
    } else if (file.imageUrl) {
      window.open(file.imageUrl, '_blank');
    }
  };

  const handleSave = async () => {
    const descriptionError = localDesc.length > 255
      ? 'La descripción no puede superar 255 caracteres'
      : '';
    setDescriptionTouched(true);
    if (fileError || descriptionError) return;

    try {
      // ✅ Si hay evidencias eliminadas, llamar al backend
      if (deletedIds.length > 0 && isEdit) {
        for (const id of deletedIds) {
          await deleteEvidence(id);
        }
      }

      const newFiles = localFiles.filter(f => f instanceof File);
      
      // ✅ Enviar datos al padre
      onSave?.({
        files: newFiles,
        descripcion: localDesc,
        existingFiles: existingFiles,
        deletedIds: deletedIds
      });
      
      // ✅ LIMPIAR después de guardar para evitar duplicados
      setDeletedIds([]);
      setLocalFiles([]);
      
      onClose?.();
    } catch (error) {
      console.error('Error al guardar evidencias:', error);
      alert('Error al guardar evidencias');
    }
  };

  if (!isOpen) return null;

  const allFiles = [...existingFiles, ...localFiles];
  const descriptionError = localDesc.length > 255
    ? 'La descripción no puede superar 255 caracteres'
    : '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">

        <div className="bg-[#004D77] px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-white font-bold text-[15px] tracking-wide">
            {isEdit ? 'Gestionar evidencias' : 'Evidencias'}
          </h2>
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">

          <p className="text-sm text-gray-600 text-center leading-snug">
            Adjunta fotos que demuestren el<br />
            estado del producto o el motivo de la devolución
          </p>

          <p className="text-xs text-gray-400 text-center">
            Solo imágenes: JPG, PNG, WebP o GIF
          </p>

          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#004D77] hover:bg-[#003d61] text-white text-sm font-bold rounded-xl transition cursor-pointer">
            <Link className="w-4 h-4" />
            Subir Imágenes
          </button>
          
          <input ref={inputRef} type="file" multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)} />

          {fileError && <p className="text-xs text-red-600 text-center">{fileError}</p>}

          {allFiles.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              {allFiles.map((file, i) => {
                const fileName = file.name || (file instanceof File ? file.name : 'Archivo');
                const isExisting = !(file instanceof File) && file.id;
                
                return (
                  <div key={i}
                    className={`flex items-center gap-3 px-3 py-2.5 ${i !== allFiles.length - 1 ? 'border-b border-gray-200' : ''}`}>

                    <button type="button" onClick={() => openFile(file)}
                      className="relative flex-shrink-0 cursor-pointer group" title="Abrir imagen">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition">
                        <Image className="w-4 h-4 text-gray-400 group-hover:text-[#004D77] transition" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>

                    <button type="button" onClick={() => openFile(file)}
                      className="flex-1 text-sm text-[#004D77] hover:underline truncate text-left cursor-pointer transition"
                      title="Abrir imagen">
                      {fileName}
                      {isExisting && (
                        <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded ml-2">
                          ✓ Guardado
                        </span>
                      )}
                    </button>

                    <button type="button" onClick={() => removeFile(i, isExisting)}
                      className="text-gray-400 hover:text-gray-700 transition cursor-pointer flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 text-center mb-2">
              Describe brevemente las evidencias
            </p>
            <textarea 
              value={localDesc} 
              onChange={(e) => {
                setDescriptionTouched(true);
                setLocalDesc(e.target.value);
              }}
              onBlur={() => setDescriptionTouched(true)}
              maxLength={255}
              placeholder="Agrega una breve descripción de las imágenes" 
              rows={4}
              className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-600 outline-none focus:border-[#004D77] resize-none placeholder-gray-300 ${descriptionTouched && descriptionError ? 'border-red-500' : 'border-gray-300'}`} />
            <div className="mt-1 flex justify-between gap-2">
              {descriptionTouched && descriptionError && <p className="text-xs text-red-600">{descriptionError}</p>}
              <span className="ml-auto text-[10px] text-gray-400">{localDesc.length}/255</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button type="button" onClick={handleSave}
            disabled={Boolean(fileError || descriptionError)}
            className="flex-1 py-3 bg-[#004D77] hover:bg-[#003d61] text-white text-sm font-bold rounded-xl transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
            {isEdit ? 'Actualizar' : 'Guardar'}
          </button>
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
