export type Player = {
  x: number,
  z: number,
  angle: number,
  health: number,
  score?: number,
  moving: boolean,
  firing?: boolean,
}

const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getStartingPosition = (map: number[][]) => {
  const zeroIndices: [number, number][] = [];
  map.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === 0) {
        zeroIndices.push([colIndex, rowIndex]);
      }
    });
  });
  const randomIndex = rand(0, zeroIndices.length - 1);
  const [z, x] = zeroIndices[randomIndex];

  return [x, z]
};

export const initializePlayer = (map: number[][]): Player => {
  const [x, z] = getStartingPosition(map);

  return {
    x: x,
    z: z,
    angle: Math.PI,
    health: 100,
    moving: false,
  };
}