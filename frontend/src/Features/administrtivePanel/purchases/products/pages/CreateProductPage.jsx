import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductsService from '../services/productsServices';
import Spinner from '../../../../shared/spinner';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { getProductAlertError } from '../helpers/productAlertMessages';

function CreateProductPage() {
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [existingProducts, setExistingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setExistingProducts(await ProductsService.list());
      } catch (error) {
        console.error('Error al cargar productos existentes:', error);
        setExistingProducts([]);
        const alert = getProductAlertError(error, 'loadForm');
        showError(alert.title, `${alert.text} No se pudo verificar si la referencia o el código de barras ya existen.`);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [showError]);

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
