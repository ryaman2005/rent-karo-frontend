import { useState, useEffect, useCallback } from "react";

/**
 * Tracks mouse position relative to window center and returns
 * parallax offset values (x, y) scaled by the given intensity.
 * Use these to shift background layers at different speeds.
 */
export function useParallax(intensity = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback(
    (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const x = (e.clientX - cx) * intensity;
      const y = (e.clientY - cy) * intensity;
      setOffset({ x, y });
    },
    [intensity]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [handleMouse]);

  return offset;
}
