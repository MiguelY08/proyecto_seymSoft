/**
 * Archivo: Evidence.jsx
 *
 * Modal para adjuntar evidencias fotográficas a una devolución.
 * Solo permite imágenes: JPG, PNG, WebP o GIF.
 */

import React, { useEffect, useRef, useState } from 'react';
import { X, Link, Image, Loader2 } from 'lucide-react';
import { deleteEvidence } from '../data/returnsService';
import { useAlert } from '../../../../shared/alerts/useAlert';

function Evidence({
  isOpen,
  onClose,
  onSave,
  files = [],
  descripcion = '',
  isEdit = false,
  existingEvidences = [],
}) {
  const inputRef = useRef(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [localDesc, setLocalDesc] = useState(descripcion);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [fileError, setFileError] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showConfirm, showError } = useAlert();

  useEffect(() => {
    if (!isOpen) return;

    setExistingFiles(isEdit && existingEvidences.length > 0 ? existingEvidences : []);
    setLocalFiles(files.filter((file) => file instanceof File));
    setLocalDesc(descripcion);
    setDeletedIds([]);
    setFileError('');
    setDescriptionTouched(false);
  }, [isOpen, files, descripcion, isEdit, existingEvidences]);

  const addFiles = (incoming) => {
    const incomingFiles = Array.from(incoming || []);
    if (incomingFiles.length === 0) return;

    const maxSize = 50 * 1024 * 1024;
    const oversized = incomingFiles.filter((file) => file.size > maxSize);
    if (oversized.length > 0) {
      setFileError(`${oversized.map((file) => file.name).join(', ')} supera el límite de 50MB`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalid = incomingFiles.filter((file) => !validTypes.includes(file.type));
    if (invalid.length > 0) {
      setFileError('Solo se permiten imágenes JPG, PNG, WebP o GIF');
      return;
    }

    const unique = incomingFiles.filter(
      (file) => !localFiles.some((previous) => previous.name === file.name && previous.size === file.size),
    );

    if (localFiles.length + existingFiles.length + unique.length > 10) {
      setFileError('Puede adjuntar máximo 10 evidencias');
      return;
    }

    setFileError(unique.length === incomingFiles.length ? '' : 'Se ignoraron archivos duplicados');
    setLocalFiles((current) => [...current, ...unique]);
  };

  const removeFile = (index, isExisting = false) => {
    if (isExisting) {
      const fileToRemove = existingFiles[index];
      if (fileToRemove?.id) {
        setDeletedIds((current) => [...current, fileToRemove.id]);
      }
      setExistingFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
      return;
    }

    setLocalFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const openFile = (file) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      return;
    }

    const url = file.base64 || file.imageUrl || file.image_path || file.url;
    if (url) window.open(url, '_blank');
  };

  const hasUnsavedChanges = () => {
    const originalFiles = files.filter((file) => file instanceof File);
    const currentSignature = localFiles.map((file) => `${file.name}-${file.size}`).sort().join('|');
    const originalSignature = originalFiles.map((file) => `${file.name}-${file.size}`).sort().join('|');

    return currentSignature !== originalSignature
      || deletedIds.length > 0
      || localDesc !== descripcion;
  };

  const handleClose = async () => {
    if (saving) return;

    if (!hasUnsavedChanges()) {
      onClose?.();
      return;
    }

    const confirmed = await showConfirm(
      'warning',
      'Evidencias sin guardar',
      'Seleccionaste o modificaste evidencias. Si sales ahora, esos cambios no se adjuntarán a la devolución.',
      { confirmButtonText: 'Salir sin guardar', cancelButtonText: 'Seguir editando' },
    );

    if (confirmed?.isConfirmed) onClose?.();
  };

  const handleSave = async () => {
    if (saving) return;

    const descriptionError = localDesc.length > 255
      ? 'La descripción no puede superar 255 caracteres'
      : '';

    setDescriptionTouched(true);
    if (fileError || descriptionError) return;

    try {
      setSaving(true);
      if (deletedIds.length > 0 && isEdit) {
        for (const id of deletedIds) {
          await deleteEvidence(id);
        }
      }

      onSave?.({
        files: localFiles.filter((file) => file instanceof File),
        descripcion: localDesc,
        existingFiles,
        deletedIds,
      });

      setDeletedIds([]);
      setLocalFiles([]);
      onClose?.();
    } catch (error) {
      showError(
        'No se pudieron guardar las evidencias',
        error?.message || 'Intenta nuevamente. Si el problema continúa, revisa la conexión.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const allFiles = [...existingFiles, ...localFiles];
  const descriptionError = localDesc.length > 255
    ? 'La descripción no puede superar 255 caracteres'
    : '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-0 backdrop-blur-sm sm:p-4">
      <div className="flex h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-lg">
        <div className="flex items-center justify-between bg-[#004D77] px-5 py-3.5">
          <h2 className="text-[15px] font-bold tracking-wide text-white">
            {isEdit ? 'Gestionar evidencias' : 'Evidencias'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="text-center">
            <p className="text-sm leading-snug text-gray-600">
              Adjunta fotos que demuestren el estado del producto o el motivo de la devolución.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Solo imágenes: JPG, PNG, WebP o GIF.
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#004D77] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Link className="h-4 w-4" />
            Subir imágenes
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />

          {fileError && <p className="text-center text-xs text-red-600">{fileError}</p>}

          {allFiles.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200">
              {allFiles.map((file, index) => {
                const fileName = file.name || (file instanceof File ? file.name : 'Archivo');
                const isExisting = !(file instanceof File) && file.id;

                return (
                  <div
                    key={`${fileName}-${index}`}
                    className={`flex items-center gap-3 px-3 py-2.5 ${index !== allFiles.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => openFile(file)}
                      className="group relative shrink-0 cursor-pointer"
                      title="Abrir imagen"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition group-hover:bg-blue-50">
                        <Image className="h-4 w-4 text-gray-400 transition group-hover:text-[#004D77]" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => openFile(file)}
                      className="flex-1 cursor-pointer truncate text-left text-sm text-[#004D77] transition hover:underline"
                      title="Abrir imagen"
                    >
                      {fileName}
                      {isExisting && (
                        <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-500">
                          Guardado
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFile(index, isExisting)}
                      disabled={saving}
                      className="shrink-0 cursor-pointer text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <p className="mb-2 text-center text-sm text-gray-600">
              Describe brevemente las evidencias
            </p>
            <textarea
              value={localDesc}
              onChange={(event) => {
                setDescriptionTouched(true);
                setLocalDesc(event.target.value);
              }}
              onBlur={() => setDescriptionTouched(true)}
              maxLength={255}
              placeholder="Agrega una breve descripción de las imágenes"
              rows={4}
              className={`w-full resize-none rounded-lg border px-4 py-3 text-sm text-gray-600 outline-none placeholder-gray-300 focus:border-[#004D77] ${
                descriptionTouched && descriptionError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex justify-between gap-2">
              {descriptionTouched && descriptionError && (
                <p className="text-xs text-red-600">{descriptionError}</p>
              )}
              <span className="ml-auto text-[10px] text-gray-400">{localDesc.length}/255</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-100 px-4 py-4 sm:px-6">
          <p className={`mb-3 text-center text-xs font-medium ${allFiles.length > 0 ? 'text-green-700' : 'text-gray-400'}`}>
            {allFiles.length > 0
              ? `${allFiles.length} evidencia(s) listas. Presiona Guardar para adjuntarlas a la devolución.`
              : 'No hay evidencias seleccionadas.'}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || Boolean(fileError || descriptionError)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#004D77] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-lg bg-gray-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Evidence;
