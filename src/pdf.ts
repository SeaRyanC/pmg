/**
 * PDF export functionality for mazes
 */

import { jsPDF } from "jspdf";
import type { Maze } from "./maze.js";
import { getMazeDimensions, renderMaze, type RenderOptions } from "./renderer.js";

// US Letter size in points (1 inch = 72 points)
const PAGE_WIDTH_PT = 8.5 * 72;
const PAGE_HEIGHT_PT = 11 * 72;
const MARGIN_PT = 36; // 0.5 inch margin

const USABLE_WIDTH = PAGE_WIDTH_PT - 2 * MARGIN_PT;
const USABLE_HEIGHT = PAGE_HEIGHT_PT - 2 * MARGIN_PT;

interface MazeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

/**
 * Calculate optimal layout for mazes on a page
 */
function calculateLayout(mazes: Maze[], cellSize: number, wallThickness: number): MazeLayout[] {
  const count = mazes.length;
  if (count === 0) return [];

  // Get dimensions for each maze
  const mazeDimensions = mazes.map((maze) =>
    getMazeDimensions(maze, { cellSize, wallThickness })
  );

  // Calculate aspect ratios
  const mazeAspects = mazeDimensions.map((d) => d.width / d.height);
  const avgAspect = mazeAspects.reduce((a, b) => a + b, 0) / count;

  // Determine best grid arrangement
  let bestCols = 1;
  let bestRows = count;
  let bestScale = 0;

  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);

    // Calculate scale for this arrangement
    const cellWidth = USABLE_WIDTH / cols;
    const cellHeight = USABLE_HEIGHT / rows;

    // Find the minimum scale across all mazes for this arrangement
    let minScale = Infinity;
    for (const dim of mazeDimensions) {
      const scaleX = cellWidth / dim.width;
      const scaleY = cellHeight / dim.height;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding
      minScale = Math.min(minScale, scale);
    }

    if (minScale > bestScale) {
      bestScale = minScale;
      bestCols = cols;
      bestRows = rows;
    }
  }

  // Generate layout positions
  const layouts: MazeLayout[] = [];
  const cellWidth = USABLE_WIDTH / bestCols;
  const cellHeight = USABLE_HEIGHT / bestRows;

  for (let i = 0; i < count; i++) {
    const dim = mazeDimensions[i];
    if (!dim) continue;

    const col = i % bestCols;
    const row = Math.floor(i / bestCols);

    const scaledWidth = dim.width * bestScale;
    const scaledHeight = dim.height * bestScale;

    // Center within cell
    const x = MARGIN_PT + col * cellWidth + (cellWidth - scaledWidth) / 2;
    const y = MARGIN_PT + row * cellHeight + (cellHeight - scaledHeight) / 2;

    layouts.push({
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
      scale: bestScale,
    });
  }

  return layouts;
}

/**
 * Export mazes to a PDF file
 */
export function exportToPdf(mazes: Maze[], filename: string = "mazes.pdf"): void {
  if (mazes.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  // Render settings - use larger cell size for better quality when scaled
  const baseCellSize = 20;
  const wallThickness = 4;

  // Calculate layout
  const layouts = calculateLayout(mazes, baseCellSize, wallThickness);

  // Create an off-screen canvas for rendering
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  // Calculate maximum canvas dimensions needed across all mazes
  const renderScale = 2;
  let maxWidth = 0;
  let maxHeight = 0;
  for (const maze of mazes) {
    const dim = getMazeDimensions(maze, { cellSize: baseCellSize, wallThickness });
    maxWidth = Math.max(maxWidth, dim.width * renderScale);
    maxHeight = Math.max(maxHeight, dim.height * renderScale);
  }
  canvas.width = maxWidth;
  canvas.height = maxHeight;

  // Render each maze and add to PDF
  for (let i = 0; i < mazes.length; i++) {
    const maze = mazes[i];
    const layout = layouts[i];
    if (!maze || !layout) continue;

    const baseDim = getMazeDimensions(maze, { cellSize: baseCellSize, wallThickness });

    // Clear and scale context
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(renderScale, renderScale);

    // Render maze
    renderMaze(ctx, maze, 0, 0, {
      cellSize: baseCellSize,
      wallThickness,
    });

    ctx.restore();

    // Add to PDF
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", layout.x, layout.y, layout.width, layout.height);
  }

  doc.save(filename);
}
