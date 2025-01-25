import _ from 'lodash';
import { LOBBY_SIZE } from './constants.js';
import { initializePlayer, Player } from './player.js';
import { Enemy } from './enemy.js';
import { broadcastMsg, singleMsg } from './index.js';
import { getMap } from './map.js';

type Lobby = {
  id: string,
  gameState: GameState,
}

type GameState = {
  players: Record<string, Player>,
  enemies: Record<number, Enemy>,
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
      started: true, // TODO: Don't default to started
      map: getMap(),
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
  let lobby = Object.values(lobbies).find((lobby) => Object.keys(lobby.gameState.players).length < LOBBY_SIZE && !lobby.gameState.started);
  if (!lobby) { // if one doesn't exist, create a new lobby
    lobby = createLobby();
  }

  lobby.gameState.players[clientId] = {
    ...player,
    ...initializePlayer(lobby.gameState.map)
  };

  if (Object.values(lobby.gameState.players).length >= LOBBY_SIZE) {
    lobby.gameState.started = true;
  }

  console.log('PLAYER JOINED', clientId)
  console.log('NUM PLAYERS', Object.keys(lobby.gameState.players).length);

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

export const rematch = (clientId) => {
  const lobby = getLobby(clientId);
  if (!lobby || lobby.gameState.score) return;

  const player = lobby.gameState.players[clientId];
  if (!player) {
    return;
  }

  const playerData: Partial<Player> = {}

  removeFromLobby(clientId);
  const newLobby = addToLobby(clientId, playerData);

  singleMsg(clientId, {
    type: 'RESET_PLAYER',
    data: {
      player: newLobby.gameState.players[clientId],
    }
  })
}

export const fire = (clientId) => {
  const lobby = getLobby(clientId);
  if (!lobby) return;

  const player = lobby.gameState.players[clientId];
  if (!player) {
    return;
  }

  broadcastMsg(lobby.id, {
    type: 'FIRED',
    data: {
      clientId
    }
  });
}