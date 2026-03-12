import { useState, useEffect, useCallback, useRef } from 'react';
import { saveImage, getImage, deleteImage as deleteImageDB, seedDefaultImage, DEFAULT_SLIDE_ID } from '../services/CarouselBD';
import { loadMeta, saveMeta, MAX_FILE_SIZE } from '../helpers/carouselHelpers';
import OrderSection      from '../components/OrderSection';
import ManagementSection from '../components/ManagementSection';

// ─── Banner ───────────────────────────────────────────────────────────────────
function Banner() {
  const [slides,    setSlides]    = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading,   setLoading]   = useState(true);
  const urlsRef = useRef({});

  // ─── Cargar metadatos + imágenes al montar ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await seedDefaultImage();
      const meta = loadMeta();
      setSlides(meta);

      const urls = {};
      await Promise.all(
        meta.map(async (slide) => {
          const blob = await getImage(slide.id);
          if (blob) {
            const url = URL.createObjectURL(blob);
            urls[slide.id]         = url;
            urlsRef.current[slide.id] = url;
          }
        })
      );
      setImageUrls(urls);
      setLoading(false);
    };
    load();

    return () => {
      Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // ─── Persistir metadatos cuando cambian los slides ──────────────────────
  useEffect(() => {
    if (!loading) saveMeta(slides);
  }, [slides, loading]);


  // ─── Agregar imagen ─────────────────────────────────────────────────────
  const handleAddImage = useCallback(async (file) => {
    if (!file) return { ok: false, error: 'No se seleccionó ningún archivo.' };
    if (file.size > MAX_FILE_SIZE) {
      return {
        ok:    false,
        error: `La imagen supera los ${MAX_FILE_SIZE / (1024 * 1024)} MB. Peso actual: ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
      };
    }

    const id     = Date.now();
    const nombre = file.name;
    const orden  = slides.length + 1;

    try {
      await saveImage(id, file);
      const url = URL.createObjectURL(file);
      urlsRef.current[id] = url;
      setImageUrls((prev) => ({ ...prev, [id]: url }));
      setSlides((prev) => [...prev, { id, nombre, orden, activo: true }]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error al guardar la imagen.' };
    }
  }, [slides]);


  // ─── Eliminar imagen ────────────────────────────────────────────────────
  const handleDeleteImage = useCallback(async (id) => {
    try {
      await deleteImageDB(id);
      if (urlsRef.current[id]) {
        URL.revokeObjectURL(urlsRef.current[id]);
        delete urlsRef.current[id];
      }
      setImageUrls((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setSlides((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        return filtered.map((s, i) => ({ ...s, orden: i + 1 }));
      });
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
    }
  }, []);


  // ─── Activar / Desactivar imagen ────────────────────────────────────────
  const handleToggleActive = useCallback((id) => {
    setSlides((prev) =>
      prev.map((s) => s.id === id ? { ...s, activo: !s.activo } : s)
    );
  }, []);


  // ─── Reordenar imágenes ─────────────────────────────────────────────────
  const handleReorder = useCallback((newOrder) => {
    setSlides((prev) => {
      const map = Object.fromEntries(prev.map((s) => [s.id, s]));
      return newOrder.map((id, i) => ({ ...map[id], orden: i + 1 }));
    });
  }, []);


  const slidesOrdenados = [...slides].sort((a, b) => a.orden - b.orden);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full">

      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg sm:text-xl font-bold text-[#004D77]">Gestión del carrusel</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Administre las imágenes que verá el cliente en la tienda. Agrega nuevas imágenes, ordénalas y mucho más.
        </p>
      </div>

      {/* Sección 1: Orden */}
      <OrderSection
        slides={slidesOrdenados}
        imageUrls={imageUrls}
        onReorder={handleReorder}
        loading={loading}
      />

      {/* Sección 2: Administrar */}
      <ManagementSection
        slides={slidesOrdenados}
        imageUrls={imageUrls}
        onAdd={handleAddImage}
        onDelete={handleDeleteImage}
        onToggle={handleToggleActive}
        loading={loading}
      />
    </div>
  );
}

export default Banner;