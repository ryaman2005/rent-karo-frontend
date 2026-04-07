import { useScrollProgress } from "../hooks/useScrollProgress";

/**
 * ScrollProgress — thin gradient progress bar pinned to the top of the viewport.
 * Grows from 0% to 100% width as the user scrolls.
 */
export default function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(0 80% 70%))',
          boxShadow: "0 0 12px rgba(99,102,241,0.6), 0 0 30px rgba(99,102,241,0.2)",
        }}
      />
    </div>
  );
}
