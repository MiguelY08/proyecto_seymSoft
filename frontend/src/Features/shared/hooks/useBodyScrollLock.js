import { useEffect } from 'react';

let activeLocks = 0;
let originalStyles = null;

/** Bloquea el desplazamiento de la página mientras haya uno o más modales abiertos. */
export default function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;

    const { body, documentElement } = document;

    if (activeLocks === 0) {
      originalStyles = {
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
        overscrollBehavior: documentElement.style.overscrollBehavior,
      };

      const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
      documentElement.style.overscrollBehavior = 'none';
    }

    activeLocks += 1;

    return () => {
      activeLocks -= 1;

      if (activeLocks === 0 && originalStyles) {
        body.style.overflow = originalStyles.overflow;
        body.style.paddingRight = originalStyles.paddingRight;
        documentElement.style.overscrollBehavior = originalStyles.overscrollBehavior;
        originalStyles = null;
      }
    };
  }, [isLocked]);
}
