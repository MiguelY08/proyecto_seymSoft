import { useState } from 'react';
import { Images, X } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import CardManagement from '../components/CardManagement';

// ─── ManagementSection ────────────────────────────────────────────────────────
function ManagementSection({ slides, imageUrls, onAdd, onDelete, onToggle, loading }) {
  const { showConfirm, showSuccess, showError, showWarning } = useAlert();
  const [expandedId, setExpandedId] = useState(null);
  const expandedUrl = expandedId ? imageUrls[expandedId] : null;

  // ─── Agregar imagen ───────────────────────────────────────────────────────
  const handleAdd = async (file) => {
    const result = await onAdd(file);
    if (!result.ok) {
      showWarning('No se pudo agregar la imagen', result.error);
    } else {
      showSuccess('Imagen agregada', 'La imagen fue agregada al carrusel exitosamente.');
    }
  };

  // ─── Eliminar imagen ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      'warning',
      '¿Eliminar esta imagen?',
      'La imagen se eliminará del carrusel permanentemente. Esta acción no se puede revertir.',
      { confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }
    );
    if (!confirmed?.isConfirmed) return;
    try {
      await onDelete(id);
      showSuccess('Imagen eliminada', 'La imagen fue eliminada del carrusel.');
    } catch {
      showError('Error', 'No se pudo eliminar la imagen.');
    }
  };

  // ─── Toggle activo/inactivo ───────────────────────────────────────────────
  const handleToggle = (id) => {
    const slide    = slides.find((s) => s.id === id);
    const isActive = slide?.activo ?? true;
    onToggle(id);
    showSuccess(
      isActive ? 'Imagen desactivada' : 'Imagen activada',
      isActive
        ? 'La imagen ya no se mostrará en el carrusel.'
        : 'La imagen volverá a mostrarse en el carrusel.'
    );
  };

  // ─── Lightbox ─────────────────────────────────────────────────────────────
  const handleExpand   = (id) => setExpandedId(id);
  const handleCollapse = ()   => setExpandedId(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* ── Header sección ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
            <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Administrar</p>
            <p className="text-xs text-gray-400 hidden sm:block">
              Elimine, active/desactive o cargue las imágenes que se mostrarán
            </p>
          </div>
        </div>

        {/* ── Grid de imágenes ────────────────────────────────────────── */}
        <div className="p-3 sm:p-4 lg:p-5">
          {loading ? (
            // Skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

              {/* Tarjetas de imágenes existentes */}
              {slides.map((slide) => (
                <CardManagement
                  key={slide.id}
                  slide={slide}
                  imageUrl={imageUrls[slide.id]}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onExpand={handleExpand}
                />
              ))}

              {/* Tarjeta para agregar */}
              <CardManagement
                isAddCard
                onAdd={handleAdd}
              />

            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {expandedId && expandedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
          onClick={handleCollapse}
        >
          <div
            className="relative w-full max-w-xs sm:max-w-2xl lg:max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={handleCollapse}
              className="absolute -top-9 sm:-top-10 right-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </button>

            {/* Imagen expandida */}
            <img
              src={expandedUrl}
              alt="Vista ampliada"
              className="w-full h-auto rounded-xl shadow-2xl"
              draggable={false}
            />

            {/* Nombre del archivo */}
            <p className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs text-white/60 truncate px-4">
              {slides.find((s) => s.id === expandedId)?.nombre ?? ''}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagementSection;