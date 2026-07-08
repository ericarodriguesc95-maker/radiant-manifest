import { useEffect, useRef } from "react";

/**
 * Scroll window to top whenever `value` changes (skips the initial mount).
 * Useful for tab-switching UIs so the new tab always opens from the top.
 */
export function useScrollTopOnChange(value: unknown) {
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [value]);
}
