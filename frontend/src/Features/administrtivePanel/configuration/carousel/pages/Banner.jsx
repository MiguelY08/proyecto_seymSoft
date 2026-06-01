import { useState, useEffect, useCallback } from 'react';

import OrderSection from '../components/OrderSection';
import ManagementSection from '../components/ManagementSection';

import {
  getAllBanners,
  createBanner,
  toggleBannerStatus,
  deleteBanner,
  reorderActiveBanners,
} from '../services/bannerService';

import {
  mapBannersFromApi,
  buildReorderPayload,
  getNextStatusId,
  MAX_FILE_SIZE,
} from '../helpers/bannerHelper';
import Permission from '../../roles/components/Permission';

// ─── Banner ───────────────────────────────────────────────────────────────────
function Banner() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Cargar banners desde API ───────────────────────────────────────────────
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);

      const banners = await getAllBanners();
      const mappedBanners = mapBannersFromApi(banners);

      setSlides(mappedBanners);
    } catch (error) {
      console.error('Error al cargar banners:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // ─── Agregar imagen ────────────────────────────────────────────────────────
  const handleAddImage = useCallback(
    async (file) => {
      if (!file) {
        return {
          ok: false,
          error: 'No se seleccionó ningún archivo.',
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          ok: false,
          error: `La imagen supera los ${MAX_FILE_SIZE / (1024 * 1024)} MB. Peso actual: ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
        };
      }

      try {
        await createBanner(file);
        await fetchBanners();

        return { ok: true };
      } catch (error) {
        console.error('Error al crear banner:', error);

        return {
          ok: false,
          error: error.response?.data?.message ?? 'Error al subir la imagen.',
        };
      }
    },
    [fetchBanners]
  );

  // ─── Eliminar imagen ───────────────────────────────────────────────────────
  const handleDeleteImage = useCallback(
    async (id) => {
      try {
        await deleteBanner(id);
        await fetchBanners();
      } catch (error) {
        console.error('Error al eliminar banner:', error);
        throw error;
      }
    },
    [fetchBanners]
  );

  // ─── Activar / Desactivar imagen ───────────────────────────────────────────
  const handleToggleActive = useCallback(
    async (id) => {
      try {
        const slide = slides.find((item) => item.id === id);
        const nextStatusId = getNextStatusId(slide?.activo);

        await toggleBannerStatus(id, nextStatusId);
        await fetchBanners();
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        throw error;
      }
    },
    [slides, fetchBanners]
  );

  // ─── Reordenar imágenes activas ────────────────────────────────────────────
  const handleReorder = useCallback(
    async (newOrderIds) => {
      try {
        const payload = buildReorderPayload(newOrderIds);

        await reorderActiveBanners(payload);
        await fetchBanners();
      } catch (error) {
        console.error('Error al reordenar banners:', error);
        throw error;
      }
    },
    [fetchBanners]
  );

  const slidesOrdenados = [...slides].sort((a, b) => a.orden - b.orden);

  return (
    <Permission permission="banners.ver">
      <div className="flex flex-col gap-6 sm:gap-8 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-bold text-[#004D77]">
            Gestión del carrusel
          </h1>

          <p className="text-xs sm:text-sm text-gray-500">
            Administre las imágenes que verá el cliente en la tienda. Agrega nuevas
            imágenes, ordénalas y mucho más.
          </p>
        </div>

        <OrderSection
          slides={slidesOrdenados}
          onReorder={handleReorder}
          loading={loading}
        />

        <ManagementSection
          slides={slidesOrdenados}
          onAdd={handleAddImage}
          onDelete={handleDeleteImage}
          onToggle={handleToggleActive}
          loading={loading}
        />
      </div>
    </Permission>
  );
}

export default Banner;