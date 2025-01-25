import { useEffect, useRef } from "react";
import { MovementData } from "./Controls";

export const useKeyboardControls = ({ handleFire }: { handleFire: () => void }) : MovementData => {
  const movementDataRef = useRef<MovementData>({
    x: 0,
    y: 0,
    rotateLeft: false,
    rotateRight: false,
    speed: 0,
    rotationSpeed: 0,
  });


  const handleKeyDown = (event) => {
    switch (event.code) {
      case 'KeyW':
        movementDataRef.current.y = 1;
        break;
      case 'KeyS':
        movementDataRef.current.y = -1;
        break;
      case 'KeyA':
        movementDataRef.current.rotateLeft = true;
        break;
      case 'KeyD':
        movementDataRef.current.rotateRight = true;
        break;
      case 'KeyQ':
        movementDataRef.current.x = -1;
        break;
      case 'KeyE':
        movementDataRef.current.x = 1;
        break;
      case 'Space':
        handleFire();
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event) => {
    switch (event.code) {
      case 'KeyW':
        movementDataRef.current.y = 0;
        break;
      case 'KeyS':
        movementDataRef.current.y = 0;
        break;
      case 'KeyA':
        movementDataRef.current.rotateLeft = false;
        break;
      case 'KeyD':
        movementDataRef.current.rotateRight = false;
        break;
      case 'KeyQ':
        movementDataRef.current.x = 0;
        break;
      case 'KeyE':
        movementDataRef.current.x = 0;
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return {
    ...movementDataRef.current,
    speed: movementDataRef.current.y || movementDataRef.current.x ? 1 : 0,
    rotationSpeed: movementDataRef.current.rotateLeft || movementDataRef.current.rotateRight ? 1 : 0,
  };
}