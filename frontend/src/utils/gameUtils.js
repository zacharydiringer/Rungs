import { GOAL, ADJACENT_PAIRS } from "../constants";

/**
 * Returns true if the board matches the goal state.
 */
export const isSolved = (board) => board.every((v, i) => v === GOAL[i]);

/**
 * Returns true if cell indices a and b are adjacent (swappable).
 */
export const areAdjacent = (a, b) =>
  ADJACENT_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/**
 * Returns a new board with cells at indices i and j swapped.
 */
export const swapCells = (board, i, j) => {
  const next = [...board];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/**
 * Returns efficiency percentage: how close to par the player was.
 * 100% means solved in exactly par swaps. Capped at 100%.
 */
export const calcEfficiency = (swaps, par) =>
  swaps > 0 ? Math.min(100, Math.round((par / swaps) * 100)) : 100;