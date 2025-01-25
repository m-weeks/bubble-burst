import Wall from './Wall'
import wallImage from './assets/wall.jpg'
import floorImage from './assets/floor.jpg'

export default function Map({ mapData } : { mapData: number[][] }) {
  const wallSize: [number, number, number] = [1, 1.5, 1]; // Assuming each wall is 1x1x1 (WxHxD)

  const floorWidth = mapData.length;
  const floorDepth = mapData[0].length;
  const floorSize: [number, number, number] = [floorWidth, 0.01, floorDepth];

  return (
    <>
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
              return <Wall key={`${i}-${j}`} position={[i, 0, j]} args={wallSize} color='#ff0000' />
            }
            return null
          }
        )))
      }
    </>
  );
}