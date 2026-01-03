/**
 * Maze renderer with thick walls and rounded edges
 */

import type { Maze } from "./maze.js";

export interface RenderOptions {
  cellSize: number;
  wallThickness: number;
  wallColor: string;
  backgroundColor: string;
  startStarColor: string;
  endStarColor: string;
}

const DEFAULT_OPTIONS: RenderOptions = {
  cellSize: 20,
  wallThickness: 4,
  wallColor: "#2c3e50",
  backgroundColor: "#ffffff",
  startStarColor: "#e74c3c",
  endStarColor: "#27ae60",
};

/**
 * Draw a 5-pointed star
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  color: string
): void {
  const spikes = 5;
  let rotation = -Math.PI / 2;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(rotation) * radius;
    const y = cy + Math.sin(rotation) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    rotation += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Calculate the total dimensions needed to render a maze
 */
export function getMazeDimensions(
  maze: Maze,
  options: Partial<RenderOptions> = {}
): { width: number; height: number } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { cellSize, wallThickness } = opts;

  const width = maze.cols * cellSize + wallThickness;
  const height = maze.rows * cellSize + wallThickness;

  return { width, height };
}

/**
 * Render maze to a canvas context
 */
export function renderMaze(
  ctx: CanvasRenderingContext2D,
  maze: Maze,
  offsetX: number = 0,
  offsetY: number = 0,
  options: Partial<RenderOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { cellSize, wallThickness, wallColor, backgroundColor, startStarColor, endStarColor } = opts;

  const halfWall = wallThickness / 2;

  // Fill background
  const { width, height } = getMazeDimensions(maze, opts);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(offsetX, offsetY, width, height);

  // Set up line style for walls
  ctx.strokeStyle = wallColor;
  ctx.lineWidth = wallThickness;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Draw walls
  for (let r = 0; r < maze.rows; r++) {
    for (let c = 0; c < maze.cols; c++) {
      const cell = maze.cells[r]?.[c];
      if (!cell) continue;

      const x = offsetX + c * cellSize + halfWall;
      const y = offsetY + r * cellSize + halfWall;

      // Draw top wall
      if (cell.walls.top) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }

      // Draw left wall
      if (cell.walls.left) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }

      // Draw right wall (only for rightmost cells)
      if (c === maze.cols - 1 && cell.walls.right) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }

      // Draw bottom wall (only for bottom cells)
      if (r === maze.rows - 1 && cell.walls.bottom) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
    }
  }

  // Draw start star
  const starRadius = cellSize * 0.35;
  const startCellX = offsetX + maze.start.col * cellSize + halfWall + cellSize / 2;
  const startCellY = offsetY + maze.start.row * cellSize + halfWall + cellSize / 2;
  drawStar(ctx, startCellX, startCellY, starRadius, starRadius * 0.4, startStarColor);

  // Draw end star
  const endCellX = offsetX + maze.end.col * cellSize + halfWall + cellSize / 2;
  const endCellY = offsetY + maze.end.row * cellSize + halfWall + cellSize / 2;
  drawStar(ctx, endCellX, endCellY, starRadius, starRadius * 0.4, endStarColor);
}
