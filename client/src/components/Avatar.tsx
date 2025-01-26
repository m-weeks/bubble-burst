import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, Object3D, TextureLoader, Vector3 } from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '../types';
import avatarData from './assets/avatar';

const Avatar = ({ player, clientId, curPlayer }: { player: Player, clientId: string, curPlayer: Player }) => {
  const { moving, angle } = player

  const [punching, setPunching] = useState(false);

  useEffect(() => {
    let timeouts: number[] = [];
    const handleFire = (event: CustomEvent) => {
      if (event.detail.clientId !== clientId) {
        return
      }
      
      setPunching(true);
      timeouts.push(setTimeout(() => {
        setPunching(false);
      }, 250));
    }
    // @ts-ignore
    window.addEventListener('fire', handleFire);

    return () => {
      // @ts-ignore
      window.removeEventListener('fire', handleFire);
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [clientId]);

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

  const punchTypeRef = useRef(avatarData.front.punch[0])
  useEffect(() => {
    if (punching) {
      punchTypeRef.current = Math.random() < 0.5 ? avatarData.front.punch[0] : avatarData.front.punch[1];
    }
  }, [punching])


  const avatarType = useMemo(() => {
    let diff = (curPlayer.angle - angle) * (180 / Math.PI);
    diff = (diff +  360) % 360;
    if (diff > 45 && diff < 135) {
        if (punching) {
          return avatarData.right.punch[0];
        }
      if (moving) { 
        return avatarData.right.step[stepFrame - 1];
      }
      return avatarData.right.idle;
    }
    if (diff > 135 && diff < 225) {
        if (punching) {
          return punchTypeRef.current;
        }
      if (moving) {
        return avatarData.front.step[stepFrame - 1];
      }
      return avatarData.front.idle;
    }
    if (diff > 225 && diff < 315) {
        if (punching) {
          return avatarData.left.punch[0];
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
  }, [angle, curPlayer.angle, stepFrame, moving, punching]);
  
  const texture = useLoader(TextureLoader, avatarType);
  const avatarRef = useRef<Mesh>(null);

  useFrame(({ camera }) => {
    if (avatarRef.current) {
      avatarRef.current.lookAt(new Vector3(camera.position.x, 0, camera.position.z));
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
        <meshStandardMaterial map={texture} transparent />
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