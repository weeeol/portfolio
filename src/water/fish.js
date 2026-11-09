export const renderFish = (fish, fishMeshPair, time) => {
  const { shadowMesh, hullMesh, shadowMaterial } = fishMeshPair;
  const isFacingLeft = fish.vx < 0;
  const imgOffset = Math.PI / 2;

  if (fish.isJumping) {
    const jumpAngle = Math.atan2(-fish.vz, Math.abs(fish.vx) * 2) + imgOffset;

    shadowMesh.visible = true;
    shadowMesh.position.set(Math.floor(fish.x), Math.floor(fish.y), 1);
    shadowMesh.rotation.z = isFacingLeft ? -jumpAngle : jumpAngle;
    shadowMesh.scale.set(isFacingLeft ? -1 : 1, 1, 1);
    shadowMaterial.opacity = Math.max(0.05, 0.2 * (1 - fish.z / 60));

    hullMesh.visible = true;
    hullMesh.position.set(Math.floor(fish.x), Math.floor(fish.y - fish.z), 5 + fish.z * 0.05);
    hullMesh.rotation.z = isFacingLeft ? -jumpAngle : jumpAngle;
    hullMesh.scale.set(isFacingLeft ? -1 : 1, 1, 1);
    return;
  }

  const wiggle = Math.sin(time * 5 + fish.x * 0.05 + fish.phase) * 0.1;
  const angle = (Math.atan2(fish.vy, Math.abs(fish.vx)) * 0.5) + wiggle + imgOffset;
  shadowMesh.visible = true;
  shadowMesh.position.set(Math.floor(fish.x), Math.floor(fish.y), 1);
  shadowMesh.rotation.z = isFacingLeft ? -angle : angle;
  shadowMesh.scale.set(isFacingLeft ? -1 : 1, 1, 1);
  shadowMaterial.opacity = 0.2;
  hullMesh.visible = false;
};
