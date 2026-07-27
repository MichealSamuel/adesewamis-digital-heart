/**
 * Tiny Web Audio sound-effect kit — no audio files, no network cost.
 * Every sound is synthesised on demand from a single shared AudioContext.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call once from a user gesture so mobile browsers allow audio. */
export function unlockSfx() {
  ensure();
}

export function setSfxMuted(value: boolean) {
  muted = value;
}

export function isSfxMuted() {
  return muted;
}

type ToneOpts = {
  freq: number;
  to?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
};

function tone({ freq, to, dur = 0.18, type = "sine", gain = 0.15, delay = 0 }: ToneOpts) {
  const c = ensure();
  if (!c || !master || muted) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(dur = 0.25, gain = 0.06, filterFrom = 900, filterTo = 200) {
  const c = ensure();
  if (!c || !master || muted) return;
  const t = c.currentTime;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(filterFrom, t);
  bp.frequency.exponentialRampToValueAtTime(filterTo, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
}

export const sfx = {
  /** Soft mechanical key tick for the opening typewriter. */
  type() {
    const c = ensure();
    if (!c || muted) return;
    tone({
      freq: 1500 + Math.random() * 500,
      to: 700,
      dur: 0.035,
      type: "square",
      gain: 0.022,
    });
  },
  /** Gentle UI tap. */
  tap() {
    tone({ freq: 620, to: 880, dur: 0.09, type: "triangle", gain: 0.07 });
  },
  /** Card flip — airy swish. */
  flip() {
    noise(0.22, 0.045, 1600, 400);
    tone({ freq: 880, to: 1320, dur: 0.16, type: "sine", gain: 0.05 });
  },
  /** Celebration sparkle for confetti / opening the gift. */
  sparkle() {
    [880, 1174.66, 1567.98, 2093].forEach((f, i) =>
      tone({ freq: f, dur: 0.5, type: "sine", gain: 0.06, delay: i * 0.07 }),
    );
  },
  /** Warm chime for revealing the hidden surprise. */
  chime() {
    [523.25, 659.25, 783.99].forEach((f, i) =>
      tone({ freq: f, dur: 0.9, type: "sine", gain: 0.055, delay: i * 0.1 }),
    );
  },
  /** Modal / panel closing. */
  close() {
    tone({ freq: 520, to: 240, dur: 0.2, type: "sine", gain: 0.06 });
  },
  /** Video play. */
  play() {
    tone({ freq: 440, to: 660, dur: 0.14, type: "triangle", gain: 0.06 });
  },
  /** Video pause. */
  pause() {
    tone({ freq: 440, to: 300, dur: 0.14, type: "triangle", gain: 0.06 });
  },
};
