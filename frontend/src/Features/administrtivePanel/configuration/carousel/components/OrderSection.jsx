import { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import CardOrder from '../components/CardOrder';

// ─── OrderSection ─────────────────────────────────────────────────────────────
function OrderSection({ slides, imageUrls, onReorder, loading }) {

  const [draggingId, setDraggingId] = useState(null);
  const [overId,     setOverId]     = useState(null);

  const dragIdRef         = useRef(null);
  const containerRef      = useRef(null);
  const scrollIntervalRef = useRef(null);

  // ─── Solo mostrar slides activos en la sección de orden ────────────────
  const slidesVisibles = slides.filter((s) => s.activo);

  // ─── Auto-scroll: detener ───────────────────────────────────────────────
  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // ─── Auto-scroll: activar por zonas en los bordes ──────────────────────
  const handleContainerDragOver = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect      = container.getBoundingClientRect();
    const x         = e.clientX;

    const ZONE  = 80; // px desde cada borde donde se activa el scroll
    const SPEED = 8;  // px por frame

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

  // ─── Limpiar al desmontar ───────────────────────────────────────────────
  useEffect(() => () => stopAutoScroll(), []);

  // ─── Drag start ────────────────────────────────────────────────────────
  const handleDragStart = (e, id) => {
    dragIdRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // ─── Drag over (sobre cada tarjeta) ────────────────────────────────────
  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== dragIdRef.current) setOverId(id);
  };

  // ─── Drop ──────────────────────────────────────────────────────────────
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    stopAutoScroll();
    const sourceId = dragIdRef.current;

    if (!sourceId || sourceId === targetId) {
      reset();
      return;
    }

    const ids       = slides.map((s) => s.id);
    const sourceIdx = ids.indexOf(sourceId);
    const targetIdx = ids.indexOf(targetId);

    const newIds = [...ids];
    newIds.splice(sourceIdx, 1);
    newIds.splice(targetIdx, 0, sourceId);

    onReorder(newIds);
    reset();
  };

  // ─── Drag end ──────────────────────────────────────────────────────────
  const handleDragEnd = () => {
    stopAutoScroll();
    reset();
  };

  const reset = () => {
    setDraggingId(null);
    setOverId(null);
    dragIdRef.current = null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

      {/* ── Header sección ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="w-8 h-8 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <ArrowLeftRight className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Orden</p>
          <p className="text-xs text-gray-400">
            Gestione el orden en el que se mostrarán las imágenes. Arrastre para reordenar.
          </p>
        </div>
      </div>

      {/* ── Contenedor con scroll horizontal + auto-scroll ────────────── */}
      <div
        ref={containerRef}
        className="px-5 py-5 overflow-x-auto"
        onDragOver={handleContainerDragOver}
        onDrop={stopAutoScroll}
        onDragEnd={handleDragEnd}
      >
        {loading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-gray-100 animate-pulse shrink-0"
                style={{ width: '280px', aspectRatio: '16/9' }}
              />
            ))}
          </div>

        ) : slidesVisibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
            <ArrowLeftRight className="w-8 h-8 opacity-30" strokeWidth={1.5} />
            <p className="text-sm">No hay imágenes activas para ordenar.</p>
            <p className="text-xs">Activa al menos una imagen en la sección de administración.</p>
          </div>

        ) : (
          <div
            className="flex gap-4"
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
                  imageUrl={imageUrls[slide.id]}
                  index={index}
                  isDragging={draggingId === slide.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderSection;