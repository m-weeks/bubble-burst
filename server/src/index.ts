import express from 'express';
import _ from 'lodash';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { addToLobby, getLobby, lobbies, rematch, removeFromLobby, updatePlayerState } from './lobby.js';

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
      case 'REMATCH':
        rematch(clientId);
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

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});