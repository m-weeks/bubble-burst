import { useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, Texture } from 'three';

function TexturedWall({ textureImage, position, args, repeatX, repeatY }) {
  const texture = useLoader(TextureLoader, textureImage) as Texture;

  texture.wrapS = texture.wrapT = RepeatWrapping;
  
  if (repeatX && repeatY) {
    texture.repeat.set(repeatX, repeatY);
  }

  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function Wall({
  position,
  args,
  textureImage,
  repeatX,
  repeatY,
  color
} : {
  position: [number, number, number],
  args: [number, number, number],
  textureImage?: string,
  repeatX?: number,
  repeatY?: number,
  color?: string
}) {
  if (textureImage) {
    return <TexturedWall textureImage={textureImage} args={args} position={position} repeatX={repeatX} repeatY={repeatY} />
  } 

  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color ?? "grey" } />
    </mesh>
  );
}