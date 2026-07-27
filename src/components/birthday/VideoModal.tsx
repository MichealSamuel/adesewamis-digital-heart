import { useEffect } from "react";
import { X } from "lucide-react";
import { CleanVideo } from "./CleanVideo";
import funnyVideo from "@/assets/funny.mp4.asset.json";


export function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-10"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ animation: "fade-in 400ms ease" }}
    >
      <div className="absolute inset-0 bg-foreground/55 backdrop-blur-md" />
      <div
        className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-3"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "enter 600ms cubic-bezier(.16,1,.3,1)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-10 rounded-full bg-card/80 p-2 text-foreground/70 transition hover:text-primary"
        >
          <X className="size-4" />
        </button>
        <CleanVideo
          src={funnyVideo.url}
          autoPlay
          label="the surprise video"
          className="rounded-2xl"
        />

        <p className="px-4 py-5 text-center font-display text-lg italic text-foreground/75">
          These are the little moments I never want to forget.
        </p>
      </div>
    </div>
  );
}
