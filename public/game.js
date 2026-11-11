// 2048 NEON : affichage, entrées et sauvegarde. Les règles sont dans logic.js.
import { move, spawn, canMove, maxTile, emptyGrid, toValues, fromValues } from './logic.js';

const SAVE_KEY = 'odg.2048.save';
const BEST_KEY = 'odg.2048.best';
const SLIDE_MS = 110;   // = --slide dans style.css
const WIN = 2048;

const $ = (id) => document.getElementById(id);
const storage = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* navigation privée */ } },
};

const tilesEl = $('tiles'), overlay = $('overlay');
const els = new Map();   // id de tuile → élément

let grid, score, won, over;
let best = Number(storage.get(BEST_KEY)) || 0;

// ---------- Affichage ----------
function place(el, r, c) {
  el.style.setProperty('--r', r);
  el.style.setProperty('--c', c);
}

function render() {
  const alive = new Set();
  grid.forEach((row, r) => row.forEach((t, c) => {
    if (!t) return;
    alive.add(t.id);
    let el = els.get(t.id);
    if (!el) {
      el = document.createElement('div');
      el.append(Object.assign(document.createElement('div'), { className: 'tile-in' }));
      els.set(t.id, el);
      tilesEl.append(el);
      t.fresh = true;
    }
    const cls = `tile t-${t.v > WIN ? 'super' : t.v} len-${String(t.v).length}`;
    el.className = cls + (t.fresh ? ' is-new' : t.merged ? ' is-merged' : '');
    el.firstChild.textContent = t.v;
    place(el, r, c);
    t.fresh = t.merged = false;
  }));
  for (const [id, el] of els) if (!alive.has(id) && !el.dataset.ghost) { el.remove(); els.delete(id); }

  $('score').textContent = score;
  $('best').textContent = best;
}

function showOverlay(title, sub, canContinue) {
  $('overlayTitle').textContent = title;
  $('overlaySub').textContent = sub;
  $('keepGoing').hidden = !canContinue;
  overlay.hidden = false;
  $('live').textContent = `${title} ${sub}`;
  (canContinue ? $('keepGoing') : $('retry')).focus();
}

// ---------- Partie ----------
function save() {
  storage.set(SAVE_KEY, JSON.stringify({ grid: toValues(grid), score, won }));
  storage.set(BEST_KEY, String(best));
}

function newGame() {
  grid = emptyGrid();
  score = 0;
  won = over = false;
  spawn(grid);
  spawn(grid);
  overlay.hidden = true;
  save();
  render();
}

function restore() {
  try {
    const s = JSON.parse(storage.get(SAVE_KEY));
    const g = fromValues(s?.grid);
    if (!g || !Number.isSafeInteger(s.score) || s.score < 0 || !canMove(g)) return false;
    grid = g;
    score = s.score;
    won = Boolean(s.won);
    over = false;
    return true;
  } catch { return false; }
}

function play(dir) {
  if (over || !overlay.hidden) return;
  const m = move(grid, dir);
  if (!m.moved) return;

  // Les tuiles absorbées glissent jusqu'à leur case d'arrivée, puis disparaissent.
  for (const g of m.ghosts) {
    const el = els.get(g.id);
    el.dataset.ghost = '1';
    place(el, g.r, g.c);
    els.delete(g.id);
    setTimeout(() => el.remove(), SLIDE_MS);
  }

  grid = m.grid;
  score += m.gained;
  best = Math.max(best, score);
  spawn(grid);
  save();
  render();

  if (!won && maxTile(grid) >= WIN) {
    won = true;
    save();
    showOverlay('2048 !', `SCORE ${score}`, true);
  } else if (!canMove(grid)) {
    over = true;
    showOverlay('GAME OVER', `SCORE ${score}`, false);
  }
}

// ---------- Entrées ----------
const KEYS = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  q: 'left', a: 'left', d: 'right', z: 'up', w: 'up', s: 'down',
};
addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (!dir) return;
  e.preventDefault();   // pas de défilement de la page aux flèches
  play(dir);
});

// Glissement (tactile, souris, stylet) : au moins 24 px, direction dominante.
const board = $('board');
let start = null;
board.addEventListener('pointerdown', (e) => { if (!e.target.closest('.overlay')) start = { x: e.clientX, y: e.clientY }; });
addEventListener('pointerup', (e) => {
  if (!start) return;
  const dx = e.clientX - start.x, dy = e.clientY - start.y;
  start = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
});
addEventListener('pointercancel', () => { start = null; });

$('newGame').addEventListener('click', newGame);
$('retry').addEventListener('click', newGame);
$('keepGoing').addEventListener('click', () => { overlay.hidden = true; });

if (restore()) render(); else newGame();
