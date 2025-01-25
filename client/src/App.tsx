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

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <ServerConnection>
          {
            (({ gameState, localState, updatePlayer, sendMessage }) => (
              <>
                {/* <HUD localState={localState} gameState={gameState} sendMessage={sendMessage} />  */}
                <Controls sendMessage={sendMessage}>
                  {({ movementData }) => (
                    <Canvas style={{ width: '100vw', height: '100vh' }} shadows>
                      <CameraControls localState={localState} updatePlayer={updatePlayer} movementData={movementData} gameState={gameState} />
                      {/* <ambientLight intensity={2} /> */}
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
