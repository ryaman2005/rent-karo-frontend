import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

/**
 * SplashScreen — full-screen branded cinematic intro.
 * Shows once per session (sessionStorage flag).
 * After the animation completes, calls `onComplete` so the app can render.
 */
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("logo"); // logo → text → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(() => onComplete(), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${
        phase === "exit" ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ background: "#020917" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-glow-pulse"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* Logo */}
      <div
        className={`transition-all duration-700 ease-out ${
          phase === "logo" ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ transitionDelay: phase === "logo" ? "0ms" : "0ms" }}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-8 mx-auto splash-logo-pulse">
          <Sparkles size={36} className="text-white" />
        </div>
      </div>

      {/* Brand name */}
      <div
        className={`transition-all duration-700 ease-out ${
          phase === "text" || phase === "exit"
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <h1 className="text-6xl md:text-7xl font-black tracking-tight">
          <span className="text-shimmer">rentKaro</span>
        </h1>
        <p className="text-slate-500 text-center mt-3 text-sm tracking-widest uppercase font-medium">
          Rent Smarter. Live Better.
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            style={{
              animation: "splashDot 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
