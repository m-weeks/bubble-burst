import { ENEMY_SPAWN, WALL } from "./map";

export type Enemy = {
  x: number,
  z: number,
  angle: number,
  health: number,
  moving: boolean,
  path?: { x: number, z: number }[],
}

const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getStartingPosition = (map: number[][]) => {
  const spawnPoints: [number, number][] = [];
  map.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === ENEMY_SPAWN) {
        spawnPoints.push([colIndex, rowIndex]);
      }
    });
  });
  const randomIndex = rand(0, spawnPoints.length - 1);
  const [z, x] = spawnPoints[randomIndex];

  return [x, z]
};

export const initializeEnemy = (map: number[][]): Enemy => {
  const [x, z] = getStartingPosition(map);

  return {
    x: x,
    z: z,
    angle: Math.PI,
    health: 100,
    moving: false,
  };
}

type Position = { x: number, z: number };

const directions = [
  { x: 0, z: -1 },  // up
  { x: 0, z: 1 },   // down
  { x: -1, z: 0 },  // left
  { x: 1, z: 0 },   // right
  { x: -1, z: -1 }, // up-left
  { x: 1, z: -1 },  // up-right
  { x: -1, z: 1 },  // down-left
  { x: 1, z: 1 },   // down-right
];

function heuristic(pos: Position, target: Position): number {
  return Math.sqrt(Math.pow(pos.x - target.x, 2) + Math.pow(pos.z - target.z, 2)); // Euclidean distance
}

function reconstructPath(cameFrom: Map<string, Position>, current: Position): Position[] {
  const path: Position[] = [current];
  const visited = new Set<string>(); // Prevent infinite loops

  while (cameFrom.has(`${current.x},${current.z}`)) {
    const key = `${current.x},${current.z}`;
    if (visited.has(key)) {
      console.error("Infinite loop detected in reconstructPath. Current key:", key);
      break; // Prevent infinite loop
    }
    visited.add(key);

    current = cameFrom.get(key)!;
    path.unshift(current);
  }

  return path;
}

function isValidNeighbor(map: number[][], current: Position, neighbor: Position): boolean {
  const { x, z } = neighbor;

  if (z < 0 || z >= map.length || x < 0 || x >= map[0].length || map[z][x] === WALL) {
    return false;
  }

  // Prevent moving diagonally through walls
  if (Math.abs(current.x - x) === 1 && Math.abs(current.z - z) === 1) {
    const horizontal = { x, z: current.z }; // Check horizontal adjacent tile
    const vertical = { x: current.x, z };   // Check vertical adjacent tile
    if (map[horizontal.z][horizontal.x] === WALL || map[vertical.z][vertical.x] === WALL) {
      return false; // Block diagonal movement through walls
    }
  }

  return true;
}

export function findPath(start: Position, target: Position, map: number[][]): Position[] {
  const openSet: Position[] = [start];
  const cameFrom: Map<string, Position> = new Map();
  const gScore: Map<string, number> = new Map();
  const fScore: Map<string, number> = new Map();

  const key = (pos: Position) => `${pos.x},${pos.z}`;

  gScore.set(key(start), 0);
  fScore.set(key(start), heuristic(start, target));

  while (openSet.length > 0) {
    openSet.sort((a, b) => (fScore.get(key(a)) || Infinity) - (fScore.get(key(b)) || Infinity));
    const current = openSet.shift()!;
    if (current.x === target.x && current.z === target.z) {
      return reconstructPath(cameFrom, current);
    }

    for (const dir of directions) {
      const neighbor = { x: current.x + dir.x, z: current.z + dir.z };

      if (!isValidNeighbor(map, current, neighbor)) continue;

      const tentativeGScore = (gScore.get(key(current)) ?? Infinity) + (dir.x !== 0 && dir.z !== 0 ? 1.414 : 1);

      if (tentativeGScore < (gScore.get(key(neighbor)) ?? Infinity)) {
        cameFrom.set(key(neighbor), current);
        gScore.set(key(neighbor), tentativeGScore);
        fScore.set(key(neighbor), tentativeGScore + heuristic(neighbor, target));
        if (!openSet.some(pos => pos.x === neighbor.x && pos.z === neighbor.z)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return []; // No path found
}