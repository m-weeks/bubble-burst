import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, Object3D, TextureLoader } from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '../types';
import avatarData from './assets/avatar';
import HealthBar from './HealthBar';

const Avatar = ({ player, currentPlayer = false, clientId, curPlayer }: { player: Player, currentPlayer?: boolean, clientId: string, curPlayer: Player }) => {
  const { moving, angle } = player

  const [firing, setFiring] = useState(false);
  const [iFrame, setIFrame] = useState(false);

  useEffect(() => {
    let timeouts: number[] = [];
    const handleFire = (event: CustomEvent) => {
      if (event.detail.clientId !== clientId) {
        return
      }
      
      setFiring(true);
      timeouts.push(setTimeout(() => {
        setFiring(false);
      }, 250));
    }
    // @ts-ignore
    window.addEventListener('fire', handleFire);

    const handleDamage = (event: CustomEvent) => {
      if (event.detail.playerId !== clientId) {
        return
      }
      setIFrame(true);
      timeouts.push(setTimeout(() => {
        setIFrame(false);
      }, 500));
    }
    // @ts-ignore
    window.addEventListener('damageTaken', handleDamage);

    return () => {
      // @ts-ignore
      window.removeEventListener('fire', handleFire);
      // @ts-ignore
      window.removeEventListener('damageTaken', handleDamage);
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [clientId]);

  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let interval;
    if (iFrame) {
      interval = setInterval(() => {
        setOpacity((oldOpacity) => oldOpacity === 1 ? 0 : 1);
      }, 50)
    }
    if (!iFrame) {
      setOpacity(1);
    }
    return () => {
      clearInterval(interval);
    }
  }, [iFrame])

  const [stepFrame, setStepFrame] = useState(1);
  useEffect(() => {
    let interval;
    if (moving) {
      interval = setInterval(() => {
        setStepFrame((oldFrame) => oldFrame === 1 ? 2 : 1);
      }, 200)
    }

    return () => {
      clearInterval(interval);
    }
  }, [moving])

  const avatarType = useMemo(() => {
    let diff = (curPlayer.angle - angle) * (180 / Math.PI);
    diff = (diff +  360) % 360;
    if (diff > 45 && diff < 135) {
        if (firing) {
          return avatarData.right.shoot;
        }
      if (moving) { 
        return avatarData.right.step[stepFrame - 1];
      }
      return avatarData.right.idle;
    }
    if (diff > 135 && diff < 225) {
        if (firing) {
          return avatarData.front.shoot;
        }
      if (moving) {
        return avatarData.front.step[stepFrame - 1];
      }
      return avatarData.front.idle;
    }
    if (diff > 225 && diff < 315) {
        if (firing) {
          return avatarData.left.shoot;
        }
      if (moving) { 
        return avatarData.left.step[stepFrame - 1];
      }
      return avatarData.left.idle;
    }
    if (moving) {
      return avatarData.behind.step[stepFrame - 1];
    }
    return avatarData.behind.idle;
  }, [angle, curPlayer.angle, stepFrame, moving, firing]);
  
  const texture = useLoader(TextureLoader, avatarType);
  const avatarRef = useRef<Mesh>(null);

  useFrame(({ camera }) => {
    if (avatarRef.current) {
      // Make the plane always face the current player (billboarding effect)
      avatarRef.current.lookAt(camera.position);
    }
  });

  const targetRef = useRef(new Object3D());

  useFrame(() => {
    if (targetRef.current) {
      targetRef.current.position.set(
        player.x,
        0.75,
        player.z,
      );
    }
  });

  return (
    <>
      <mesh
        ref={avatarRef}
        position={[player.x, 0 - (0.1 / 2), player.z]}
        scale={[0.75, 0.9, 0.75]}
      >
        <planeGeometry args={[1.5, 1.125]} />
        <meshStandardMaterial map={texture} transparent opacity={opacity} />
      </mesh>
      
      {/* {
        currentPlayer && (
          <spotLight
            position={[
              player.x + Math.sin(player.angle) * 3,
              0.75,
              player.z + Math.cos(player.angle) * 3
            ]}
            target={targetRef.current}
            angle={Math.PI / 6}
            intensity={2}
            distance={7}
            decay={0.1}
            castShadow
          />
        )
      } */}
      
      {/* Invisible object that the spotlight is targeting */}
      <primitive object={targetRef.current} />
    </>
  );
};

export default Avatar;