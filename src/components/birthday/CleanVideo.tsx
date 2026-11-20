import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { sfx } from "@/lib/sfx";
import { Button } from "@/components/ui/button";

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
    if (v.paused) {
      sfx.play();
      v.play().catch(() => {});
    } else {
      sfx.pause();
      v.pause();
    }
  };

  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        loop
        preload="none"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
        className="aspect-[9/16] w-full cursor-pointer bg-foreground/5 object-cover"
      />
      <Button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        aria-pressed={playing}
        variant="outline"
        size="icon"
        className="pixel-video-toggle absolute bottom-3 left-3 z-10"
      >
        {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-[1px]" />}
      </Button>
    </div>
  );
}
