/**
 * Main entry point for the maze generator app
 */

import { generateMaze, type Maze } from "./maze.js";
import { renderMaze, getMazeDimensions } from "./renderer.js";
import { exportToPdf } from "./pdf.js";

interface Settings {
  rows: number;
  cols: number;
  mazesPerPage: number;
}

const DEFAULT_SETTINGS: Settings = {
  rows: 30,
  cols: 20,
  mazesPerPage: 2,
};

let currentSettings: Settings = { ...DEFAULT_SETTINGS };
let currentMazes: Maze[] = [];

function getSettings(): Settings {
  const rowsInput = document.getElementById("rows") as HTMLInputElement | null;
  const colsInput = document.getElementById("cols") as HTMLInputElement | null;
  const mazesInput = document.getElementById("mazesPerPage") as HTMLInputElement | null;

  return {
    rows: rowsInput ? parseInt(rowsInput.value, 10) || DEFAULT_SETTINGS.rows : DEFAULT_SETTINGS.rows,
    cols: colsInput ? parseInt(colsInput.value, 10) || DEFAULT_SETTINGS.cols : DEFAULT_SETTINGS.cols,
    mazesPerPage: mazesInput ? parseInt(mazesInput.value, 10) || DEFAULT_SETTINGS.mazesPerPage : DEFAULT_SETTINGS.mazesPerPage,
  };
}

function renderMazesToContainer(): void {
  const container = document.getElementById("mazeContainer");
  if (!container) return;

  container.innerHTML = "";

  const cellSize = 16;
  const wallThickness = 3;

  for (const maze of currentMazes) {
    const { width, height } = getMazeDimensions(maze, { cellSize, wallThickness });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.className = "maze-canvas";

    const ctx = canvas.getContext("2d");
    if (ctx) {
      renderMaze(ctx, maze, 0, 0, { cellSize, wallThickness });
    }

    container.appendChild(canvas);
  }
}

function generateNewMazes(): void {
  currentSettings = getSettings();
  currentMazes = [];

  for (let i = 0; i < currentSettings.mazesPerPage; i++) {
    currentMazes.push(generateMaze(currentSettings.rows, currentSettings.cols));
  }

  renderMazesToContainer();
}

function handlePrint(): void {
  if (currentMazes.length === 0) {
    generateNewMazes();
  }
  exportToPdf(currentMazes, "mazes.pdf");
}

function init(): void {
  // Set up input defaults
  const rowsInput = document.getElementById("rows") as HTMLInputElement | null;
  const colsInput = document.getElementById("cols") as HTMLInputElement | null;
  const mazesInput = document.getElementById("mazesPerPage") as HTMLInputElement | null;

  if (rowsInput) rowsInput.value = String(DEFAULT_SETTINGS.rows);
  if (colsInput) colsInput.value = String(DEFAULT_SETTINGS.cols);
  if (mazesInput) mazesInput.value = String(DEFAULT_SETTINGS.mazesPerPage);

  // Set up event listeners
  const generateBtn = document.getElementById("generateBtn");
  const printBtn = document.getElementById("printBtn");

  if (generateBtn) {
    generateBtn.addEventListener("click", generateNewMazes);
  }

  if (printBtn) {
    printBtn.addEventListener("click", handlePrint);
  }

  // Generate initial mazes
  generateNewMazes();
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
