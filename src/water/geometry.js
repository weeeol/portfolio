import * as THREE from 'three';

export const createWaterGeometry = (w, h) => {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array([
    0, 0, 0,
    w, 0, 0,
    0, h, 0,
    0, h, 0,
    w, 0, 0,
    w, h, 0,
  ]);
  const uvs = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
  ]);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geo;
};

export const createCenteredQuadGeometry = (w, h) => {
  const geo = new THREE.BufferGeometry();
  const hw = w * 0.5;
  const hh = h * 0.5;
  const positions = new Float32Array([
    -hw, -hh, 0,
    hw, -hh, 0,
    -hw, hh, 0,
    -hw, hh, 0,
    hw, -hh, 0,
    hw, hh, 0,
  ]);
  const uvs = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
  ]);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geo;
};
