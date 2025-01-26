import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, Object3D, TextureLoader, Vector3 } from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Enemy as EnemyType, Player } from '../types';
import enemyAvatarData from './assets/enemy';
import HealthBar from './HealthBar';

const Enemy = ({ enemy, enemyId, curPlayer }: { enemy: EnemyType, enemyId: string, curPlayer: Player }) => {
  const { moving, angle } = enemy

  const [iFrame, setIFrame] = useState(false);

  useEffect(() => {
    let timeouts: number[] = [];

    const handleDamage = (event: CustomEvent) => {
      if (event.detail.enemyId !== enemyId) {
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
      window.removeEventListener('damageTaken', handleDamage);
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [enemyId]);

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
        if (iFrame) {
          return enemyAvatarData.right.hit;
        }
      if (moving) { 
        return enemyAvatarData.right.step[stepFrame - 1];
      }
      return enemyAvatarData.right.idle;
    }
    if (diff > 135 && diff < 225) {
        if (iFrame) {
          return enemyAvatarData.front.hit;
        }
      if (moving) {
        return enemyAvatarData.front.step[stepFrame - 1];
      }
      return enemyAvatarData.front.idle;
    }
    if (diff > 225 && diff < 315) {
        if (iFrame) {
          return enemyAvatarData.left.hit;
        }
      if (moving) { 
        return enemyAvatarData.left.step[stepFrame - 1];
      }
      return enemyAvatarData.left.idle;
    }
    if (moving) {
      return enemyAvatarData.behind.step[stepFrame - 1];
    }
    return enemyAvatarData.behind.idle;
  }, [angle, curPlayer.angle, stepFrame, moving, iFrame]);
  
  const texture = useLoader(TextureLoader, avatarType);
  const enemyRef = useRef<Mesh>(null);

  useFrame(({ camera }) => {
    if (enemyRef.current) {
      // Make the plane always face the current player (billboarding effect)
      enemyRef.current.lookAt(new Vector3(camera.position.x, 0, camera.position.z));
    }
  });

  const targetRef = useRef(new Object3D());

  useFrame(() => {
    if (targetRef.current) {
      targetRef.current.position.set(
        enemy.x,
        0.75,
        enemy.z,
      );
    }
  });

  return (
    <>
      <mesh
        ref={enemyRef}
        position={[enemy.x, 0 - (0.1 / 2), enemy.z]}
        scale={[0.75, 0.9, 0.75]}
      >
        <planeGeometry args={[1.5, 1.125]} />
        <meshStandardMaterial map={texture} transparent opacity={opacity} />
      </mesh>

      <HealthBar enemy={enemy} />
    </>
  );
};

export default Enemy;