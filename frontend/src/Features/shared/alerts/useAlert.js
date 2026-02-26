import { useContext } from 'react';
import { AlertContext } from './AlertContext';

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert debe usarse dentro de <AlertProvider>');
  return context;
}