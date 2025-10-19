import { useEffect, useRef, useState } from "react";

export function useAnimationFrame(enabled: boolean) {
  const rafRef = useRef<number | null>(null);
  const [now, setNow] = useState<number>(() => performance.now());

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    let mounted = true;
    const step = () => {
      if (!mounted) return;
      setNow(performance.now());
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      mounted = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled]);

  return now;
}