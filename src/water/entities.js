export const createFishes = (count, width, height) => Array.from({ length: count }, () => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * 0.8,
  vy: 0,
  z: 0,
  vz: 0,
  isJumping: false,
  phase: Math.random() * Math.PI * 2,
}));

export const createFoam = () => [];

export const spawnFoam = (foam, x, y, count = 5, burst = 1) => {
  for (let i = 0; i < count; i++) {
    foam.push({
      x: x + (Math.random() - 0.5) * 18,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 1.8 * burst,
      vy: -Math.random() * 1.8 * burst,
      size: 2 + Math.random() * 4,
      life: 0.45 + Math.random() * 0.45,
    });
  }
};

export const createBoatInfo = () => ({
  x: -100,
  y: 0,
  vx: 0,
  vy: 0,
  active: false,
  timeUntilNext: 200,
});

export const applyRipple = (previous, cols, rows, scale, yScale, clientX, clientY, strength, size) => {
  const cx = Math.floor(clientX / scale);
  const cy = Math.floor(clientY / (scale * yScale));
  const getIndex = (x, y) => x + y * cols;

  for (let x = -size; x <= size; x++) {
    for (let y = -size; y <= size; y++) {
      const nx = cx + x;
      const ny = cy + y;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
        previous[getIndex(nx, ny)] += strength;
      }
    }
  }
};

export const applyWaveLine = (previous, cols, rows, scale, yScale, screenY, strength, thickness = 1) => {
  const centerRow = Math.floor(screenY / (scale * yScale));
  const getIndex = (x, y) => x + y * cols;

  for (let y = -thickness; y <= thickness; y++) {
    const row = centerRow + y;
    if (row <= 0 || row >= rows - 1) continue;
    for (let x = 1; x < cols - 1; x++) {
      previous[getIndex(x, row)] += strength;
    }
  }
};
