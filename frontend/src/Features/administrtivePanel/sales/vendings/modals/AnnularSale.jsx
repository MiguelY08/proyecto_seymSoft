import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CancelOrder from '../../orders/modals/CancelOrder';
import { SalesServices } from '../services/salesServices';
import Spinner from '../../../../shared/spinner';
import { useAlert } from '../../../../shared/alerts/useAlert';

function AnnularSale() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSale = async () => {
      try {
        const result = await SalesServices.getById(id);
        if (!result) {
          showError('Venta no encontrada', 'No fue posible encontrar la venta solicitada.');
          navigate('/admin/sales', { replace: true });
          return;
        }
        setSale(result);
      } catch (error) {
        showError('No se pudo cargar la venta', error.message || 'Inténtalo nuevamente.');
        navigate('/admin/sales', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [id, navigate, showError]);

  if (loading || !sale) {
    return <Spinner message="Cargando venta..." className="min-h-[calc(100dvh-5rem)]" />;
  }

  return (
    <CancelOrder
      sale={sale}
      contexto="venta"
      isPage
      onClose={() => navigate('/admin/sales')}
    />
  );
}

export default AnnularSale;
