import { broadcastMsg } from ".";
import { Lobby } from "./lobby";
import { ENEMY_SPAWN, WALL } from "./map";
import { Player } from "./player";

export type Enemy = {
  x: number,
  z: number,
  angle: number,
  health: number,
  moving: boolean,
  path?: { x: number, z: number }[],
  disableMovement?: boolean,
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
export function onHit (player: Player, lobby: Lobby) {
  Object.entries(lobby.gameState.enemies).forEach(([enemyId, enemy]) => {
    const distance = Math.sqrt(
      Math.pow(enemy.x - player.x, 2) +
      Math.pow(enemy.z - player.z, 2)
    );
  
    const angleToEnemy = Math.atan2(enemy.z - player.z, enemy.x - player.x);
    const angleDifference = Math.abs(player.angle - angleToEnemy);
  
    // Normalize the angle difference to the range [0, Math.PI]
    const normalizedAngleDifference = Math.min(angleDifference, Math.abs(Math.PI * 2 - angleDifference));
  
    const isWithinCube = distance <= 1.5 && normalizedAngleDifference - Math.PI / 2 <= Math.PI / 4;
  
    if (isWithinCube) {
      enemy.health = Math.max(enemy.health - 34, 0);
  
      lobby.gameState.enemies[enemyId].disableMovement = true;
      const knockbackStrength = 1;
      const knockbackX = knockbackStrength * Math.cos(angleToEnemy);
      const knockbackZ = knockbackStrength * Math.sin(angleToEnemy);

      const targetX = enemy.x + knockbackX;
      const targetZ = enemy.z + knockbackZ;

      const duration = 300; // Knockback duration in ms
      const interval = 16; // Interval between updates (approx. 60fps)
      const steps = duration / interval;
      let currentStep = 0;

      const originalX = enemy.x;
      const originalZ = enemy.z;

      const animateKnockback = setInterval(() => {
        currentStep += 1;
        const t = currentStep / steps; // Normalized time [0, 1]

        // Ease out function
        const easeOutQuad = (t) => t * (2 - t);
        const easedT = easeOutQuad(t);

        // Calculate intermediate position
        const newX = originalX + (targetX - originalX) * easedT;
        const newZ = originalZ + (targetZ - originalZ) * easedT;

        // Check for walls
        if (!isWall(newX, enemy.z, lobby) && !isWall(enemy.x, newZ, lobby)) {
          enemy.x = newX;
          enemy.z = newZ;
        } else if (!isWall(newX, enemy.z, lobby)) {
          enemy.x = newX;
        } else if (!isWall(enemy.x, newZ, lobby)) {
          enemy.z = newZ;
        }

        if (currentStep >= steps) {
          clearInterval(animateKnockback); // End the animation
          if (lobby.gameState.enemies[enemyId]) {
            lobby.gameState.enemies[enemyId].disableMovement = false;
          }
        }
      }, interval);
  
      if (enemy.health <= 0) {
        delete lobby.gameState.enemies[enemyId];
      }
  
      broadcastMsg(lobby.id, {
        type: 'DAMAGE_TAKEN',
        data: {
          enemyId
        }
      });
    }
  });
}

const isWall = (x: number, z: number, lobby: Lobby) => {
  const tile = lobby.gameState.map[Math.floor(z)]?.[Math.floor(x)];
  return tile === WALL;
};