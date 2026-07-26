import { useEffect, useState } from "react";

const LINES = [
  "Some people become part of your story without even trying...",
  "Today is about one of those people.",
];

export function Loader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (step >= LINES.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const line = LINES[step];
    setTyped("");
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i >= line.length) {
        clearInterval(iv);
        setTimeout(() => setStep((s) => s + 1), 1600);
      }
    }, 42);
    return () => clearInterval(iv);
  }, [step, onDone]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 text-center">
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-dream)" }}
      />
      <p
        key={step}
        className="relative max-w-xl font-display text-2xl leading-relaxed text-foreground/80 sm:text-4xl"
        style={{ animation: "breathe 4s ease-in-out infinite" }}
      >
        {typed}
        <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-primary align-middle" style={{ height: "1em" }} />
      </p>
    </div>
  );
}
