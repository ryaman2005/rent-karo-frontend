import { useEffect, useRef, useState } from "react";

/**
 * CinematicText — character-by-character reveal animation.
 * Each character fades + slides up with staggered delay.
 *
 * Props:
 *  - text: string to reveal
 *  - as: HTML tag (default "span")
 *  - className: extra classes
 *  - delay: base delay in ms before animation starts
 *  - stagger: ms between each character (default 30)
 */
export default function CinematicText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 30,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={`cinematic-text-wrapper ${className}`} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="cinematic-char"
          style={{
            animationDelay: `${i * stagger}ms`,
            animationPlayState: visible ? "running" : "paused",
          }}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
