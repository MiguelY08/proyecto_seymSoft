import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../access/context/AuthContext';
import { useAlert } from '../alerts/useAlert';

export function useStorefrontAuthGuard() {
  const { isAuthenticated } = useAuth();
  const { showConfirm } = useAlert();
  const navigate = useNavigate();

  return useCallback(async (destination) => {
    if (isAuthenticated) return true;

    const result = await showConfirm(
      'info',
      'Inicia sesión',
      `Inicia sesión para agregar productos a ${destination}.`,
      {
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Registrar cuenta',
        showCloseButton: true,
      },
    );

    if (result.isDismissed) return false;

    navigate(result.isConfirmed ? '/login' : '/register');
    return false;
  }, [isAuthenticated, navigate, showConfirm]);
}
