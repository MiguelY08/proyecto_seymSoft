import { useMemo } from 'react';
import { normalizeClientType } from '../utils/shopPricingHelper';
import useAuthenticatedClient from './useAuthenticatedClient';

/**
 * Obtiene el tipo de cliente desde el cliente administrado por AuthContext.
 * Los visitantes y usuarios sin tipo asociado usan precio DETAL.
 */
export const useClientType = () => {
  const {
    clientType: authenticatedClientType,
    isAuthenticated,
    loading,
  } = useAuthenticatedClient();

  const clientType = useMemo(() => {
    if (!isAuthenticated) return 'DETAL';
    return normalizeClientType(authenticatedClientType);
  }, [authenticatedClientType, isAuthenticated]);

  return {
    clientType,
    loading,
    isAuthenticated,
  };
};

export default useClientType;
