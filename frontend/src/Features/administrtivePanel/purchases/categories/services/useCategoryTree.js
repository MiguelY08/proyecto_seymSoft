import { useState, useEffect } from 'react';
import { getCategories, getSubcategories } from './categoriesService';

/**
 * Construye el árbol de categorías activas desde los servicios.
 *
 * Retorna un objeto con la forma:
 *   { "Oficina": ["Lapiceros", "Archivadores"], "Arte y Manualidades": [], ... }
 *
 * Solo incluye categorías y subcategorías con estado "Activo".
 * Se recalcula cada vez que el modal se abre (depende de `isOpen`).
 *
 * @param {boolean} isOpen - Señal para refrescar cuando el modal se monta.
 * @returns {{ [catNombre: string]: string[] }}
 */
export const useCategoryTree = (isOpen = true) => {

  const [tree, setTree] = useState({});

  useEffect(() => {

    if (!isOpen) return;

    const activeCats = getCategories().filter((c) => c.estado === 'Activo');
    const activeSubs = getSubcategories().filter((s) => s.estado === 'Activo');

    const built = {};

    activeCats.forEach((cat) => {
      built[cat.nombre] = activeSubs
        .filter((s) => s.categoriaId === cat.id)
        .map((s) => s.nombre);
    });

    setTree(built);

  }, [isOpen]);

  return tree;

};