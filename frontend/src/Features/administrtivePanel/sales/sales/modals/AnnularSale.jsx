import { useLocation, useNavigate } from 'react-router-dom';
import CancelOrder from '../../orders/modals/CancelOrder';

function AnnularSale() {
  const location = useLocation();
  const navigate = useNavigate();
  const sale = location.state?.sale ?? null;

  if (!sale) {
    navigate('/admin/sales');
    return null;
  }

  return (
    <CancelOrder
      sale={sale}
      contexto="venta"
    />
  );
}

export default AnnularSale;
