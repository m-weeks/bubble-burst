import { Joystick, JoystickShape } from 'react-joystick-component';
import { useKeyboardControls } from './useKeyboardControls';
import { ReactNode, useRef, useState } from 'react';
import { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick';
import { GameData } from '../../types';
import { isTouchDevice } from '../../util/isTouchDevices';

export type MovementData = {
  x: number;
  y: number;
  speed: number;
  rotateLeft: boolean;
  rotateRight: boolean;
  rotationSpeed: number;
};

const Controls = ({ children, sendMessage }: { children: ({ movementData } : { movementData: MovementData}) => ReactNode } & Pick<GameData, 'sendMessage'>) => {
  // Mostly just exists for debugging purposes
  const keyboardMovementData = useKeyboardControls({ handleFire: () => sendMessage('FIRE', {}) });

  const joystickMovementData = useRef<MovementData>({
    x: 0,
    y: 0,
    speed: 0,
    rotateLeft: false,
    rotateRight: false,
    rotationSpeed: 0,
  });

  const handleMove = (stick: IJoystickUpdateEvent) => {
    const { x, y, distance } = stick;
    const threshold = 40; // Minimum distance to consider movement

    if (!distance) {
      return;
    }

    joystickMovementData.current = {
      ...joystickMovementData.current,
      x: distance > threshold ? (x ?? 0) : 0,
      y: distance > threshold ? (y ?? 0) : 0 ,
      speed: distance / 100.0
    };
  };

  const handleStop = () => {
    joystickMovementData.current = {
      ...joystickMovementData.current,
      x: 0,
      y: 0,
      speed: 0,
    };
  };

  const handleRotate = (stick: IJoystickUpdateEvent) => {
    const { direction, distance } = stick;
    const threshold = 20; // Minimum distance to consider movement

    if (!distance) {
      return;
    }

    joystickMovementData.current = {
      ...joystickMovementData.current,
      rotateLeft: distance > threshold && direction === 'LEFT',
      rotateRight: distance > threshold && direction === 'RIGHT',
      rotationSpeed: distance / 100.0
    };
  }

  const handleStopRotate = () => {
    joystickMovementData.current = {
      ...joystickMovementData.current,
      rotateLeft: false,
      rotateRight: false,
      rotationSpeed: 0,
    };
  }

  const [clicked, setClicked] = useState(false)

  const handleFire = () => {
    setClicked(true);
    sendMessage('FIRE', {})
  }

  const handleStopFire = () => {
    setClicked(false);
  }

  return (
    <>
      {
        children({
          movementData: {
            x: keyboardMovementData.x || joystickMovementData.current.x,
            y: keyboardMovementData.y || joystickMovementData.current.y,
            speed: keyboardMovementData.speed || joystickMovementData.current.speed,
            rotateLeft: keyboardMovementData.rotateLeft || joystickMovementData.current.rotateLeft,
            rotateRight: keyboardMovementData.rotateRight || joystickMovementData.current.rotateRight,
            rotationSpeed: keyboardMovementData.rotationSpeed || joystickMovementData.current.rotationSpeed,
          }
        })
      }

      {isTouchDevice() && (
        <>
          <div style={{ position: 'fixed', zIndex: '1', bottom: '20vh', right: '10vw', opacity: 0.5 }}>
            <button className={`fireButton ${clicked ? 'clicked' : ''}`} onPointerDown={handleFire} onPointerUp={handleStopFire}>
              PUNCH!
            </button>
            <Joystick
              size={75}
              baseColor="#707070"
              stickColor="#fff"
              move={handleRotate}
              stop={handleStopRotate}
              throttle={100}
              controlPlaneShape={JoystickShape.AxisX}
              baseShape={JoystickShape.Square}
              stickShape={JoystickShape.Square}
            />
          </div>
          <div style={{ position: 'fixed', zIndex: '1', bottom: '20vh', left: '10vw', opacity: 0.5 }}>
            <Joystick
              size={75}
              baseColor="#707070"
              stickColor="#fff"
              move={handleMove}
              stop={handleStop}
              throttle={100}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Controls;