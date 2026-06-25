import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductsService from '../services/productsServices';
import Spinner from '../../../../shared/spinner';

function CreateProductPage() {
  const navigate = useNavigate();
  const [existingProducts, setExistingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setExistingProducts(await ProductsService.list());
      } catch (error) {
        console.error('Error al cargar productos existentes:', error);
        setExistingProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <Spinner message="Preparando formulario..." />;
  }

  return (
    <ProductForm
      mode="create"
      onClose={() => navigate('/admin/purchases/products')}
      onSuccess={() => navigate('/admin/purchases/products')}
      existingProducts={existingProducts}
    />
  );
}

export default CreateProductPage;
