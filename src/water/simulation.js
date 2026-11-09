export const updateWaterSimulation = ({
  current,
  previous,
  cols,
  rows,
  time,
  sinTable,
  stretchTable,
  pixelData32,
  waterColors32,
}) => {
  pixelData32.fill(waterColors32[2]);

  for (let row = 1; row < rows - 1; row++) {
    const rowOffset = row * cols;
    const previousRow = rowOffset - cols;
    const nextRow = rowOffset + cols;
    const phase = row * 0.12 + time * 1.5;
    const dashPhase = Math.sin(row * 0.1) * 2;
    const caustic = Math.sin(row * 0.3 + time * 0.7);
    const causticPhase = -time * 1.1 + row * 0.08;

    for (let column = 1; column < cols - 1; column++) {
      const index = column + rowOffset;
      current[index] = (
        previous[column - 1 + rowOffset] +
        previous[column + 1 + rowOffset] +
        previous[column + previousRow] +
        previous[column + nextRow]
      ) * 0.5 - current[index];
      current[index] *= 0.94;

      const value = current[index];
      let colorIndex = 2;
      let stretch = 1;
      const lineNoise = Math.sin(phase + sinTable[column]);
      const dashBreak = Math.sin(column * 0.15 + dashPhase);
      const causticValue = Math.sin(column * 0.18 + causticPhase) * caustic;

      if (lineNoise > 0.995 && dashBreak > 0.3) {
        colorIndex = 1;
        stretch = 2 + stretchTable[column];
      }
      if (causticValue > 0.97 && lineNoise > 0.72 && dashBreak > 0.1) {
        colorIndex = 1;
        stretch = 1;
      }
      if (value > 2 || value < -2) {
        if (value > 20) colorIndex = 0;
        else if (value > 5) colorIndex = 1;
        else if (value < -10) colorIndex = 4;
        else if (value < -4) colorIndex = 3;
      }

      if (colorIndex !== 2) {
        const color = waterColors32[colorIndex];
        for (let offset = 0; offset < stretch && column + offset < cols; offset++) {
          pixelData32[column + offset + rowOffset] = color;
        }
        if (stretch > 1) column += stretch - 1;
      }
    }
  }

  return { current: previous, previous: current };
};
