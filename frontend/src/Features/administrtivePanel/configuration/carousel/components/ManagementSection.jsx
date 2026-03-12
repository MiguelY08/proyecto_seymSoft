import { useState } from 'react';
import { Images } from 'lucide-react';
import { useAlert }      from '../../../../shared/alerts/useAlert';
import CardManagement    from '../components/CardManagement';
import Lightbox          from '../components/Lightbox';

// ─── ManagementSection ────────────────────────────────────────────────────────
function ManagementSection({ slides, imageUrls, onAdd, onDelete, onToggle, loading }) {
  const { showConfirm, showSuccess, showError, showWarning } = useAlert();
  const [expandedId, setExpandedId] = useState(null);

  const expandedSlide = expandedId !== null ? slides.find((s) => s.id === expandedId) : null;
  const expandedUrl   = expandedId !== null ? imageUrls[expandedId] : null;

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

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Header sección */}
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

        {/* Grid de imágenes */}
        <div className="p-3 sm:p-4 lg:p-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-video rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

              {slides.map((slide) => (
                <CardManagement
                  key={slide.id}
                  slide={slide}
                  imageUrl={imageUrls[slide.id]}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onExpand={(id) => setExpandedId(id)}
                />
              ))}

              <CardManagement isAddCard onAdd={handleAdd} />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {expandedId !== null && (
        <Lightbox
          imageUrl={expandedUrl}
          nombre={expandedSlide?.nombre}
          onClose={() => setExpandedId(null)}
        />
      )}
    </>
  );
}

export default ManagementSection;