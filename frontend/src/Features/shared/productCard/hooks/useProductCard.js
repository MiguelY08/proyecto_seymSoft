import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../Context/CartContext';
import { useFavorites } from '../../Context/Favoritescontext';
import { useAlert } from '../../alerts/useAlert';

export function useProductCard(product) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showSuccess } = useAlert();

  const [heartPopping, setHeartPopping] = useState(false);
  const [isHoveringHeart, setIsHoveringHeart] = useState(false);

  const favorited = isFavorite(product.id);

  const handleFavorite = (e) => {
    e.stopPropagation();
    const wasAdded = toggleFavorite(product);
    setHeartPopping(true);
    setTimeout(() => setHeartPopping(false), 420);
    showSuccess(
      wasAdded ? 'Agregado a favoritos' : 'Eliminado de favoritos',
      wasAdded
        ? `${product.name} se agregó a tu lista de deseos`
        : `${product.name} se eliminó de tu lista de deseos`
    );
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    showSuccess('Añadido al carrito', `${product.name} se ha agregado al carrito.`);
  };

  const goToDetail = () => navigate(`/shop/detail/${product.id}`);

  return {
    favorited,
    heartPopping,
    isHoveringHeart,
    setIsHoveringHeart,
    handleFavorite,
    handleAddToCart,
    goToDetail,
  };
}