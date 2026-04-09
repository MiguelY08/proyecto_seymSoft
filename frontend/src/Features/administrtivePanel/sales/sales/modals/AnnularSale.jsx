// src/features/administrtivePanel/sales/modals/AnnularSale.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CancelOrder from '../../orders/modals/CancelOrder';

function AnnularSale() {
  const location = useLocation();
  const navigate = useNavigate();
  const sale = location.state?.sale ?? null;

  const handleClose = () => {
    navigate('/admin/sales');
  };

  const handleConfirm = async (motivo) => {
    // La lógica real de anulación está dentro de CancelOrder cuando contexto="venta"
    // Aquí solo necesitamos pasar el control; CancelOrder se encarga de llamar a SalesServices.anular
    // y luego cerrar. No necesitamos hacer nada adicional aquí.
  };

  if (!sale) {
    navigate('/admin/sales');
    return null;
  }

  return (
    <CancelOrder
      sale={sale}
      contexto="venta"
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
}

export default AnnularSale;