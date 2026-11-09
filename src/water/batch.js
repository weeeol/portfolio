export const writeQuad = (
  buffer,
  offset,
  x0, y0, u0, v0,
  x1, y1, u1, v1,
  x2, y2, u2, v2,
  x3, y3, u3, v3,
  alpha,
  isShadow
) => {
  // Triangle 1: 0, 1, 2
  buffer[offset] = x0;
  buffer[offset + 1] = y0;
  buffer[offset + 2] = u0;
  buffer[offset + 3] = v0;
  buffer[offset + 4] = alpha;
  buffer[offset + 5] = isShadow;

  buffer[offset + 6] = x1;
  buffer[offset + 7] = y1;
  buffer[offset + 8] = u1;
  buffer[offset + 9] = v1;
  buffer[offset + 10] = alpha;
  buffer[offset + 11] = isShadow;

  buffer[offset + 12] = x2;
  buffer[offset + 13] = y2;
  buffer[offset + 14] = u2;
  buffer[offset + 15] = v2;
  buffer[offset + 16] = alpha;
  buffer[offset + 17] = isShadow;

  // Triangle 2: 2, 1, 3
  buffer[offset + 18] = x2;
  buffer[offset + 19] = y2;
  buffer[offset + 20] = u2;
  buffer[offset + 21] = v2;
  buffer[offset + 22] = alpha;
  buffer[offset + 23] = isShadow;

  buffer[offset + 24] = x1;
  buffer[offset + 25] = y1;
  buffer[offset + 26] = u1;
  buffer[offset + 27] = v1;
  buffer[offset + 28] = alpha;
  buffer[offset + 29] = isShadow;

  buffer[offset + 30] = x3;
  buffer[offset + 31] = y3;
  buffer[offset + 32] = u3;
  buffer[offset + 33] = v3;
  buffer[offset + 34] = alpha;
  buffer[offset + 35] = isShadow;
};

export const pushRotatedQuad = (
  buffer,
  offset,
  cx, cy,
  w, h,
  angle,
  flipX,
  yOffset,
  u0, v0, u1, v1,
  alpha,
  isShadow
) => {
  const halfW = w * 0.5;
  const halfH = h * 0.5;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const calcX = (lx, ly) => {
    const rx = lx * cos - ly * sin;
    return cx + (flipX ? -rx : rx);
  };
  const calcY = (lx, ly) => {
    const ry = lx * sin + ly * cos;
    return cy + ry + yOffset;
  };

  const x0 = calcX(-halfW, -halfH);
  const y0 = calcY(-halfW, -halfH);

  const x1 = calcX(halfW, -halfH);
  const y1 = calcY(halfW, -halfH);

  const x2 = calcX(-halfW, halfH);
  const y2 = calcY(-halfW, halfH);

  const x3 = calcX(halfW, halfH);
  const y3 = calcY(halfW, halfH);

  writeQuad(
    buffer, offset,
    x0, y0, u0, v0,
    x1, y1, u1, v0,
    x2, y2, u0, v1,
    x3, y3, u1, v1,
    alpha, isShadow
  );
};

export const pushAABBQuad = (
  buffer,
  offset,
  x0, y0,
  size,
  alpha
) => {
  const x1 = x0 + size;
  const y1 = y0 + size;

  writeQuad(
    buffer, offset,
    x0, y0, 0, 0,
    x1, y0, 1, 0,
    x0, y1, 0, 1,
    x1, y1, 1, 1,
    alpha, 0.0
  );
};

