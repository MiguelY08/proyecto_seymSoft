// useProductCard.js

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../../Context/CartContext';
import { useFavorites } from '../../Context/Favoritescontext';
import { useAlert } from '../../alerts/useAlert';

import {
  normalizeProduct,
  getProductDetailPath,
  isProductAvailable,
} from '../helpers/productCard.helpers';
import { getDisplayPricing } from '../../utils/shopPricingHelper';

const PRODUCT_CARD_IMAGE_INTERVAL_MS = 2200;

export function useProductCard(productData = {}, clientType = 'DETAL') {
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showError, showSuccess } = useAlert();

  /**
   * Producto normalizado.
   *
   * useMemo evita normalizar el producto en cada render,
   * a menos que productData cambie.
   */
  const product = useMemo(() => {
    const normalizedProduct = normalizeProduct(productData);
    const pricing = getDisplayPricing(normalizedProduct, clientType);

    return {
      ...normalizedProduct,
      price: pricing.price,
      originalPrice: pricing.originalPrice,
      discountPct: pricing.discountPct,
      priceLabel: pricing.label,
      clientType: pricing.clientType,
    };
  }, [clientType, productData]);

  /**
   * Estados visuales del botón de favoritos.
   */
  const [heartPopping, setHeartPopping] = useState(false);
  const [isHoveringHeart, setIsHoveringHeart] = useState(false);

  /**
   * Estados del carrusel interno de imágenes.
   */
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  /**
   * Referencias para limpiar timers correctamente.
   */
  const carouselIntervalRef = useRef(null);
  const heartAnimationTimeoutRef = useRef(null);

  /**
   * Datos derivados del producto.
   */
  const favorited = product.id ? isFavorite(product.id) : false;
  const available = isProductAvailable(product);
  const hasMultipleImages = product.images.length > 1;

  /**
   * Limpia el intervalo del carrusel.
   */
  const clearCarouselInterval = useCallback(() => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }
  }, []);

  /**
   * Avanza a la siguiente imagen.
   */
  const nextImage = useCallback(() => {
    if (!hasMultipleImages) return;

    setActiveImageIndex((currentIndex) =>
      currentIndex === product.images.length - 1 ? 0 : currentIndex + 1
    );
  }, [hasMultipleImages, product.images.length]);

  /**
   * Retrocede a la imagen anterior.
   */
  const prevImage = useCallback(() => {
    if (!hasMultipleImages) return;

    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? product.images.length - 1 : currentIndex - 1
    );
  }, [hasMultipleImages, product.images.length]);

  /**
   * Permite seleccionar manualmente una imagen.
   */
  const selectImage = useCallback(
    (index) => {
      if (index < 0 || index >= product.images.length) return;
      setActiveImageIndex(index);
    },
    [product.images.length]
  );

  /**
   * Inicia el carrusel al hacer hover sobre la card.
   */
  const startImageCarousel = useCallback(() => {
    setIsHoveringCard(true);

    if (!hasMultipleImages) return;

    clearCarouselInterval();

    carouselIntervalRef.current = setInterval(() => {
      setActiveImageIndex((currentIndex) =>
        currentIndex === product.images.length - 1 ? 0 : currentIndex + 1
      );
    }, PRODUCT_CARD_IMAGE_INTERVAL_MS);
  }, [clearCarouselInterval, hasMultipleImages, product.images.length]);

  /**
   * Detiene el carrusel al salir del hover.
   */
  const stopImageCarousel = useCallback(() => {
    setIsHoveringCard(false);
    clearCarouselInterval();
    setActiveImageIndex(0);
  }, [clearCarouselInterval]);

  /**
   * Maneja favoritos.
   */
  const handleFavorite = useCallback(
    (event) => {
      event.stopPropagation();

      if (!product.id) {
        showSuccess(
          'Producto no disponible',
          'No se pudo identificar el producto para agregarlo a favoritos.'
        );
        return;
      }

      const wasAdded = toggleFavorite(product);

      setHeartPopping(true);

      if (heartAnimationTimeoutRef.current) {
        clearTimeout(heartAnimationTimeoutRef.current);
      }

      heartAnimationTimeoutRef.current = setTimeout(() => {
        setHeartPopping(false);
      }, 420);

      showSuccess(
        wasAdded ? 'Agregado a favoritos' : 'Eliminado de favoritos',
        wasAdded
          ? `${product.name} se agregó a tu lista de deseos.`
          : `${product.name} se eliminó de tu lista de deseos.`
      );
    },
    [product, showSuccess, toggleFavorite]
  );

  /**
   * Maneja añadir al carrito.
   */
  const handleAddToCart = useCallback(
    async (event) => {
      event.stopPropagation();

      if (!product.id) {
        showError(
          'Producto no disponible',
          'No se pudo identificar el producto para agregarlo al carrito.'
        );
        return;
      }

      if (!available) {
        showError(
          'Producto no disponible',
          `${product.name} no está disponible para agregar al carrito.`
        );
        return;
      }

      const wasAdded = await addToCart(product, 1);

      if (!wasAdded) {
        showError(
          'No se pudo agregar',
          'Intenta nuevamente en unos segundos.'
        );
        return;
      }

      showSuccess(
        'Añadido al carrito',
        `${product.name} se ha agregado al carrito.`
      );
    },
    [
      addToCart,
      available,
      product,
      showError,
      showSuccess,
    ]
  );

  /**
   * Navega al detalle del producto.
   */
  const goToDetail = useCallback(() => {
    navigate(getProductDetailPath(product));
  }, [navigate, product]);

  /**
   * Limpieza general al desmontar el componente.
   */
  useEffect(() => {
    return () => {
      clearCarouselInterval();

      if (heartAnimationTimeoutRef.current) {
        clearTimeout(heartAnimationTimeoutRef.current);
      }
    };
  }, [clearCarouselInterval]);

  return {
    product,

    favorited,
    available,

    heartPopping,
    isHoveringHeart,
    setIsHoveringHeart,

    isHoveringCard,
    activeImageIndex,
    hasMultipleImages,

    startImageCarousel,
    stopImageCarousel,
    nextImage,
    prevImage,
    selectImage,

    handleFavorite,
    handleAddToCart,
    goToDetail,
  };
}
