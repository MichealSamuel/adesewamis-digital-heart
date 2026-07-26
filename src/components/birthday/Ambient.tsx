import { useEffect, useState } from "react";

type Bit = { id: number; left: number; delay: number; dur: number; size: number; kind: "heart" | "spark" };

export function Ambient() {
  const [bits, setBits] = useState<Bit[]>([]);

  useEffect(() => {
    const list: Bit[] = Array.from({ length: 26 }, (_, i) => ({
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
          className="absolute bottom-[-10vh]"
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

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    let id = 0;
    let last = 0;
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last < 55) return;
      last = now;
      const dot = { id: id++, x: e.clientX, y: e.clientY };
      setDots((d) => [...d.slice(-14), dot]);
      setTimeout(() => setDots((d) => d.filter((p) => p.id !== dot.id)), 900);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute text-gold"
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
