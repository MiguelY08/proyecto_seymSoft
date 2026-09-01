import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductsService from '../services/productsServices';
import Spinner from '../../../../shared/spinner';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { getProductAlertError } from '../helpers/productAlertMessages';

function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [producto, setProducto] = useState(null);
  const [existingProducts, setExistingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [selectedProduct, products] = await Promise.all([
          ProductsService.findById(id),
          ProductsService.list(),
        ]);

        if (!selectedProduct) {
          showError('Producto no encontrado', 'El producto solicitado ya no existe. Regresarás al listado para consultar los productos disponibles.');
          navigate('/admin/purchases/products', { replace: true });
          return;
        }

        setProducto(selectedProduct);
        setExistingProducts(products);
      } catch (error) {
        console.error('Error al cargar el producto:', error);
        const alert = getProductAlertError(error, 'loadForm');
        showError(alert.title, alert.text);
        navigate('/admin/purchases/products', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, showError]);

  if (loading || !producto) {
    return <Spinner message="Cargando producto..." />;
  }

  return (
    <ProductForm
      mode="edit"
      producto={producto}
      onClose={() => navigate('/admin/purchases/products')}
      onSuccess={() => navigate('/admin/purchases/products')}
      existingProducts={existingProducts}
    />
  );
}

export default EditProductPage;
