// Title screen (bare URL only): the tutorial is optional. Two big choices; finished Camp before → the Road is the default.
// Behind the title, number blocks drift up past a campfire; reduced motion paints one still frame.
import { cv, g, reduced, CELL, TITLE } from './look.js';
import { block } from './draw.js';
import { getDone } from './state.js';


const camped = getDone().includes('camp');
document.title = TITLE;
document.body.classList.add('title');
const ui = document.createElement('main');
ui.id = 'title';
ui.innerHTML = `<h1></h1><div>
  <button data-go="?world=camp"><svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="52" width="40" height="7" rx="3" fill="#7a5c43"/><path d="M16 54Q12 30 32 6Q52 30 48 54Z" fill="#ef476f"/><path d="M22 54Q20 36 32 20Q44 36 42 54Z" fill="#ff9f1c"/><path d="M27 54Q26 42 32 32Q38 42 37 54Z" fill="#ffd166"/></svg>Start at Camp<small>learn with the Tally-Keeper</small></button>
  <button data-go="?map"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M2 40Q18 28 32 34T62 30V60H2Z" fill="#9be08a"/><path d="M14 62L28 34H36L50 62Z" fill="#c9a36b"/><path d="M32 38V42M32 47V53M32 57V62" stroke="#f4efe4" stroke-width="3"/><path d="M44 26V12L56 17L44 22" fill="#ef476f" stroke="#1d1f2e" stroke-width="2"/><circle cx="16" cy="14" r="7" fill="#ffd166"/></svg>Go to the Road<small>explore the lands</small></button></div>`;
ui.querySelector('h1').textContent = TITLE;
document.body.append(ui);
const btns = [...ui.querySelectorAll('button')], pick = btns[camped ? 1 : 0];
pick.classList.add('pick'); pick.querySelector('small').textContent += ' ★';
btns.forEach(b => (b.onclick = () => location.assign(b.dataset.go))); // Enter/Space on a focused button clicks it natively
pick.focus();
addEventListener('keydown', e => {
  const i = btns.indexOf(document.activeElement);
  if (e.key.startsWith('Arrow')) { btns[(i + 1) % 2].focus(); e.preventDefault(); } // two choices: any arrow flips
  else if ((e.key === 'Enter' || e.key === ' ') && i < 0) { pick.click(); e.preventDefault(); }
});

// ---- backdrop: drifting blocks 1-10 (each shows its own dots) and a flickering fire ----
const drift = Array.from({ length: 14 }, (_, i) => ({ n: 1 + (i % 10), x: (i * 0.37) % 1, y: (i * 0.61) % 1, v: 0.012 + (i % 4) * 0.004, s: 0.7 + (i % 3) * 0.25 }));
function frame(now) {
  const W = (cv.width = innerWidth), H = (cv.height = innerHeight), t = now / 1000;
  g.fillStyle = '#2b2d42'; g.fillRect(0, 0, W, H);
  for (const b of drift) {
    const y = ((b.y - t * b.v) % 1 + 1) % 1 * (H + 140) - 70, x = b.x * W + Math.sin(t * 0.5 + b.n) * 18;
    block(x - CELL / 2, y - CELL / 2, b.n, b.s, 0.28);
  }
  const fx = W / 2, fy = H - 40; // fire: three tongues flicker on their own rhythms
  g.fillStyle = '#7a5c43'; g.fillRect(fx - 46, fy, 92, 12); g.fillRect(fx - 30, fy - 6, 60, 10);
  [['#ef476f', 46, 1], ['#ff9f1c', 34, 1.7], ['#ffd166', 20, 2.9]].forEach(([c, w, k]) => {
    const h = w * 2.2 * (1 + 0.12 * Math.sin(t * 7 * k) + 0.06 * Math.sin(t * 13 * k));
    g.beginPath(); g.moveTo(fx - w, fy); g.quadraticCurveTo(fx - w * 0.8, fy - h * 0.6, fx + Math.sin(t * 3 * k) * 6, fy - h);
    g.quadraticCurveTo(fx + w * 0.8, fy - h * 0.6, fx + w, fy); g.fillStyle = c; g.fill();
  });
  if (!reduced) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
addEventListener('resize', () => reduced && requestAnimationFrame(frame));
