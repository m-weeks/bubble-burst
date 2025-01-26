import { useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import _ from 'lodash';
import { GameData, GameState, LocalState, Player } from '../types';
import Ellipsis from '../components/Ellipsis';
import cashSound from '../components/assets/audio/cash.wav';

export default ({ children }: { children: (gameData: GameData) => ReactNode }) => {
  const cashAudioRef = useRef<HTMLAudioElement>()
  useEffect(() => {
    cashAudioRef.current = new Audio(cashSound);
  }, [])

  // Stores the main game state, including all players
  const [gameState, setGameState] = useState<GameState>({
    players: {},
    enemies: {},
    started: false,
    map: [],
    score: 0,
  });

  // Stores client information and the local players state. We will rely on this as the source of truth for the client. This is to prevent rubberbanding movement due to ping
  const [localState, setLocalState] = useState<Partial<LocalState> & { loaded: boolean }>({
    loaded: false,
    clientId: undefined,
    player: undefined,
  })

  const socketRef = useRef<WebSocket | null>(null);
  const localStateRef = useRef(localState)
  localStateRef.current = localState

  const [disconnected, setDisconnected] = useState(false);

  const updatePlayer = (newValues) => {
    setLocalState((oldState) => ({
      ...oldState,
      player: {
        ...(_.cloneDeep(oldState.player)),
        ...newValues
      }
    }))
  }

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WEBSOCKET_SERVER);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Connected');
      setLocalState((oldState) => ({
        ...oldState,
        loaded: true
      }))
      socket.send(JSON.stringify(
        {
          type: 'JOIN',
        }
      ));
    };
  
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
  
      if (msg.type === 'SYNC') {
        const { data, clientId } = msg as { data: GameState, clientId: string }

        setGameState((oldState) => {
          const newState = _.cloneDeep(oldState);
          _.assign(newState, data)
          return newState;
        });
        setLocalState((oldState) => {
          const result = {
            ...oldState,
            clientId: clientId,
          }

          if (!result.player) {
            result.player = msg.data.players[msg.clientId];
          } else {
            result.player = { ...result.player, ...(_.omit(msg.data.players[msg.clientId], ['x', 'z', 'angle', 'moving'])) };
          }

          return result;
        })
        
      } else if (msg.type === 'RESET_PLAYER') {
        const { data } = msg as { data: { player: Player } }
        setLocalState((oldState) => ({
          ...oldState,
          player: {
            ...oldState.player,
            ...data.player,
          },
        }))
      } else if (msg.type === 'FIRED') {
        window.dispatchEvent(new CustomEvent('fire', { detail: { clientId: msg.data.clientId } }));
      } else if (msg.type === 'DAMAGE_TAKEN') {
        window.dispatchEvent(new CustomEvent('damageTaken', { detail: { enemyId: msg.data.enemyId } }));
      } else if (msg.type === 'SCORE_LOST') {
        cashAudioRef.current?.play();
      }
    }
  
    socket.onclose = () => {
      setDisconnected(true);
      console.log('Connection closed');
    }
  
    socket.onerror = () => {
      console.error('Socket error');
    }

    return () => {
      console.log('CLOSING CONNECTION')
      socket.close();
    }
  }, [])

  const sendMessage = useCallback((type, state) => {
    socketRef.current?.send(JSON.stringify(
      {
        type,
        data: state,
      }
    ))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStateRef.current.loaded) {
        sendMessage('PLAYER_SYNC', localStateRef.current.player);
      }
    }, 15);

    return () => {
      clearInterval(interval)
    }
  }, [sendMessage])

  if (!localState.loaded || !localState.player || !localState.clientId) {
    return null;
  }

  if (!gameState.started) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.png" style={{ width: '400px' }} />
          <div style={{ fontSize: '24px' }}>
            <div>Players: {Object.keys(gameState.players).length}</div>
          </div>
          <div style={{ fontSize: '24px' }}>
            <div>
              Waiting for more players<Ellipsis/>
            </div>
          </div>

          <div>
            <button className='startButton' onClick={() => sendMessage('START', {})}>
              Start
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (disconnected) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.png" style={{ width: '200px' }} />
          <div>
            Disconnected
          </div>
          <div style={{ fontSize: '24px' }}>
            Please reload and try again
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {children({ gameState, localState: localState as LocalState, updatePlayer, sendMessage })}
    </>
  )
}