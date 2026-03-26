const SOUNDS = {
  crack: { freq: [800, 200], duration: 0.15, type: "square" },
  victory: { freqs: [523, 659, 784], duration: 0.2, type: "sine" },
  defeat: { freqs: [400, 300, 200], duration: 0.25, type: "triangle" },
  click: { freq: [600, 400], duration: 0.05, type: "sine" },
};

let audioCtx = null;

function getCtx() {
  if (!audioCtx && typeof AudioContext !== "undefined") {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (mobile requires user gesture)
  if (audioCtx?.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, duration, type = "sine", startTime = 0) {
  const ctx = getCtx();
  if (!ctx || ctx.state === "suspended") return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Array.isArray(freq) ? freq[0] : freq, ctx.currentTime + startTime);
  if (Array.isArray(freq) && freq.length > 1) {
    osc.frequency.linearRampToValueAtTime(freq[1], ctx.currentTime + startTime + duration);
  }
  gain.gain.setValueAtTime(0.15, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration + 0.01);
}

export function playCrack() {
  if (!isSoundEnabled()) return;
  const s = SOUNDS.crack;
  playTone(s.freq, s.duration, s.type);
}

export function playVictory() {
  if (!isSoundEnabled()) return;
  const s = SOUNDS.victory;
  s.freqs.forEach((f, i) => playTone(f, s.duration, s.type, i * 0.15));
}

export function playDefeat() {
  if (!isSoundEnabled()) return;
  const s = SOUNDS.defeat;
  s.freqs.forEach((f, i) => playTone(f, s.duration, s.type, i * 0.2));
}

export function playClick() {
  if (!isSoundEnabled()) return;
  const s = SOUNDS.click;
  playTone(s.freq, s.duration, s.type);
}

export function isSoundEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("c_sound") !== "off";
  } catch {
    return true;
  }
}

export function toggleSound() {
  if (typeof window === "undefined") return true;
  try {
    const current = isSoundEnabled();
    localStorage.setItem("c_sound", current ? "off" : "on");
    if (!current) {
      // Resume audio context if suspended
      const ctx = getCtx();
      if (ctx?.state === "suspended") ctx.resume();
    }
    return !current;
  } catch {
    return true;
  }
}
