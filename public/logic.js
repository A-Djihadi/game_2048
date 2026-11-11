// 2048 NEON : règles du jeu, sans DOM (testées dans tests/logic.test.js).
// Une grille est un tableau 4×4 de tuiles { id, v } ou null.

export const SIZE = 4;

let nextId = 1;
export const tile = (v) => ({ id: nextId++, v });
export const emptyGrid = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

// Case (ligne, colonne) de la j-ième tuile de la i-ième rangée, lue dans le sens du déplacement.
const CELL = {
  left: (i, j) => [i, j],
  right: (i, j) => [i, SIZE - 1 - j],
  up: (i, j) => [j, i],
  down: (i, j) => [SIZE - 1 - j, i],
};

// Déplace la grille. `ghosts` : tuiles absorbées par une fusion, avec leur case d'arrivée (pour l'animation).
export function move(grid, dir) {
  const cell = CELL[dir];
  const out = emptyGrid();
  const ghosts = [];
  let gained = 0;
  let moved = false;

  for (let i = 0; i < SIZE; i++) {
    let k = 0;          // prochaine case libre de la rangée
    let last = null;    // dernière tuile posée, encore fusionnable
    for (let j = 0; j < SIZE; j++) {
      const [r, c] = cell(i, j);
      const t = grid[r][c];
      if (!t) continue;
      if (last && last.v === t.v) {
        last.v *= 2;
        last.merged = true;
        gained += last.v;
        const [gr, gc] = cell(i, k - 1);
        ghosts.push({ id: t.id, r: gr, c: gc });
        last = null;    // une tuile ne fusionne qu'une fois par coup
        moved = true;
      } else {
        last = { id: t.id, v: t.v };
        const [nr, nc] = cell(i, k);
        out[nr][nc] = last;
        if (k !== j) moved = true;
        k++;
      }
    }
  }
  return { grid: out, gained, moved, ghosts };
}

// Pose une tuile (2 à 90 %, 4 à 10 %) sur une case vide. Renvoie la tuile, ou null si la grille est pleine.
export function spawn(grid, rnd = Math.random) {
  const free = [];
  grid.forEach((row, r) => row.forEach((t, c) => { if (!t) free.push([r, c]); }));
  if (!free.length) return null;
  const [r, c] = free[Math.floor(rnd() * free.length)];
  return (grid[r][c] = tile(rnd() < 0.9 ? 2 : 4));
}

export function canMove(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const t = grid[r][c];
      if (!t) return true;
      if (c + 1 < SIZE && grid[r][c + 1]?.v === t.v) return true;
      if (r + 1 < SIZE && grid[r + 1][c]?.v === t.v) return true;
    }
  }
  return false;
}

export const maxTile = (grid) => Math.max(0, ...grid.flat().map((t) => t?.v ?? 0));

export const toValues = (grid) => grid.map((row) => row.map((t) => t?.v ?? 0));

// Reconstruit une grille depuis une sauvegarde ; null si elle n'a pas la bonne forme (localStorage modifié).
export function fromValues(values) {
  const ok = Array.isArray(values) && values.length === SIZE && values.every((row) =>
    Array.isArray(row) && row.length === SIZE && row.every((v) => v === 0 || (Number.isInteger(v) && v >= 2 && (v & (v - 1)) === 0)));
  return ok ? values.map((row) => row.map((v) => (v ? tile(v) : null))) : null;
}
