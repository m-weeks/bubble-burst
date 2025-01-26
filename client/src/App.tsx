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
import Enemy from './components/Enemy';

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
                        if (playerId === localState.clientId) {
                          return (
                            <Sounds target={player} curPlayer={localState.player} targetId={playerId} />
                          );
                        }
                        return (
                          <React.Fragment key={playerId}>
                            <Sounds target={player} curPlayer={localState.player} targetId={playerId} />
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
                          <>
                            <Sounds target={enemy} curPlayer={localState.player} targetId={enemyId} />
                            <Enemy enemy={enemy} enemyId={enemyId} curPlayer={localState.player} key={enemyId} />
                          </>
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
