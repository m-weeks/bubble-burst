import React from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Player } from '../types';

const HealthBar = ({ player }: { player: Player }) => {
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
      <mesh position={[player.x, 0.75, player.z]} ref={barRef1}>
        <boxGeometry args={[Math.max(player.health, 0) / 100, 0.1, 0.1]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </>
  );
};

export default HealthBar;