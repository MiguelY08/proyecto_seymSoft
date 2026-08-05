import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import ProductsService from "../../../administrtivePanel/purchases/products/services/productsServices.js";
import { useAlert } from "../../../shared/alerts/useAlert";
import { useCart } from "../../../shared/Context/CartContext";
import useClientType from "../../../shared/hooks/useClientType.js";
import ProductCard from "../../../shared/productCard/ProductCard";
import { getDisplayPricing } from "../../../shared/utils/shopPricingHelper.js";

const getProductImages = product =>
  (product?.images || [])
    .map((image, index) => ({
      url: typeof image === "string" ? image : image?.url,
      alt:
        typeof image === "string"
          ? `${product.name} ${index + 1}`
          : image?.alt || `${product.name} ${index + 1}`,
    }))
    .filter(image => image.url);

function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const relatedRef = useRef(null);
  const { addToCart } = useCart();
  const { showError, showSuccess } = useAlert();
  const { clientType } = useClientType();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [canUseImageZoom, setCanUseImageZoom] = useState(false);
  const [isImageZoomVisible, setIsImageZoomVisible] = useState(false);
  const [imageZoomPosition, setImageZoomPosition] = useState({
    x: 50,
    y: 50,
    lensX: 50,
    lensY: 50,
  });

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      const productId = Number(id);

      if (!Number.isInteger(productId) || productId <= 0) {
        setError("El producto solicitado no es válido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [currentProduct, allProducts] = await Promise.all([
          ProductsService.findById(productId),
          ProductsService.list({ active: true }),
        ]);

        if (!active) return;

        if (!currentProduct) {
          setError("No encontramos el producto solicitado.");
          setProduct(null);
          return;
        }

        const categoryIds = new Set(
          (currentProduct.categories || []).map(category => Number(category.id))
        );

        setProduct(currentProduct);
        setRelatedProducts(
          allProducts
            .filter(item =>
              item.id !== currentProduct.id &&
              item.isActive &&
              item.categories?.some(category =>
                categoryIds.has(Number(category.id))
              )
            )
            .slice(0, 10)
        );
        setQuantity(1);
        setSelectedImageIndex(0);
      } catch (requestError) {
        if (!active) return;
        console.error("Error cargando el detalle del producto:", requestError);
        setProduct(null);
        setRelatedProducts([]);
        setError("No fue posible cargar el producto. Intenta nuevamente.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetail();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 1024px)"
    );
    const updateZoomAvailability = () => {
      setCanUseImageZoom(mediaQuery.matches);
      if (!mediaQuery.matches) setIsImageZoomVisible(false);
    };

    updateZoomAvailability();
    mediaQuery.addEventListener("change", updateZoomAvailability);

    return () => {
      mediaQuery.removeEventListener("change", updateZoomAvailability);
    };
  }, []);

  const pricing = useMemo(
    () => getDisplayPricing(product, clientType),
    [clientType, product]
  );
  const images = useMemo(() => getProductImages(product), [product]);
  const selectedImage = images[selectedImageIndex] || images[0];

  const stock = Number(product?.totalStock ?? 0);
  const available = Boolean(product?.isActive && stock > 0);
  const totalPrice = pricing.price * quantity;
  const categoryName =
    product?.mainCategory?.name ||
    product?.categories?.[0]?.name ||
    "Sin categoría";

  const cartProduct = useMemo(() => {
    if (!product) return null;

    return {
      ...product,
      price: pricing.price,
      originalPrice: pricing.originalPrice,
      discountPct: pricing.discountPct,
      priceLabel: pricing.label,
      clientType: pricing.clientType,
      image: product.mainImage?.url || product.images?.[0]?.url || "",
    };
  }, [pricing, product]);

  const showPreviousImage = () => {
    if (images.length < 2) return;
    setSelectedImageIndex(current =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    if (images.length < 2) return;
    setSelectedImageIndex(current =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  const handleImageZoomMove = event => {
    if (!canUseImageZoom || !selectedImage) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setImageZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
      lensX: Math.min(bounds.width - 140, Math.max(140, event.clientX - bounds.left + 28)),
      lensY: Math.min(bounds.height - 140, Math.max(140, event.clientY - bounds.top + 28)),
    });
    setIsImageZoomVisible(true);
  };

  const hideImageZoom = () => {
    setIsImageZoomVisible(false);
  };

  const handleAddToCart = async () => {
    if (!cartProduct || !available) {
      showError("Producto no disponible", "Este producto no tiene stock.");
      return;
    }

    try {
      setAddingToCart(true);
      const wasAdded = await addToCart(cartProduct, quantity);

      if (!wasAdded) {
        showError(
          "No se pudo agregar",
          "Intenta nuevamente en unos segundos."
        );
        return;
      }

      showSuccess(
        "Añadido al carrito",
        `${quantity} x ${product.name} se agregó al carrito.`
      );
      setQuantity(1);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f9fc] px-[var(--store-content-x)] py-10">
        <div className="mx-auto max-w-[var(--store-content-max)] animate-pulse rounded-3xl bg-white p-10 text-center text-slate-500">
          Cargando producto...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f6f9fc] px-[var(--store-content-x)] py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <h1 className="mb-3 text-2xl font-black text-slate-800">
            Producto no disponible
          </h1>
          <p className="mb-6 text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="rounded-full bg-[#004D77] px-6 py-3 font-bold text-white"
          >
            Volver a la tienda
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] px-[var(--store-content-x)] py-8 font-['Nunito']">
      <div className="mx-auto max-w-[var(--store-content-max)]">
        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="mb-6 flex items-center gap-2 font-bold text-[#004D77]"
        >
          <ChevronLeft size={18} />
          Volver a tienda
        </button>

        <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div
              className={`relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-2xl border border-[#dcebf3] bg-gradient-to-br from-[#eef6fb] to-[#dfeef8] p-4 sm:min-h-[340px] sm:rounded-[24px] sm:p-6 lg:min-h-[420px] lg:rounded-[28px] lg:p-8 ${
                canUseImageZoom && selectedImage ? "lg:cursor-zoom-in" : ""
              }`}
              onMouseMove={handleImageZoomMove}
              onMouseEnter={handleImageZoomMove}
              onMouseLeave={hideImageZoom}
            >
              {images.length > 1 && (
                <button
                  type="button"
                  aria-label="Ver imagen anterior"
                  onClick={showPreviousImage}
                  className="absolute left-3 z-40 rounded-full bg-white p-2.5 text-[#004D77] shadow-md sm:left-4 sm:p-3"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="max-h-[240px] w-full object-contain sm:max-h-[320px] lg:max-h-[400px]"
                />
              ) : (
                <span className="font-bold text-slate-500">
                  Producto sin imagen
                </span>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Ver imagen siguiente"
                    onClick={showNextImage}
                    className="absolute right-3 z-40 rounded-full bg-white p-2.5 text-[#004D77] shadow-md sm:right-4 sm:p-3"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <span className="absolute bottom-3 right-3 z-40 rounded-full bg-[#004D77] px-3 py-1 text-xs font-bold text-white sm:bottom-4 sm:right-4">
                    {selectedImageIndex + 1}/{images.length}
                  </span>
                </>
              )}

              {canUseImageZoom && selectedImage && isImageZoomVisible && (
                <div
                  className="pointer-events-none absolute z-30 hidden h-56 w-56 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white/80 bg-white shadow-[0_20px_55px_rgba(0,77,119,0.26)] ring-2 ring-[#9bc8df]/70 lg:block xl:h-64 xl:w-64"
                  style={{
                    left: imageZoomPosition.lensX,
                    top: imageZoomPosition.lensY,
                  }}
                >
                  <div
                    className="h-full w-full bg-no-repeat"
                    style={{
                      backgroundImage: `url(${selectedImage.url})`,
                      backgroundPosition: `${imageZoomPosition.x}% ${imageZoomPosition.y}%`,
                      backgroundSize: "280%",
                    }}
                  />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-16 w-16 rounded-xl border bg-white p-1.5 sm:h-20 sm:w-20 sm:rounded-2xl sm:p-2 ${
                      selectedImageIndex === index
                        ? "border-[#004D77]"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e4eff6] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-6 lg:rounded-[28px] lg:p-7">
            <span className="inline-block rounded-full bg-[#e8f4fd] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#004D77]">
              {categoryName}
            </span>
            <h1 className="mt-4 text-2xl font-black leading-tight text-[#0c2a3a] sm:mt-5 sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7">
              {product.description || "Este producto no tiene descripción disponible."}
            </p>

            <div className="mt-5 text-[0.7rem] font-black uppercase tracking-wider text-slate-500 sm:mt-6 sm:text-xs">
              {pricing.label}
            </div>
            {pricing.hasDiscount && (
              <div className="mt-2 font-bold text-slate-400 line-through">
                ${pricing.originalPrice.toLocaleString("es-CO")} COP
              </div>
            )}
            <div className="mt-1 text-3xl font-black leading-none text-[#004D77] sm:text-4xl">
              ${totalPrice.toLocaleString("es-CO")}
              <span className="ml-2 text-sm text-slate-400">COP</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                  available
                    ? "bg-[#edfdf3] text-[#12a150]"
                    : "bg-[#fff1f0] text-[#ff4d4f]"
                }`}
              >
                {available ? "Disponible" : "Producto agotado"}
              </span>

              {available && (
                <span className="inline-flex items-center rounded-full bg-[#f4f8fb] px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500">
                  Stock: <span className="ml-1 text-[#004D77]">{stock}</span>
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center">
              <div className="flex h-12 overflow-hidden rounded-full border border-slate-200 sm:w-auto">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(current => Math.max(1, current - 1))}
                  className="flex h-12 w-12 items-center justify-center bg-slate-50 disabled:opacity-40"
                >
                  <Minus size={17} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={stock}
                  value={quantity}
                  disabled={!available}
                  aria-label="Cantidad del producto"
                  onFocus={event => event.currentTarget.select()}
                  onChange={event => {
                    const nextQuantity = Number(event.target.value);
                    if (!Number.isFinite(nextQuantity)) return;
                    setQuantity(Math.min(stock, Math.max(1, nextQuantity)));
                  }}
                  className="h-12 w-full min-w-14 border-x border-slate-200 px-2 text-center font-black outline-none disabled:bg-slate-100 sm:w-16"
                />
                <button
                  type="button"
                  disabled={!available || quantity >= stock}
                  onClick={() => setQuantity(current => Math.min(stock, current + 1))}
                  className="flex h-12 w-12 items-center justify-center bg-slate-50 disabled:opacity-40"
                >
                  <Plus size={17} />
                </button>
              </div>

              <button
                type="button"
                disabled={!available || addingToCart}
                onClick={handleAddToCart}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#004D77] px-5 text-sm font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:px-6"
              >
                <ShoppingCart size={17} />
                {addingToCart
                  ? "Añadiendo..."
                  : available ? "Añadir al carrito" : "Producto agotado"}
              </button>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5 sm:mt-8 sm:pt-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Información del producto
              </h2>
              <ul className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 text-sm">
                {product.reference && (
                  <li className="flex items-center justify-between gap-4 border-b border-white px-3 py-2.5 sm:px-4">
                    <span className="font-bold text-slate-500">Referencia</span>
                    <span className="text-right font-black text-[#0c2a3a]">{product.reference}</span>
                  </li>
                )}
                <li className="flex items-center justify-between gap-4 border-b border-white px-3 py-2.5 sm:px-4">
                  <span className="font-bold text-slate-500">Unidad</span>
                  <span className="text-right font-black text-[#0c2a3a]">
                    {product.unitMeasure?.name || "Unidad"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4 px-3 py-2.5 sm:px-4">
                  <span className="font-bold text-slate-500">Stock disponible</span>
                  <span className="text-right font-black text-[#0c2a3a]">{stock}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#004D77]">
              También te puede interesar
            </p>
            <h2 className="mt-1 text-3xl font-black text-[#0c2a3a]">
              Productos relacionados
            </h2>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                aria-label="Ver productos anteriores"
                onClick={() =>
                  relatedRef.current?.scrollBy({ left: -280, behavior: "smooth" })
                }
                className="hidden shrink-0 rounded-full border border-slate-200 bg-white p-3 text-[#004D77] sm:inline-flex"
              >
                <ChevronLeft size={18} />
              </button>

              <div
                ref={relatedRef}
                className="flex flex-1 snap-x snap-proximity gap-2 overflow-x-auto scroll-smooth py-2 sm:gap-4"
              >
                {relatedProducts.map(relatedProduct => (
                  <div key={relatedProduct.id} className="w-[74vw] max-w-56 shrink-0 snap-start min-[420px]:w-48 sm:w-56">
                    <ProductCard
                      product={relatedProduct}
                      clientType={clientType}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                aria-label="Ver productos siguientes"
                onClick={() =>
                  relatedRef.current?.scrollBy({ left: 280, behavior: "smooth" })
                }
                className="hidden shrink-0 rounded-full border border-slate-200 bg-white p-3 text-[#004D77] sm:inline-flex"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default ShopDetail;

