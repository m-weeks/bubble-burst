export type Player = {
  x: number,
  z: number,
  angle: number,
  health: number,
  score?: number,
  moving: boolean,
}

export type Enemy = {
  x: number,
  z: number,
  angle: number,
  health: number,
  moving: boolean,
}

export type GameState = {
  players: Record<string, Player>,
  enemies: Record<string, Enemy>,
  started: boolean,
  map: number[][],
  score: number
}

export type LocalState = {
  loaded: boolean,
  clientId: string,
  player: Player,
}

export type GameData = {
  localState: LocalState;
  updatePlayer: (newValues: Partial<Player>) => void;
  gameState: GameState;
  sendMessage: (type: string, state: any) => void;
}