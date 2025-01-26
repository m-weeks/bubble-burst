import Wall from './Wall'
import wallImage from './assets/wall.jpg'
import marketImage from './assets/market.png'
import floorImage from './assets/floor.jpg'
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader, Vector3 } from 'three';
import { useRef } from 'react';
import { Sky } from '@react-three/drei';

const BankWall = ({ x, z }: { x: number, z: number }) => {
  const marketTexture = useLoader(TextureLoader, marketImage);
  const wallRef = useRef<Mesh>(null)

    useFrame(({ camera }) => {
      if (wallRef.current) {
        // Make the plane always face the current player (billboarding effect)
        wallRef.current.lookAt(new Vector3(camera.position.x, 0, camera.position.z));
      }
    });

  return <>
    <mesh
      position={[x, 0 - (0.1 / 2), z]}
      scale={[1, 1, 1]}
      ref={wallRef}
    >
      <planeGeometry args={[1.5, 1.125]} />
      <meshStandardMaterial map={marketTexture} transparent />
    </mesh>
  </>
}

export default function Map({ mapData } : { mapData: number[][] }) {
  const wallSize: [number, number, number] = [1, 3, 1]; // Assuming each wall is 1x1x1 (WxHxD)

  const floorWidth = mapData.length;
  const floorDepth = mapData[0].length;
  const floorSize: [number, number, number] = [floorWidth, 0.01, floorDepth];

  return (
    <>
      <Sky
        distance={450000} // Camera distance (default=450000)
        sunPosition={[0, 1, 0]} // Sun position normal (default=[0, 1, 0])
        inclination={1} // Sun elevation angle from 0 to 1 (default=0)
        azimuth={0.25} // Sun rotation around the Y axis from 0 to 1 (default=0.25)
      />

      <Wall
        args={floorSize}
        position={[(floorWidth - 1) / 2, -0.5, (floorDepth - 1) / 2]}
        textureImage={floorImage}
        color='#f2e600'
        repeatX={mapData.length}
        repeatY={mapData[0].length}
      />

      {
        mapData.flatMap((row, i) => (
          row.map((cell, j) => {
            if (cell === 1) {
              return <Wall key={`${i}-${j}`} position={[i, 0, j]} args={wallSize} textureImage={wallImage} />
            }
            if (cell === 2) {
              return <Wall key={`${i}-${j}`} position={[i, 0, j]} args={wallSize} color='#000000' />
            }
            if (cell === 3) {
              return (
                <>
                  <BankWall x={i} z={j} />
                </>
              )
            }
            return null
          }
        )))
      }
    </>
  );
}