import _ from 'lodash';
import ServerConnection from './util/ServerConnection';
import { Canvas } from '@react-three/fiber';
import Map from './components/Map'
import CameraControls from './components/CameraControls';
import Avatar from './components/Avatar';
import Controls from './components/controls/Controls';
import HUD from './components/HUD';
import Sounds from './util/Sounds';
import React from 'react';
import HealthBar from './components/HealthBar';

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <ServerConnection>
        {
          (({ gameState, localState, updatePlayer, sendMessage }) => (
            <>
              <HUD gameState={gameState} /> 
              <Controls sendMessage={sendMessage}>
                {({ movementData }) => (
                  <Canvas style={{ width: '100vw', height: '100vh' }} shadows>
                    <CameraControls localState={localState} updatePlayer={updatePlayer} movementData={movementData} gameState={gameState} />
                    <ambientLight intensity={2} />
                    <Map mapData={gameState.map} />
                    {
                      _.map(gameState.players, (player, playerId) => {
                        return (
                          <React.Fragment key={playerId}>
                            <Sounds player={player} curPlayer={localState.player} playerId={playerId} />
                            <Avatar
                              player={playerId === localState.clientId ? localState.player : player}
                              clientId={playerId}
                              currentPlayer={playerId === localState.clientId}
                              curPlayer={localState.player}
                            />
                          </React.Fragment>
                        );
                      })
                    }
                    {
                      _.map(gameState.enemies, (enemy, enemyId) => {
                        return (
                          <React.Fragment key={enemyId}>
                            <HealthBar enemy={enemy} />
                            <mesh position={[enemy.x, 0 - (0.1 / 2), enemy.z]} receiveShadow>
                              <boxGeometry args={[0.5, 2, 0.5]} />
                              <meshStandardMaterial color='#00FF00' />
                            </mesh>
                          </React.Fragment>
                        );
                      })
                    }
                  </Canvas>
                )}
              </Controls>
            </>
          ))
        }
      </ServerConnection>
    </div>
  );
}

export default App
