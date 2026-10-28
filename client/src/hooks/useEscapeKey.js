import { useEffect, useRef } from 'react';

/**
 * Calls `handler` when Escape is pressed. Used by dialogs to stay keyboard
 * friendly without trapping keys globally.
 */
export function useEscapeKey(handler, active = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        handlerRef.current?.(event);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
}
