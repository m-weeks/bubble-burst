import express from 'express';
import _ from 'lodash';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { addToLobby, fire, getLobby, lobbies, start, removeFromLobby, updatePlayerState } from './lobby.js';
import { ENEMY_SPEED, MAX_ENEMIES_PER_PLAYER } from './constants.js';
import { findPath, initializeEnemy } from './enemy.js';
import { BASE } from './map.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients: Record<string, WebSocket> = {};

wss.on('connection', (ws) => {
  const clientId = _.uniqueId('client_');
  clients[clientId] = ws;

  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());

    switch (msg.type) {
      case 'JOIN':
        addToLobby(clientId);
        break;
      case 'PLAYER_SYNC':
        const newPlayerData = _.pick(msg.data, ['x', 'z', 'angle', 'moving']);
        updatePlayerState(clientId, newPlayerData);
        break;
      case 'FIRE':
        fire(clientId);
        break;
      case 'START':
        start(clientId);
        break;
    }
  });

  ws.on('close', (code, reason) => {
    console.log('CLOSED', clientId);
    console.log('Close Code: ', code);
    console.log('Close Reason: ', reason.toString());
    delete clients[clientId];
    removeFromLobby(clientId);
  });
});

export const singleMsg = (clientId: string, data = {}) => {
  const ws = clients[clientId];
  if (!ws) return;

  ws.send(JSON.stringify({
    ...data,
    clientId,
  }));
}

export const broadcastMsg = (lobbyId: string, data = {}, excludedClients: string[] = []) => {
  _.forEach(clients, (ws, clientId) => {
    if (excludedClients.includes(clientId)) {
      return;
    }
    const lobby = getLobby(clientId);
    if (!lobby || lobby.id !== lobbyId) return;

    ws.send(JSON.stringify({
      ...data,
      clientId,
    }));
  });
}

export const updateClients = () => {
  _.forEach(lobbies, (lobby) => {
    broadcastMsg(lobby.id, {
      type: 'SYNC',
      data: lobby.gameState,
    }, []);
  });
};

setInterval(() => {
  updateClients();
}, 15);

let enemyIdCounter = 0;

const spawnEnemies = () => {
  Object.entries(lobbies).forEach(([lobbyId, lobby]) => {
    if (!lobby.gameState.score) {
      return;
    }
    const numEnemies = Object.values(lobby.gameState.enemies).length;
    if (numEnemies < MAX_ENEMIES_PER_PLAYER * Object.values(lobby.gameState.players).length) {
      lobby.gameState.enemies[_.uniqueId('enemy_')] = initializeEnemy(lobby.gameState.map);
    }
  })
}

setInterval(() => {
  spawnEnemies();
}, 5000)

const moveEnemies = () => {
  Object.entries(lobbies).forEach(([lobbyId, lobby]) => {
    if (!lobby.gameState.score) {
      return;
    }

    const basePosition = lobby.gameState.map.flatMap((row, rowIndex) =>
      row.map((cell, colIndex) => (cell === BASE ? [colIndex, rowIndex] : null))
    ).find(Boolean) as [number, number];

    Object.entries(lobby.gameState.enemies).forEach(([enemyId, enemy]) => {
      if (enemy.disableMovement) {
        lobby.gameState.enemies[enemyId].moving = false;
        return;
      }
      // Translate enemy's position to map coordinates
      const mapX = Math.floor(enemy.x);
      const mapY = Math.floor(enemy.z);

      const path = findPath(
        { x: mapY, z: mapX },                       // Enemy's position in map coordinates
        { x: basePosition[0], z: basePosition[1] }, // Base position in map coordinates
        lobby.gameState.map
      ).map((step) => ({ x: step.z, z: step.x }));
    
      if (path.length > 1) {
        lobby.gameState.enemies[enemyId].moving = true;
        const nextStep = path[1];
        const threshold = 0.05; // Slightly larger threshold for smoother corners

        // Calculate the direction to the next step
        const dx = nextStep.x - enemy.x;
        const dz = nextStep.z - enemy.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < threshold) {
          // Snap to the next step and move forward in the path
          enemy.x = nextStep.x;
          enemy.z = nextStep.z;
          path.shift(); // Remove the reached step
        } else {
          // Smoothly move toward the next step
          const movementScale = ENEMY_SPEED / distance; // Normalize and scale the movement
          enemy.x += dx * movementScale;
          enemy.z += dz * movementScale;

          // Set the angle of the enemy to the direction they are moving
          enemy.angle = (Math.atan2(dx, dz) + Math.PI);
        }
      } else {
        lobby.gameState.enemies[enemyId].moving = false;
      }

      // This is the opposite of basePosition used above? It works and I don't have time to understand why
      if (Math.floor(enemy.x) === basePosition[1] && Math.floor(enemy.z) === basePosition[0]) {
        delete lobby.gameState.enemies[enemyId];
        const lostAmount = Math.max(10000, Math.round(lobby.gameState.score * 0.2));
        lobby.gameState.score = Math.max(lobby.gameState.score - lostAmount, 0);
        broadcastMsg(lobby.id, {
          type: 'SCORE_LOST',
          data: {}
        });
      }
    });
  });
}

setInterval(() => {
  moveEnemies();
}, 15); // Update 60 times per second for smooth movement

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});