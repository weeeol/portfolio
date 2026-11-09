export const updateBoat = ({
  boatInfo,
  boatShadowMesh,
  boatHullMesh,
  boatShadowMaterial,
  width,
  height,
  scale,
  yScale,
  current,
  cols,
  rows,
  time,
  applyRipple,
  spawnFoam,
}) => {
  if (!boatInfo.active) {
    boatInfo.timeUntilNext--;
    if (boatInfo.timeUntilNext <= 0) {
      boatInfo.active = true;
      boatInfo.y = 120 + Math.random() * (height - 240);
      boatInfo.vx = 1.3 + Math.random() * 0.7;
      boatInfo.vy = 0;
      boatInfo.pitch = 0;
      boatInfo.heave = 0;
      if (Math.random() > 0.5) {
        boatInfo.x = width + 100;
        boatInfo.vx = -boatInfo.vx;
      } else {
        boatInfo.x = -100;
      }
      spawnFoam(boatInfo.x, boatInfo.y, 3, 0.4);
    }
    boatShadowMesh.visible = false;
    boatHullMesh.visible = false;
    return;
  }

  boatInfo.x += boatInfo.vx;
  const isFacingLeft = boatInfo.vx < 0;
  const direction = isFacingLeft ? -1 : 1;
  const sampleWaveHeight = (x, y) => {
    const column = Math.floor(x / scale);
    const row = Math.floor(y / (scale * yScale));
    if (column <= 1 || column >= cols - 2 || row <= 1 || row >= rows - 2) return 0;
    const index = column + row * cols;
    const average = (
      current[index] +
      current[index - 1] +
      current[index + 1] +
      current[index - cols] +
      current[index + cols]
    ) * 0.2;
    return Math.max(-15, Math.min(15, average * 0.08));
  };

  const waveCenter = sampleWaveHeight(boatInfo.x, boatInfo.y);
  const targetHeave = waveCenter +
    Math.sin(time * 2.8 + boatInfo.x * 0.018) * 3.5 +
    Math.cos(time * 1.8) * 1.2;
  const wavePitch = (
    sampleWaveHeight(boatInfo.x - direction * 24, boatInfo.y) -
    sampleWaveHeight(boatInfo.x + direction * 24, boatInfo.y)
  ) * 0.025;
  const targetPitch = Math.max(
    -0.075,
    Math.min(0.075, wavePitch + Math.sin(time * 3 + boatInfo.x * 0.02) * 0.045)
  );

  boatInfo.heave += (targetHeave - boatInfo.heave) * 0.12;
  boatInfo.pitch += (targetPitch - boatInfo.pitch) * 0.08;
  applyRipple(boatInfo.x - direction * 32, boatInfo.y, 200, 0);
  if (Math.random() < 0.08) spawnFoam(boatInfo.x - direction * 25, boatInfo.y, 1, 0.3);

  if (boatInfo.x > width + 200 || boatInfo.x < -200) {
    boatInfo.active = false;
    boatInfo.timeUntilNext = 60 + Math.random() * 90;
  }

  boatShadowMesh.visible = true;
  boatShadowMesh.position.set(boatInfo.x, boatInfo.y + 10, 1.5);
  boatShadowMesh.rotation.set(0, 0, 0);
  boatShadowMesh.scale.set(isFacingLeft ? -1 : 1, 1, 1);
  boatShadowMaterial.opacity = Math.max(0.18, Math.min(0.42, 0.35 * (1 - boatInfo.heave * 0.04)));

  boatHullMesh.visible = true;
  boatHullMesh.position.set(boatInfo.x, boatInfo.y - boatInfo.heave, 3);
  boatHullMesh.rotation.set(0, 0, isFacingLeft ? -boatInfo.pitch : boatInfo.pitch);
  boatHullMesh.scale.set(isFacingLeft ? -1 : 1, 1, 1);
};
