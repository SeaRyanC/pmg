/**
 * Maze generation using depth-first backtracking algorithm
 */

export interface Cell {
  row: number;
  col: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

export interface Maze {
  rows: number;
  cols: number;
  cells: Cell[][];
  start: { row: number; col: number };
  end: { row: number; col: number };
}

function createGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

function getUnvisitedNeighbors(grid: Cell[][], cell: Cell): Cell[] {
  const neighbors: Cell[] = [];
  const { row, col } = cell;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  if (row > 0) {
    const top = grid[row - 1]?.[col];
    if (top && !top.visited) neighbors.push(top);
  }
  if (row < rows - 1) {
    const bottom = grid[row + 1]?.[col];
    if (bottom && !bottom.visited) neighbors.push(bottom);
  }
  if (col > 0) {
    const left = grid[row]?.[col - 1];
    if (left && !left.visited) neighbors.push(left);
  }
  if (col < cols - 1) {
    const right = grid[row]?.[col + 1];
    if (right && !right.visited) neighbors.push(right);
  }

  return neighbors;
}

function removeWallBetween(current: Cell, next: Cell): void {
  const dx = next.col - current.col;
  const dy = next.row - current.row;

  if (dx === 1) {
    current.walls.right = false;
    next.walls.left = false;
  } else if (dx === -1) {
    current.walls.left = false;
    next.walls.right = false;
  } else if (dy === 1) {
    current.walls.bottom = false;
    next.walls.top = false;
  } else if (dy === -1) {
    current.walls.top = false;
    next.walls.bottom = false;
  }
}

/**
 * Generate a maze using depth-first backtracking algorithm.
 * This algorithm guarantees a maze with exactly one solution path.
 */
export function generateMaze(rows: number, cols: number): Maze {
  const grid = createGrid(rows, cols);
  const stack: Cell[] = [];

  // Start from top-left corner
  const startCell = grid[0]?.[0];
  if (!startCell) {
    throw new Error("Invalid grid size");
  }
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (!current) break;

    const neighbors = getUnvisitedNeighbors(grid, current);

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      // Pick a random unvisited neighbor
      const randomIndex = Math.floor(Math.random() * neighbors.length);
      const next = neighbors[randomIndex];
      if (!next) continue;

      removeWallBetween(current, next);
      next.visited = true;
      stack.push(next);
    }
  }

  // Start at top-left, end at bottom-right
  return {
    rows,
    cols,
    cells: grid,
    start: { row: 0, col: 0 },
    end: { row: rows - 1, col: cols - 1 },
  };
}
