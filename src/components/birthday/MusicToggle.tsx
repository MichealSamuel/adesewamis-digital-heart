import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

/** Soft generated ambient chord pad — no external audio file needed. */
export function MusicToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const toggle = async () => {
    if (on) {
      stopRef.current?.();
      stopRef.current = null;
      setOn(false);
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 2.5);

    const notes = [261.63, 329.63, 392.0, 493.88, 587.33];
    const oscs = notes.map((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.value = 0.22 / (i + 1);
      lfo.frequency.value = 0.06 + i * 0.03;
      lfoGain.gain.value = g.gain.value * 0.8;
      lfo.connect(lfoGain).connect(g.gain);
      o.connect(g).connect(master);
      o.start();
      lfo.start();
      return [o, lfo] as const;
    });

    stopRef.current = () => {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setTimeout(() => oscs.flat().forEach((o) => o.stop()), 1400);
    };
    setOn(true);
  };

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Turn music off" : "Turn music on"}
      className="glass fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs tracking-wide text-foreground/70 transition-all hover:scale-105 hover:text-primary"
    >
      {on ? <Pause className="size-3.5" /> : <Music className="size-3.5" />}
      {on ? "Music on" : "Music off"}
    </button>
  );
}
