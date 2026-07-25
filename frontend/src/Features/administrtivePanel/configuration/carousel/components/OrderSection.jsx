import { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import CardOrder from '../components/CardOrder';
import Permission from '../../roles/components/Permission';
import Spinner from '../../../../shared/spinner';

// ─── OrderSection ─────────────────────────────────────────────────────────────
function OrderSection({ slides, onReorder, loading }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);

  const dragIdRef = useRef(null);
  const containerRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // Solo mostrar banners activos y ordenados
  const slidesVisibles = slides
    .filter((slide) => slide.activo)
    .sort((a, b) => a.orden - b.orden);

  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleContainerDragOver = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX;

    const ZONE = 80;
    const SPEED = 8;

    stopAutoScroll();

    const scroll = () => {
      if (x < rect.left + ZONE) {
        container.scrollLeft -= SPEED;
      } else if (x > rect.right - ZONE) {
        container.scrollLeft += SPEED;
      }

      scrollIntervalRef.current = requestAnimationFrame(scroll);
    };

    if (x < rect.left + ZONE || x > rect.right - ZONE) {
      scrollIntervalRef.current = requestAnimationFrame(scroll);
    }
  };

  useEffect(() => () => stopAutoScroll(), []);

  const handleDragStart = (e, id) => {
    dragIdRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== dragIdRef.current) setOverId(id);
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    stopAutoScroll();

    const sourceId = dragIdRef.current;

    if (!sourceId || sourceId === targetId) {
      reset();
      return;
    }

    const ids = slidesVisibles.map((slide) => slide.id);
    const sourceIndex = ids.indexOf(sourceId);
    const targetIndex = ids.indexOf(targetId);

    const newOrderIds = [...ids];
    newOrderIds.splice(sourceIndex, 1);
    newOrderIds.splice(targetIndex, 0, sourceId);

    await onReorder(newOrderIds);

    reset();
  };

  const handleDragEnd = () => {
    stopAutoScroll();
    reset();
  };

  const handleMove = async (id, direction) => {
    const currentIndex = slidesVisibles.findIndex((slide) => slide.id === id);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= slidesVisibles.length) {
      return;
    }

    const newOrderIds = slidesVisibles.map((slide) => slide.id);
    const [movedId] = newOrderIds.splice(currentIndex, 1);
    newOrderIds.splice(targetIndex, 0, movedId);

    await onReorder(newOrderIds);
    reset();
  };

  const reset = () => {
    setDraggingId(null);
    setOverId(null);
    dragIdRef.current = null;
  };

  return (
    <Permission permission="banners.ordenar">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3.5 sm:items-center sm:px-5 sm:py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#004D77]">
            <ArrowLeftRight className="w-4 h-4 text-white" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-gray-800">Orden</p>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
              Gestione el orden en el que se mostrarán las imágenes. Arrastre para reordenar.
            </p>
          </div>
        </div>

        <div
          ref={containerRef}
          className="overflow-x-auto overscroll-x-contain px-3 py-4 [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-5"
          onDragOver={handleContainerDragOver}
          onDrop={stopAutoScroll}
          onDragEnd={handleDragEnd}
        >
          {loading ? (
            <Spinner message="Cargando orden de banners..." className="min-h-[180px]" />
          ) : slidesVisibles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-gray-400">
              <ArrowLeftRight className="w-8 h-8 opacity-30" strokeWidth={1.5} />
              <p className="text-sm font-medium">No hay imágenes activas para ordenar.</p>
              <p className="max-w-xs text-xs leading-relaxed">
                Activa al menos una imagen en la sección de administración.
              </p>
            </div>
          ) : (
            <div
              className="flex min-w-max gap-3 sm:gap-4"
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setOverId(null);
                  stopAutoScroll();
                }
              }}
            >
              {slidesVisibles.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`transition-all duration-200 rounded-xl ${
                    overId === slide.id && draggingId !== slide.id
                      ? 'ring-2 ring-[#004D77] ring-offset-2 scale-[1.02]'
                      : ''
                  }`}
                >
                  <CardOrder
                    slide={slide}
                    index={index}
                    isDragging={draggingId === slide.id}
                    canMoveLeft={index > 0}
                    canMoveRight={index < slidesVisibles.length - 1}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onMoveLeft={() => handleMove(slide.id, -1)}
                    onMoveRight={() => handleMove(slide.id, 1)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Permission>
  );
}

export default OrderSection;
