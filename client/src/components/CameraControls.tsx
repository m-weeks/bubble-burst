import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Euler, Quaternion, Vector3 } from 'three'
import { GameData } from '../types';
import { CAMERA_ANGLE, CAMERA_HEIGHT, CAMERA_OFFSET, MOVE_SPEED, ROTATION_SPEED } from '../constants'
import { MovementData } from './controls/Controls';

export default function CameraControls({ localState, updatePlayer, movementData, gameState }: Pick<GameData, 'localState' | 'updatePlayer' | 'gameState'> & { movementData: MovementData}) {
  const { player } = localState;
  const { map: mapData } = gameState;
  
  const {
    camera,
  } = useThree();

  const originalPlayerRef = useRef(player);

  useEffect(() => {
    camera.position.set(
      originalPlayerRef.current.x - Math.sin(originalPlayerRef.current.angle) * CAMERA_OFFSET,
      CAMERA_HEIGHT,
      originalPlayerRef.current.z - Math.cos(originalPlayerRef.current.angle) * CAMERA_OFFSET
    );
  }, []);

  const checkCollision = (newPosition) => {
    const buffer = 0.2;

    if (!mapData.length) {
      return false; // No map data, no collision
    }

    // Check the area around the camera, including the buffer
    for (let x = Math.round(newPosition.x - buffer); x <= Math.round(newPosition.x + buffer); x++) {
      for (let z = Math.round(newPosition.z - buffer); z <= Math.round(newPosition.z + buffer); z++) {
        // Check if the grid position is within the map bounds
        if (x < 0 || x >= mapData.length || z < 0 || z >= mapData[0].length) {
          return true; // Collision detected (out of bounds)
        }

        // Check if the grid position is a wall / object
        if (mapData[x][z]) {
          return true; // Collision detected (wall)
        }
      }
    }

    return false; // No collision
  };

  const { x, y, speed, rotateLeft, rotateRight, rotationSpeed } = movementData;

  useFrame((_state, delta) => {
    if (gameState.winner) {
      return;
    }
    const speedPerFrame = MOVE_SPEED * delta * speed;
    const rotationPerFrame = ROTATION_SPEED * delta * rotationSpeed;
    const forwardDirection = new Vector3();
    const rightDirection = new Vector3();
    camera.getWorldDirection(forwardDirection);
    rightDirection.copy(forwardDirection).applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);
  
    const newPlayerData = {
      x: player.x,
      z: player.z,
      angle: player.angle,
    };

    // Calculate new positions
    const newPositionX = newPlayerData.x + forwardDirection.x * y * speedPerFrame + rightDirection.x * x * speedPerFrame;
    const newPositionZ = newPlayerData.z + forwardDirection.z * y * speedPerFrame + rightDirection.z * x * speedPerFrame;
  
    if (!checkCollision({ x: newPositionX, z: newPlayerData.z })) {
      newPlayerData.x = newPositionX;
    }
    if (!checkCollision({ x: newPlayerData.x, z: newPositionZ })) {
      newPlayerData.z = newPositionZ;
    }
  
    if (rotateLeft) {
      newPlayerData.angle += rotationPerFrame;
    }
    if (rotateRight) {
      newPlayerData.angle -= rotationPerFrame;
    }

    camera.position.x = newPlayerData.x + Math.sin(newPlayerData.angle) * CAMERA_OFFSET;
    camera.position.z = newPlayerData.z + Math.cos(newPlayerData.angle) * CAMERA_OFFSET;

    const yAxisRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), newPlayerData.angle);
    const xAxisRotation = new Quaternion().setFromEuler(new Euler(CAMERA_ANGLE, 0, 0));
    camera.setRotationFromQuaternion(yAxisRotation.multiply(xAxisRotation))

    // Update local state copy to have new position. This will get synced with the server at a regular interval
    updatePlayer({
      x: newPlayerData.x,
      z: newPlayerData.z,
      angle: newPlayerData.angle % (Math.PI * 2),
      moving: newPlayerData.x !== player.x || newPlayerData.z !== player.z,
    });
  });

  return null;
}