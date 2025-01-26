import React from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Enemy } from '../types';

const HealthBar = ({ enemy }: { enemy: Enemy }) => {
  const barRef1 = React.useRef<Mesh>(null);
  const barRef2 = React.useRef<Mesh>(null);

  useFrame(({ camera }) => {
    if (barRef1.current) {
      barRef1.current.lookAt(camera.position);
    }
    if (barRef2.current) {
      barRef2.current.lookAt(camera.position);
    }
  });

  return (
    <>
      <mesh position={[enemy.x, 0.75, enemy.z]} ref={barRef1}>
        <boxGeometry args={[Math.max(enemy.health, 0) / 100, 0.1, 0.1]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </>
  );
};

export default HealthBar;