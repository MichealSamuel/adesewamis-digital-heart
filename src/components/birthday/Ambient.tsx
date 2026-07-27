import { useEffect, useRef, useState } from "react";

type Bit = { id: number; left: number; delay: number; dur: number; size: number; kind: "heart" | "spark" };

export function Ambient() {
  const [bits, setBits] = useState<Bit[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = window.innerWidth < 640 ? 10 : 16;
    const list: Bit[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 18,
      dur: 16 + Math.random() * 16,
      size: 8 + Math.random() * 16,
      kind: i % 3 === 0 ? "spark" : "heart",
    }));
    setBits(list);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {bits.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-10vh] will-change-transform"
          style={{
            left: `${b.left}%`,
            fontSize: `${b.size}px`,
            animation: `float-up ${b.dur}s linear ${b.delay}s infinite`,
          }}
        >
          {b.kind === "heart" ? (
            <span className="text-primary/50">♥</span>
          ) : (
            <span className="text-gold/70">✦</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function CursorSparkles() {
  const [dots, setDots] = useState<{ id: number; x: number; y: number }[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    let last = 0;
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last < 110) return;
      last = now;
      const dot = { id: id++, x: e.clientX, y: e.clientY };
      setDots((d) => [...d.slice(-7), dot]);
      const t = window.setTimeout(
        () => setDots((d) => d.filter((p) => p.id !== dot.id)),
        900,
      );
      timers.current.push(t);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute text-gold will-change-transform"
          style={{
            left: d.x,
            top: d.y,
            fontSize: "12px",
            transform: "translate(-50%,-50%)",
            animation: "twinkle 0.9s ease-out forwards",
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
