// Sound: pitch rises with value; never a buzzer. Sound is never required.
export let muted = false;
try { muted = localStorage.getItem('mute') === '1'; } catch { /* storage may be blocked */ }

export let ac;
export function tone(freq, dur = 0.1, type = 'triangle', slide = 0, delay = 0) {
  if (muted) return;
  try {
    ac ??= new AudioContext();
    const t = ac.currentTime + delay, o = ac.createOscillator(), v = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); o.frequency.linearRampToValueAtTime(freq + slide, t + dur);
    v.gain.setValueAtTime(0.15, t); v.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(v).connect(ac.destination); o.start(t); o.stop(t + dur);
  } catch { /* sound is never required */ }
}
export const pitch = n => 220 * 2 ** (n / 12);
export const boing = () => tone(180, 0.25, 'sine', 260);

export const muteBtn = document.getElementById('mute');
export function setMute(m) {
  muted = m; muteBtn.setAttribute('aria-pressed', m); muteBtn.classList.toggle('off', m);
  try { localStorage.setItem('mute', m ? '1' : '0'); } catch { /* fine */ }
}
