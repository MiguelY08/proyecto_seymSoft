import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useModalAnimation(returnTo = -1) {
  const navigate  = useNavigate();
  const [visible, setVisible] = useState(false);   // controla la clase CSS

  // Montar → esperar 1 frame → activar animación de entrada
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Cerrar: primero animación de salida, luego navegar
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => navigate(returnTo), 250);
  };

  return { visible, handleClose };
}