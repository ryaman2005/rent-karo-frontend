import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to all elements matching [data-reveal]
 * inside a given container ref. When they enter the viewport, adds `.visible`.
 */
export function useScrollReveal(containerRef, deps = []) {
  useEffect(() => {
    const container = containerRef?.current || document;
    const els = container.querySelectorAll("[data-reveal]");

    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || "0";
            setTimeout(() => el.classList.add("visible"), parseInt(delay));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
