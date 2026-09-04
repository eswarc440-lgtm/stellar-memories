let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let padStarted = false;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);
  }
  void ctx.resume();
  return ctx;
}

/** Soft cinematic pad — starts only after a user gesture. */
export function startAmbience() {
  const c = ensure();
  if (!c || !master || padStarted) return;
  padStarted = true;
  const notes = [110, 164.81, 220, 329.63];
  notes.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    osc.type = i % 2 ? "sine" : "triangle";
    osc.frequency.value = f;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.06 / (i + 1), c.currentTime + 6);
    lfo.frequency.value = 0.05 + i * 0.03;
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(g.gain);
    osc.connect(g).connect(master!);
    osc.start();
    lfo.start();
  });
}

type Cue = "chime" | "whoosh" | "type" | "sparkle";

export function playCue(cue: Cue) {
  const c = ensure();
  if (!c || !master) return;
  const now = c.currentTime;
  if (cue === "whoosh") {
    const buffer = c.createBuffer(1, c.sampleRate * 1.4, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    }
    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 1.1);
    const g = c.createGain();
    g.gain.value = 0.5;
    src.buffer = buffer;
    src.connect(filter).connect(g).connect(master);
    src.start();
    return;
  }
  const freq = cue === "chime" ? 880 : cue === "sparkle" ? 1760 : 420;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = cue === "type" ? "square" : "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(cue === "type" ? 0.03 : 0.12, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + (cue === "type" ? 0.06 : 1.1));
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + 1.2);
}

export function setMuted(muted: boolean) {
  const c = ensure();
  if (!c || !master) return;
  master.gain.linearRampToValueAtTime(muted ? 0 : 0.25, c.currentTime + 0.3);
}
