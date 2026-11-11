import test from 'node:test';
import assert from 'node:assert/strict';
import { move, spawn, canMove, fromValues, toValues, emptyGrid } from '../public/logic.js';

const grid = (rows) => fromValues(rows);
const after = (rows, dir) => { const m = move(grid(rows), dir); return { ...m, values: toValues(m.grid) }; };
const Z = [0, 0, 0, 0];

test('glisse et fusionne vers la gauche', () => {
  const m = after([[2, 0, 2, 4], Z, Z, Z], 'left');
  assert.deepEqual(m.values[0], [4, 4, 0, 0]);
  assert.equal(m.gained, 4);
  assert.equal(m.ghosts.length, 1);
});

test('une tuile ne fusionne qu\'une fois par coup', () => {
  assert.deepEqual(after([[2, 2, 2, 2], Z, Z, Z], 'left').values[0], [4, 4, 0, 0]);
  assert.deepEqual(after([[4, 2, 2, 0], Z, Z, Z], 'left').values[0], [4, 4, 0, 0]);
  assert.deepEqual(after([[2, 2, 2, 0], Z, Z, Z], 'right').values[0], [0, 0, 2, 4]);
});

test('haut et bas', () => {
  const rows = [[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [4, 0, 0, 0]];
  assert.deepEqual(after(rows, 'up').values.map((r) => r[0]), [4, 8, 0, 0]);
  assert.deepEqual(after(rows, 'down').values.map((r) => r[0]), [0, 0, 4, 8]);
});

test('coup sans effet : moved = false', () => {
  assert.equal(after([[2, 4, 8, 16], Z, Z, Z], 'left').moved, false);
  assert.equal(after([[2, 4, 8, 16], Z, Z, Z], 'down').moved, true);
});

test('canMove', () => {
  assert.equal(canMove(grid([[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]])), false);
  assert.equal(canMove(grid([[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 4]])), true);
  assert.equal(canMove(emptyGrid()), true);
});

test('spawn pose un 2 ou un 4 sur une case vide', () => {
  const g = grid([[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 0]]);
  assert.equal(spawn(g, () => 0).v, 2);
  assert.equal(g[3][3].v, 2);
  assert.equal(spawn(g), null);
  assert.equal(spawn(emptyGrid(), () => 0.95).v, 4);
});

test('fromValues refuse une sauvegarde invalide', () => {
  assert.equal(fromValues([[3, 0, 0, 0], Z, Z, Z]), null);
  assert.equal(fromValues([Z, Z, Z]), null);
  assert.equal(fromValues('x'), null);
});
