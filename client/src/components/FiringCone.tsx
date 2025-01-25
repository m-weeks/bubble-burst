import { useEffect, useRef, useState } from "react";
import { Player } from "../types"
import { useFrame } from "@react-three/fiber";
import { Color, Mesh, Vector3 } from "three";
import _ from 'lodash'

const PROJECTILE_SPEED = 15;
const NUM_PROJECTILES = 50;
const PROJECTILE_SPREAD = 0.4;
const PROJECTILE_LIFETIME = 500; // Lifetime in ms
const PROJECTILE_BASE_SIZE = 0.05;

const PROJECTILE_COLORS = [
  "#7c1804",
  "#b25323",
  "#997909",
  "#8e8d8a",
  "#8e8d8a",
  "#8e8d8a",
]

type Projectile = {
  id: string,
  origin: Vector3,
  horizontalAngle: number,
  verticalAngle: number,
  color: Color,
  size: number,
  speed: number,
}

const Projectile = ({ projectile, opacity }: { projectile: Projectile, opacity?: number }) => {
  const { origin, horizontalAngle, verticalAngle, color, size, speed } = projectile;
  const ref = useRef<Mesh>(null);
  const velocity = new Vector3(
    -Math.sin(horizontalAngle) * Math.cos(verticalAngle) * speed,
    Math.sin(verticalAngle) * speed,
    -Math.cos(horizontalAngle) * Math.cos(verticalAngle) * speed
  );

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.position.addScaledVector(velocity, delta);
    }
  });

  return (
    <mesh ref={ref} position={origin} castShadow>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} opacity={opacity} />
    </mesh>
  );
};


const FiringCone = ({ player, clientId }: { player: Player, clientId: string }) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const playerRef = useRef(player)
  playerRef.current = player;

  useEffect(() => {
    const handleFire = (event: CustomEvent) => {
      if (event.detail.clientId !== clientId) {
        return
      }
      setElapsedTime(0);

      const newProjectiles: Projectile[] = [];
      for (let i = 0; i < NUM_PROJECTILES; i++) {
        const horizontalSpread = (Math.random() - 0.5) * PROJECTILE_SPREAD; // Random horizontal spread
        const verticalSpread = (Math.random() - 0.5) * PROJECTILE_SPREAD; // Random vertical spread
        newProjectiles.push({
          id: _.uniqueId('projectile_'),
          origin: new Vector3(playerRef.current.x, 0.25, playerRef.current.z),
          horizontalAngle: playerRef.current.angle + horizontalSpread,
          verticalAngle: verticalSpread,
          color: new Color(PROJECTILE_COLORS[i % PROJECTILE_COLORS.length]),
          size: 0.025 + Math.random() * PROJECTILE_BASE_SIZE, // Random size between 0.025 and 0.075
          speed: PROJECTILE_SPEED * (0.6 + Math.random() * 0.8)
        });
      }
      setProjectiles(newProjectiles);

      setTimeout(() => {
        setProjectiles([]);
      }, PROJECTILE_LIFETIME);
    }
    // @ts-ignore
    window.addEventListener('fire', handleFire);

    return () => {
      // @ts-ignore
      window.removeEventListener('fire', handleFire);
    };
  }, [clientId]);

  useFrame((_, delta) => {
    if (projectiles.length) {
      setElapsedTime((prev) => prev + delta * 1000);
    }
  });

  const t = elapsedTime / PROJECTILE_LIFETIME;
  const opacity = Math.max(1 - t * t, 0); // Quadratic decay

  return (
    projectiles.map((proj, index) => (
      <Projectile
        key={index}
        projectile={proj}
        opacity={opacity}
      />
    ))
  )
}

export default FiringCone