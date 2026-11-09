const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const createCursorParallax = ({ getWidth, getHeight }) => {
  const state = {
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
  };

  return {
    updatePointer(clientX, clientY) {
      state.targetX = clamp((clientX / getWidth()) * 2 - 1, -1, 1);
      state.targetY = clamp((clientY / getHeight()) * 2 - 1, -1, 1);
    },

    reset() {
      state.targetX = 0;
      state.targetY = 0;
    },

    update() {
      state.x += (state.targetX - state.x) * 0.08;
      state.y += (state.targetY - state.y) * 0.08;
      return state;
    },
  };
};

export const applyParallaxLayers = (layers, x, y) => {
  const layerX = x * 14;
  const layerY = y * 9;
  layers.water.position.set(layerX * 0.2, layerY * 0.2, 0);
  layers.fish.position.set(layerX * 0.75, layerY * 0.75, 0);
  layers.fish.rotation.z = x * -0.006;
  layers.boat.position.set(layerX * 1.6, layerY * 1.6, 0);
  layers.boat.rotation.z = x * -0.012;
  layers.foam.position.set(layerX * 1.25, layerY * 1.25, 0);
};
