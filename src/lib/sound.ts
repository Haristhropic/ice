"use client";
/* Sound engine: WebAudio, lazy init, single shared context. */
let ctx: AudioContext | null = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
}

export function unlockAudio() {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      ctx = null;
    }
  }
  void ctx?.resume();
}

function tone(
  freq: number,
  dur = 0.15,
  type: OscillatorType = "sine",
  vol = 0.22,
  when = 0,
) {
  if (muted || !ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t = ctx.currentTime + when;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(dur = 0.6, vol = 0.2, when = 0) {
  // white-noise buffer for applause/roller effects
  if (muted || !ctx) return;
  const t = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + dur + 0.05);
}

export const sfx = {
  /** cetek pendek, feedback klik */
  click() {
    tone(440, 0.05, "triangle", 0.08);
  },
  /** "ding" berhasil */
  ding() {
    tone(1320, 0.18, "sine", 0.25);
  },
  /** alarm waktu habis: 3x beep */
  alarm() {
    tone(880, 0.28, "square", 0.22, 0);
    tone(880, 0.28, "square", 0.22, 0.38);
    tone(880, 0.4, "square", 0.22, 0.76);
  },
  /** gong: rendah panjang */
  gong() {
    tone(196, 0.9, "sine", 0.3);
    tone(98, 1.2, "sine", 0.2, 0.01);
  },
  /** drum roll singkat untuk momen dramatis */
  drumroll() {
    for (let i = 0; i < 12; i++) {
      tone(150 + Math.random() * 80, 0.08, "square", 0.1, i * 0.07);
    }
  },
  /** tepuk tangan (noise burst) */
  applause() {
    noise(1.4, 0.18);
  },
};