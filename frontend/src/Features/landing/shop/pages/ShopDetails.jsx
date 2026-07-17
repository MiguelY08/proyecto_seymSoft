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
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      const productId = Number(id);

      if (!Number.isInteger(productId) || productId <= 0) {
        setError("El producto solicitado no es vÃ¡lido.");
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
    "Sin categorÃ­a";

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

  const handleAddToCart = () => {
    if (!cartProduct || !available) {
      showError("Producto no disponible", "Este producto no tiene stock.");
      return;
    }

    addToCart(cartProduct, quantity);
    showSuccess(
      "AÃ±adido al carrito",
      `${quantity} x ${product.name} se agregÃ³ al carrito.`
    );
    setQuantity(1);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f9fc] px-5 py-10">
        <div className="mx-auto max-w-7xl animate-pulse rounded-3xl bg-white p-10 text-center text-slate-500">
          Cargando producto...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f6f9fc] px-5 py-10">
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
    <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 font-['Nunito']">
      <div className="mx-auto max-w-7xl">
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
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[28px] border border-[#dcebf3] bg-gradient-to-br from-[#eef6fb] to-[#dfeef8] p-8">
              {images.length > 1 && (
                <button
                  type="button"
                  aria-label="Ver imagen anterior"
                  onClick={showPreviousImage}
                  className="absolute left-4 rounded-full bg-white p-3 text-[#004D77] shadow-md"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="max-h-[400px] w-full object-contain"
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
                    className="absolute right-4 rounded-full bg-white p-3 text-[#004D77] shadow-md"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <span className="absolute bottom-4 right-4 rounded-full bg-[#004D77] px-3 py-1 text-xs font-bold text-white">
                    {selectedImageIndex + 1}/{images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-20 w-20 rounded-2xl border bg-white p-2 ${
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

          <div className="rounded-[28px] border border-[#e4eff6] bg-white p-7 shadow-sm">
            <span className="inline-block rounded-full bg-[#e8f4fd] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#004D77]">
              {categoryName}
            </span>
            <h1 className="mt-5 text-3xl font-black text-[#0c2a3a]">
              {product.name}
            </h1>
            <p className="mt-4 leading-7 text-slate-600">
              {product.description || "Este producto no tiene descripciÃ³n disponible."}
            </p>

            <div className="mt-6 text-xs font-black uppercase tracking-wider text-slate-500">
              {pricing.label}
            </div>
            {pricing.hasDiscount && (
              <div className="mt-2 font-bold text-slate-400 line-through">
                ${pricing.originalPrice.toLocaleString("es-CO")} COP
              </div>
            )}
            <div className="mt-1 text-4xl font-black text-[#004D77]">
              ${totalPrice.toLocaleString("es-CO")}
              <span className="ml-2 text-sm text-slate-400">COP</span>
            </div>

            <p className="mt-4 font-bold text-slate-600">
              {available ? `${stock} unidades disponibles` : "Producto agotado"}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex overflow-hidden rounded-full border border-slate-200">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(current => Math.max(1, current - 1))}
                  className="bg-slate-50 p-3 disabled:opacity-40"
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
                  className="w-16 border-x border-slate-200 px-2 text-center font-black outline-none disabled:bg-slate-100"
                />
                <button
                  type="button"
                  disabled={!available || quantity >= stock}
                  onClick={() => setQuantity(current => Math.min(stock, current + 1))}
                  className="bg-slate-50 p-3 disabled:opacity-40"
                >
                  <Plus size={17} />
                </button>
              </div>

              <button
                type="button"
                disabled={!available}
                onClick={handleAddToCart}
                className="flex items-center gap-2 rounded-full bg-[#004D77] px-6 py-3 font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingCart size={17} />
                {available ? "AÃ±adir al carrito" : "Producto agotado"}
              </button>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="font-black uppercase tracking-wider text-slate-700">
                InformaciÃ³n del producto
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {product.reference && <li>Referencia: {product.reference}</li>}
                <li>Unidad: {product.unitMeasure?.name || "Unidad"}</li>
                <li>Stock disponible: {stock}</li>
              </ul>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#004D77]">
              TambiÃ©n te puede interesar
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
                className="shrink-0 rounded-full border border-slate-200 bg-white p-3 text-[#004D77]"
              >
                <ChevronLeft size={18} />
              </button>

              <div
                ref={relatedRef}
                className="flex flex-1 gap-4 overflow-x-auto scroll-smooth py-2"
              >
                {relatedProducts.map(relatedProduct => (
                  <div key={relatedProduct.id} className="w-56 shrink-0">
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
                className="shrink-0 rounded-full border border-slate-200 bg-white p-3 text-[#004D77]"
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

