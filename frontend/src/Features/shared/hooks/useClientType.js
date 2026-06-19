// useClientType.js - Hook para obtener clientType del usuario

import { useState, useEffect } from 'react';

/**
 * Hook para obtener el tipo de cliente del usuario autenticado
 * Si no está autenticado, retorna 'DETAL' por defecto
 * @returns {string} clientType: 'DETAL' | 'MAYORISTA' | 'COLEGA' | 'PACAS'
 */
export const useClientType = () => {
  const [clientType, setClientType] = useState('DETAL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientType = async () => {
      try {
        // Intentar obtener del localStorage primero (cached)
        const cached = localStorage.getItem('clientType');
        if (cached) {
          setClientType(cached);
          setLoading(false);
          return;
        }

        // Verificar si hay token (usuario autenticado)
        const token = localStorage.getItem('token');
        if (!token) {
          // No autenticado → DETAL
          setClientType('DETAL');
          setLoading(false);
          return;
        }

        // Obtener clientType desde el backend
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const type = data.client?.client_type || 'DETAL';
          
          // Guardar en localStorage para futuras cargas
          localStorage.setItem('clientType', type);
          setClientType(type);
        } else {
          // Token inválido → DETAL
          setClientType('DETAL');
        }
      } catch (error) {
        console.error('Error loading clientType:', error);
        // En caso de error → DETAL
        setClientType('DETAL');
      } finally {
        setLoading(false);
      }
    };

    loadClientType();
  }, []);

  return { clientType, loading };
};

export default useClientType;