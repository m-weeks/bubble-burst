import _ from 'lodash';
import { LOBBY_SIZE } from './constants.js';
import { getStartingPosition, initializePlayer, Player } from './player.js';
import { Enemy, onHit } from './enemy.js';
import { broadcastMsg } from './index.js';
import { getMap } from './map.js';

export type Lobby = {
  id: string,
  gameState: GameState,
}

type GameState = {
  players: Record<string, Player>,
  enemies: Record<string, Enemy>,
  started: boolean,
  map: number[][],
  score: number
}

export const lobbies: Record<string, Lobby> = {
}

const createLobby = (): Lobby => {
  const id = _.uniqueId('lobby_');
  const lobby: Lobby = {
    id,
    gameState: {
      players: {},
      enemies: {},
      started: false,
      map: getMap(0),
      score: 10000000,
    }
  };
  lobbies[id] = lobby;
  return lobby;
};

export const getLobby = (clientId: string): Lobby | undefined => {
  return Object.values(lobbies).find((lobby) => clientId in lobby.gameState.players);
}

export const addToLobby = (clientId: string, player?: Partial<Player>) => {
  // Find a lobby with room for the player
  let lobby = Object.values(lobbies).find((lobby) => Object.keys(lobby.gameState.players).length < LOBBY_SIZE && !lobby.gameState.started); // TODO: Enable this check
  if (!lobby) { // if one doesn't exist, create a new lobby
    lobby = createLobby();
  }

  lobby.gameState.players[clientId] = {
    ...player,
    ...initializePlayer(lobby.gameState.map)
  };

  console.log('PLAYER JOINED', clientId)
  console.log('NUM PLAYERS', Object.keys(lobby.gameState.players).length);

  // Change map if needed
  const map = getMap(Object.keys(lobby.gameState.players).length)
  lobby.gameState.map = map
  // move players if needed
  Object.keys(lobby.gameState.players).forEach((id) => {
    const [x, z] = getStartingPosition(map);
    if (lobby?.gameState) {
      lobby.gameState.players[id].x = x;
      lobby.gameState.players[id].z = z;
    }
  })

  return lobby;
}

export const removeFromLobby = (clientId: string) => {
  const lobby = getLobby(clientId);
  if (!lobby) return;

  delete lobby.gameState.players[clientId];

  if (Object.keys(lobby.gameState.players).length === 0) {
    delete lobbies[lobby.id];
    console.log(`LOBBY ${lobby.id} DELETED`);
  }
}

export const updatePlayerState = (clientId: string, newPlayerState: { x: number, z: number, angle: number }) => {
  const lobby = getLobby(clientId);
  if (!lobby) {
    return;
  }

  const prevState = lobby.gameState.players[clientId];
  if (!prevState) {
    return;
  }

  lobby.gameState.players[clientId] = {
    ...prevState,
    ...newPlayerState,
  }
};

export const start = (clientId) => {
  const lobby = getLobby(clientId);
  if (!lobby || lobby.gameState.started) return;

  lobby.gameState.started = true;
}

export const fire = (clientId) => {
  const lobby = getLobby(clientId);
  if (!lobby) return;

  const player = lobby.gameState.players[clientId];
  if (!player || player.firing) {
    return;
  }

  player.firing = true;
  setTimeout(() => {
    lobby.gameState.players[clientId].firing = false;
  }, 500);

  onHit(player, lobby);

  broadcastMsg(lobby.id, {
    type: 'FIRED',
    data: {
      clientId
    }
  });
};