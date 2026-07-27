import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Ambient, CursorSparkles } from "@/components/birthday/Ambient";
import { Loader } from "@/components/birthday/Loader";
import { Reveal } from "@/components/birthday/Reveal";
import { MusicToggle } from "@/components/birthday/MusicToggle";
import { VideoModal } from "@/components/birthday/VideoModal";
import { CleanVideo } from "@/components/birthday/CleanVideo";
import { sfx, unlockSfx } from "@/lib/sfx";
import futureArt from "@/assets/future.jpg";

/** Served from /public/media so they work on any host (Lovable, Vercel, etc). */
const MEDIA = {
  photo1: "/media/photo1.jpg",
  photo2: "/media/photo2.jpg",
  photo3: "/media/photo3.jpg",
  funny: "/media/funny.mp4",
  memory2: "/media/memory2.mp4",
};



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, Adesewami — A Little Gift From Me" },
      {
        name: "description",
        content:
          "A little gift for you babe ❤️",
      },
      { property: "og:title", content: "Happy Birthday, Adesewami — A Little Gift From Me" },
      {
        property: "og:description",
        content: "A little gift for you babe ❤️",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Birthday,
});

const STORY = [
  { icon: "✨", title: "The first conversation", text: "Two strangers, one message — and somehow the night disappeared." },
  { icon: "✨", title: 'The first "My Baby"', text: "Two small words that quietly changed everything." },
  { icon: "✨", title: "Every random laugh", text: "The ones that show up out of nowhere and stay all day." },
  { icon: "✨", title: "Every little moment", text: "The tiny ones nobody else would notice. I noticed all of them." },
  { icon: "🤍", title: "Today", text: "Happy Birthday ❤️" },
];

const SECRETS = [
  "You became one of the safest people in my life.",
  "Even when we're not talking, you're still on my mind.",
  "You've made ordinary days feel special.",
  "Thank you for simply being you.",
  "You mean more to me than you probably realise.",
];

const FUTURE = [
  "We'll celebrate your birthday together.",
  "I'll finally get all those hugs you still owe me.",
  "We'll look back at this site and smile.",
  "I'll still choose you.",
];

function burst() {
  const colors = ["#FADADD", "#F6E7C1", "#E7D8F5", "#FFFFFF", "#E8B4A0"];
  confetti({ particleCount: 90, spread: 78, origin: { y: 0.6 }, colors, scalar: 0.9 });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 65, origin: { x: 0 }, colors }), 220);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 65, origin: { x: 1 }, colors }), 340);
}

function Birthday() {
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const finishLoad = useCallback(() => setLoading(false), []);

  // Browsers only allow audio after a gesture — unlock on the first interaction.
  useEffect(() => {
    const unlock = () => unlockSfx();
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      burst();
      sfx.sparkle();
    }, 400);
    return () => clearTimeout(t);
  }, [loading]);

  const openGift = () => {
    setOpened(true);
    burst();
    sfx.sparkle();
    setTimeout(() => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" }), 500);
  };


  return (
    <>
      {loading && <Loader onDone={finishLoad} />}
      <Ambient />
      <CursorSparkles />
      <MusicToggle />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />

      <main
        className="relative z-10"
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 1200ms ease",
        }}
      >
        {/* Hero */}
        <section className="mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <p className="mb-6 text-[11px] uppercase tracking-[0.42em] text-foreground/45">
              26 · a little gift
            </p>
            <h1 className="font-display text-[2.7rem] leading-[1.05] sm:text-7xl">
              Happy Birthday,
              <span className="block text-gold">Adesewami 🤍</span>
            </h1>
            <p className="mx-auto mt-8 max-w-md text-[15px] leading-relaxed text-foreground/65">
              I wanted to give you something more than just another birthday message...
              <span className="mt-2 block">So I built you something you'll always have.</span>
            </p>
            <button
              onClick={openGift}
              className="glow-ring mt-12 rounded-full px-14 py-4 font-display text-xl tracking-wide text-primary-foreground transition-transform duration-500 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(120deg, var(--primary), var(--gold))" }}
            >
              {opened ? "Keep scrolling 🤍" : "Open"}
            </button>
            <p className="mt-14 animate-bounce text-xl text-primary/40">↓</p>
          </Reveal>
        </section>

        {/* Story */}
        <Section id="story" eyebrow="chapter one" title="Our Little Story">
          <div className="relative mx-auto max-w-2xl pl-8 sm:pl-12">
            <div className="absolute left-2 top-2 h-full w-px bg-gradient-to-b from-primary/40 via-gold/40 to-transparent sm:left-3" />
            {STORY.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="relative mb-6">
                  <span className="absolute -left-[26px] top-7 size-2.5 rounded-full bg-gold shadow-[0_0_12px_var(--gold)] sm:-left-[38px]" />
                  <article className="glass rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1">
                    <p className="text-lg">{s.icon}</p>
                    <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/60">{s.text}</p>
                  </article>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Flip cards */}
        <Section eyebrow="chapter two" title="Things You Probably Don't Know" subtitle="Tap a card.">
          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
            {SECRETS.map((s, i) => (
              <Reveal key={s} delay={i * 70}>
                <FlipCard index={i + 1} text={s} />
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Memories */}
        <Section eyebrow="chapter three" title="Memories" subtitle="A few pieces of you I keep.">
          <div className="mx-auto flex max-w-lg flex-col gap-10">
            <Reveal>
              <Polaroid src={MEDIA.photo1} caption="That smile. Exhibit A." />
            </Reveal>
            <Reveal delay={80}>
              <Polaroid src={MEDIA.photo2} caption="Exhibit B. Still unfair." />
            </Reveal>
            <Reveal delay={120}>
              <VideoPolaroid
                src={MEDIA.funny}
                title="It wasn't my fault that day 😂❤️"
                caption="Don't worry... I'll never let you forget this day."
                label="the funny memory"
              />
            </Reveal>
            <Reveal delay={160}>
              <Polaroid src={MEDIA.photo3} caption="Exhibit C. My favourite face 🥺" />
            </Reveal>
            <Reveal delay={200}>
              <VideoPolaroid
                src={MEDIA.memory2}

                title="Another one I kept 🤍"
                caption="Press play — it still makes me smile."
                label="another memory"
              />
            </Reveal>

          </div>
        </Section>

        {/* Future */}
        <Section eyebrow="chapter four" title="One Day...">
          <Reveal>
            <img
              src={futureArt}
              alt="Two silhouettes reaching for each other under a starry sky"
              width={1280}
              height={800}
              loading="lazy"
              className="mx-auto mb-10 w-full max-w-xl rounded-[28px] opacity-90 mix-blend-multiply"
            />
          </Reveal>
          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
            {FUTURE.map((f, i) => (
              <Reveal key={f} delay={i * 80}>
                <div className="glass h-full rounded-3xl p-7 transition-transform duration-500 hover:-translate-y-1">
                  <p className="font-script text-sm tracking-widest text-gold">One day...</p>
                  <p className="mt-3 font-display text-2xl leading-snug">{f}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Letter */}
        <Section eyebrow="chapter five" title="An Open Message To My World 🌍 ❤️">
          <Reveal>
            <article
              className="mx-auto max-w-xl rounded-[30px] p-9 sm:p-14"
              style={{
                background: "linear-gradient(165deg, oklch(0.995 0.008 88), oklch(0.97 0.02 350))",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <div className="space-y-6 font-display text-2xl leading-relaxed text-foreground/85 sm:text-[1.7rem]">
                <p>Happy Birthday, babe 😗💕</p>
                <p>My baby's finally 18 😂 ❤️</p>
                <p>4month and still counting, can't wait to see you 😭</p>
                <p className="text-gold">I love you. ❤️</p>
              </div>
              <div className="mt-10 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              <p className="mt-6 text-right font-script text-lg text-foreground/60">— Me 🙂💍❤️</p>
            </article>
          </Reveal>
        </Section>

        {/* Hidden surprise */}
        <div className="flex justify-center px-6 pb-24">
          <Reveal>
            <button
              onClick={() => {
                setVideoOpen(true);
                sfx.chime();
                burst();

              }}
              className="rounded-full border border-dashed border-primary/40 px-6 py-2.5 text-xs tracking-wide text-foreground/45 transition-all hover:scale-105 hover:text-primary"
            >
              Don't press this 👀
            </button>
          </Reveal>
        </div>

        {/* Ending */}
        <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
          <Reveal>
            <h2 className="font-display text-4xl leading-tight sm:text-6xl">
              Happy Birthday, <span className="text-gold">Adesewa.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-lg text-[15px] leading-loose text-foreground/65">
              I pray this new year brings you peace, joy, favour, answered prayers and endless
              reasons to smile.
            </p>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-loose text-foreground/65">
              Thank you for being one of the most special people in my life.
            </p>
            <p className="mt-8 font-display text-3xl">I love you.</p>
            <p className="mt-4 text-3xl text-primary" style={{ animation: "breathe 3s ease-in-out infinite" }}>
              ❤️
            </p>
            <p className="mt-8 font-script text-lg text-foreground/60">— Your Man "Me 🙂💍❤️"</p>
          </Reveal>
        </section>

        <footer className="pb-14 text-center text-[11px] tracking-[0.3em] text-foreground/40 uppercase">
          Made with love. <span className="block mt-2">Especially for Adesewa.</span>
        </footer>
      </main>
    </>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-6 py-20 sm:py-28">
      <Reveal>
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.42em] text-gold">{eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h2>
          {subtitle && <p className="mt-3 text-sm text-foreground/55">{subtitle}</p>}
        </header>
      </Reveal>
      {children}
    </section>
  );
}

function FlipCard({ text, index }: { text: string; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => {
        sfx.flip();
        setFlipped((f) => !f);
      }}

      className="h-44 w-full [perspective:1200px]"
      aria-label="Reveal message"
    >
      <div
        className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        <div className="glass absolute inset-0 flex flex-col items-center justify-center rounded-3xl [backface-visibility:hidden]">
          <span className="font-display text-4xl text-primary/70">❤</span>
          <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-foreground/40">
            No. {index}
          </span>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center rounded-3xl px-7 text-center [backface-visibility:hidden]"
          style={{
            transform: "rotateY(180deg)",
            background: "linear-gradient(150deg, oklch(0.97 0.03 350), oklch(0.96 0.035 300))",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <p className="font-display text-xl leading-snug">{text}</p>
        </div>
      </div>
    </button>
  );
}

function Polaroid({ src, caption }: { src: string; caption: string }) {
  return (
    <figure className="glass rotate-[1.2deg] rounded-[26px] p-3 transition-all duration-500 hover:rotate-0 hover:-translate-y-1.5">
      <img
        src={src}
        alt={caption}
        loading="lazy"
        className="aspect-[4/5] w-full rounded-[18px] object-cover"
      />
      <figcaption className="px-3 pb-2 pt-5 text-center font-script text-base text-foreground/65">
        {caption}
      </figcaption>
    </figure>
  );
}

function VideoPolaroid({
  src,
  title,
  caption,
  label,
}: {
  src: string;
  title: string;
  caption: string;
  label: string;
}) {
  return (
    <figure className="glass rotate-[-1deg] rounded-[26px] p-3 transition-transform duration-500 hover:rotate-0 hover:-translate-y-1.5">
      <CleanVideo src={src} label={label} className="rounded-[18px]" />
      <figcaption className="px-3 pb-3 pt-5 text-center">
        <p className="font-display text-xl">{title}</p>
        <p className="mt-1 text-xs text-foreground/55">{caption}</p>
      </figcaption>
    </figure>
  );
}
