import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

/**
 * Minimal video player: always muted, no native chrome,
 * a single accessible play/pause control.
 */
export function CleanVideo({
  src,
  className = "",
  autoPlay = false,
  label = "memory video",
}: {
  src: string;
  className?: string;
  autoPlay?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || !autoPlay) return;
    v.muted = true;
    v.play().catch(() => setPlaying(false));
  }, [autoPlay]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        loop
        preload="metadata"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
        className="w-full cursor-pointer bg-foreground/5"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        aria-pressed={playing}
        className="absolute bottom-3 left-3 flex size-11 items-center justify-center rounded-full bg-card/80 text-primary shadow-[var(--shadow-soft)] backdrop-blur-md transition hover:scale-105 active:scale-95"
      >
        {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-[1px]" />}
      </button>
    </div>
  );
}
