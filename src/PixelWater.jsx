import React, { useEffect, useRef } from 'react';
import fishImgSrc from './assets/Salmon.png';
import boatImgSrc from './assets/Boat1.png';

// Custom 3x3 Matrix Math helper to handle 2D sprite transforms in WebGL
const m3 = {
  projection: (width, height) => [
    2 / width, 0, 0,
    0, -2 / height, 0,
    -1, 1, 1
  ],
  multiply: (a, b) => {
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    const a20 = a[6], a21 = a[7], a22 = a[8];
    const b00 = b[0], b01 = b[1], b02 = b[2];
    const b10 = b[3], b11 = b[4], b12 = b[5];
    const b20 = b[6], b21 = b[7], b22 = b[8];
    return [
      b00 * a00 + b01 * a10 + b02 * a20, b00 * a01 + b01 * a11 + b02 * a21, b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20, b10 * a01 + b11 * a11 + b12 * a21, b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20, b20 * a01 + b21 * a11 + b22 * a21, b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
  translate: (m, tx, ty) => m3.multiply(m, [1, 0, 0, 0, 1, 0, tx, ty, 1]),
  rotate: (m, angleInRadians) => {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    return m3.multiply(m, [c, -s, 0, s, c, 0, 0, 0, 1]);
  },
  scale: (m, sx, sy) => m3.multiply(m, [sx, 0, 0, 0, sy, 0, 0, 0, 1]),
};

const PixelWater = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
      console.error('WebGL is not supported in your browser.');
      return;
    }

    // --- Shader Setup ---
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      uniform mat3 u_matrix;
      void main() {
        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform float u_alpha;
      uniform bool u_isShadow;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        if (u_isShadow) {
           gl_FragColor = vec4(0.0, 0.0, 0.0, color.a * u_alpha);
        } else {
           gl_FragColor = vec4(color.rgb, color.a * u_alpha);
        }
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    // Get Locations
    const positionLoc = gl.getAttribLocation(program, "a_position");
    const texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    const matrixLoc = gl.getUniformLocation(program, "u_matrix");
    const imageLoc = gl.getUniformLocation(program, "u_image");
    const alphaLoc = gl.getUniformLocation(program, "u_alpha");
    const isShadowLoc = gl.getUniformLocation(program, "u_isShadow");

    // Setup Unit Quad Buffers (0 to 1)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]), gl.STATIC_DRAW);

    // Alpha Blending for Fishes
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // --- Config & State ---
    const scale = window.innerWidth < 768 ? 3 : 5;
    const yScale = 0.5;
    let width, height, cols, rows;
    let current, previous, pixelData, basePixelData;
    let dampening = 0.94;
    let isMounted = true;

    const waterColors = [
      [255, 255, 255], // 0: sparkling sun reflection (white)
      [28, 163, 236],  // 1: lightest blue (crest)
      [14, 116, 175],  // 2: base water
      [7, 93, 145],    // 3: dark water (trough)
      [0, 69, 114]     // 4: darkest depth
    ];

    // --- Textures ---
    const waterTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, waterTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

   const fishTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fishTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0])); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const fishImg = new Image();
    fishImg.src = fishImgSrc;
    fishImg.onload = () => {
      if (!isMounted) return; 

      gl.bindTexture(gl.TEXTURE_2D, fishTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fishImg);
    };

    const boatTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boatTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0])); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const boatImg = new Image();
    boatImg.src = boatImgSrc;
    boatImg.onload = () => {
      if (!isMounted) return; 

      gl.bindTexture(gl.TEXTURE_2D, boatTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, boatImg);
    };

    // --- Core Logic ---
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);

      cols = Math.ceil(width / scale);
      rows = Math.ceil(height / (scale * yScale));

      current = new Float32Array(cols * rows).fill(0);
      previous = new Float32Array(cols * rows).fill(0);

      pixelData = new Uint8Array(cols * rows * 4);
      basePixelData = new Uint8Array(cols * rows * 4);
      
      for(let k = 0; k < cols * rows; k++) {
        const idx = k * 4;
        basePixelData[idx] = waterColors[2][0];
        basePixelData[idx+1] = waterColors[2][1];
        basePixelData[idx+2] = waterColors[2][2];
        basePixelData[idx+3] = 255;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    let animationFrame;
    const getIndex = (x, y) => x + y * cols;
    
    const fishes = Array.from({ length: 8 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0,
      z: 0,
      vz: 0,
      isJumping: false,
    }));

    const boatInfo = {
      x: -100,
      y: 0,
      vx: 0,
      vy: 0,
      active: false,
      timeUntilNext: 200 // initial delay
    };

    const applyRipple = (clientX, clientY, strength, size) => {
      const cx = Math.floor(clientX / scale);
      const cy = Math.floor(clientY / (scale * yScale));

      for(let x = -size; x <= size; x++) {
        for(let y = -size; y <= size; y++) {
          const nx = cx + x;
          const ny = cy + y;
          if(nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
              previous[getIndex(nx, ny)] += strength; 
          }
        }
      }
    };

    let lastFrameTime = 0;
    const fpsLimit = 50;
    const frameDuration = 1000 / fpsLimit;

    const draw = (timestamp) => {
      animationFrame = requestAnimationFrame(draw);

      if (timestamp - lastFrameTime < frameDuration) return;
      lastFrameTime = timestamp;

      const time = Date.now() * 0.001;
      pixelData.set(basePixelData);

      for (let j = 1; j < rows - 1; j++) {
        const j_cols = j * cols;
        const jMinus1_cols = j_cols - cols;
        const jPlus1_cols = j_cols + cols;
        
        const jPhaseBase = j * 0.12 + time * 1.5;
        const jDashBreak = Math.sin(j * 0.1) * 2;

        for (let i = 1; i < cols - 1; i++) {
          const idx = i + j_cols;
          
          current[idx] = (
            previous[i - 1 + j_cols] +
            previous[i + 1 + j_cols] +
            previous[i + jMinus1_cols] +
            previous[i + jPlus1_cols]
          ) / 2 - current[idx];

          current[idx] *= dampening;

          let val = current[idx];
          let colorIndex = 2;
          let stretch = 1;

          const wavePhase = jPhaseBase + Math.sin(i * 0.015) * 1.2;
          const lineNoise = Math.sin(wavePhase);
          const dashBreak = Math.sin(i * 0.15 + jDashBreak);
          
          if (lineNoise > 0.995 && dashBreak > 0.3) { 
            colorIndex = 1; 
            stretch = 2 + Math.floor(Math.abs(Math.cos(i * 0.2)) * 3); 
          }

          if (val > 2 || val < -2) {
            if (val > 20) { colorIndex = 0; stretch = 1; }
            else if (val > 5) { colorIndex = 1; stretch = 1; }
            else if (val < -10) { colorIndex = 4; stretch = 1; }
            else if (val < -4) { colorIndex = 3; stretch = 1; }
          }

          if (colorIndex !== 2) {
            const c = waterColors[colorIndex];
            for (let s = 0; s < stretch; s++) {
              const sx = i + s;
              if (sx >= cols) break;
              const pIdx = (sx + j * cols) * 4;
              pixelData[pIdx] = c[0];
              pixelData[pIdx+1] = c[1];
              pixelData[pIdx+2] = c[2];
            }
            if (stretch > 1) i += stretch - 1; 
          }
        }
      }

      const temp = previous;
      previous = current;
      current = temp;

      gl.clearColor(14/255, 116/255, 175/255, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enableVertexAttribArray(positionLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(texCoordLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindTexture(gl.TEXTURE_2D, waterTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);

      let waterMatrix = m3.projection(width, height);
      waterMatrix = m3.scale(waterMatrix, cols * scale, rows * scale * yScale);
      
      gl.uniformMatrix3fv(matrixLoc, false, waterMatrix);
      gl.uniform1f(alphaLoc, 1.0);
      gl.uniform1i(isShadowLoc, 0);
      gl.uniform1i(imageLoc, 0); 
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (fishImg.complete && fishImg.naturalWidth > 0) {
        gl.bindTexture(gl.TEXTURE_2D, fishTexture);

        fishes.forEach(fish => {
          if (fish.isJumping) {
             fish.z += fish.vz;
             fish.vz -= 0.6; 
             fish.x += fish.vx * 1.5; 
             fish.y += fish.vy * 1.5;
             
             if (fish.z <= 0) {
               fish.z = 0;
               fish.isJumping = false;
               applyRipple(fish.x, fish.y, 900, 1);
             }
          } else {
             fish.x += fish.vx;
             fish.y += fish.vy;
             
             if (Math.random() < 0.0005) { 
                fish.isJumping = true;
                fish.vz = 6 + Math.random() * 6;
                applyRipple(fish.x, fish.y, -400, 0); 
             }
             
             if (Math.random() < 0.05) {
                fish.vx += (Math.random() - 0.5) * 0.4;
                const speed = Math.abs(fish.vx);
                if (speed > 1.2) {
                  fish.vx = (fish.vx / speed) * 1.2;
                }
             }
          }

          if (fish.x < -50) fish.x = width + 50;
          if (fish.x > width + 50) fish.x = -50;
          if (fish.y < -50) fish.y = height + 50;
          if (fish.y > height + 50) fish.y = -50;

          const isFacingLeft = fish.vx < 0;
          const fw = 48; 
          const fh = 48;
          let matrix;

          if (fish.isJumping) {
             matrix = m3.projection(width, height);
             matrix = m3.translate(matrix, Math.floor(fish.x), Math.floor(fish.y));
             if (isFacingLeft) matrix = m3.scale(matrix, -1, 1); 
             matrix = m3.translate(matrix, -fw/2, -fh/2);
             matrix = m3.scale(matrix, fw, fh);

             gl.uniformMatrix3fv(matrixLoc, false, matrix);
             gl.uniform1f(alphaLoc, 0.15);
             gl.uniform1i(isShadowLoc, 1);
             gl.drawArrays(gl.TRIANGLES, 0, 6);
             
             const imgOffset = Math.PI / 2; // Assuming Salmon.png points UP
             const jumpAngle = Math.atan2(-fish.vz, Math.abs(fish.vx) * 2) + imgOffset;
             matrix = m3.projection(width, height);
             matrix = m3.translate(matrix, Math.floor(fish.x), Math.floor(fish.y));
             if (isFacingLeft) matrix = m3.scale(matrix, -1, 1);
             matrix = m3.translate(matrix, 0, -fish.z);
             matrix = m3.rotate(matrix, jumpAngle);
             matrix = m3.translate(matrix, -fw/2, -fh/2);
             matrix = m3.scale(matrix, fw, fh);

             gl.uniformMatrix3fv(matrixLoc, false, matrix);
             gl.uniform1f(alphaLoc, 1.0);
             gl.uniform1i(isShadowLoc, 0);
             gl.drawArrays(gl.TRIANGLES, 0, 6);
          } else {
             const wiggle = Math.sin(time * 5 + fish.x * 0.05) * 0.1;
             // Add Math.PI / 2 if the image points UP by default, or just use wiggle if we want it strictly horizontal
             const imgOffset = Math.PI / 2; // Assuming Salmon.png points UP
             const angle = (Math.atan2(fish.vy, Math.abs(fish.vx)) * 0.5) + wiggle + imgOffset;

             matrix = m3.projection(width, height);
             matrix = m3.translate(matrix, Math.floor(fish.x), Math.floor(fish.y));
             if (isFacingLeft) matrix = m3.scale(matrix, -1, 1);
             matrix = m3.rotate(matrix, angle);
             matrix = m3.translate(matrix, -fw/2, -fh/2);
             matrix = m3.scale(matrix, fw, fh);

             gl.uniformMatrix3fv(matrixLoc, false, matrix);
             gl.uniform1f(alphaLoc, 0.2);
             gl.uniform1i(isShadowLoc, 1); 
             gl.drawArrays(gl.TRIANGLES, 0, 6);
          }
        });
      }

      if (boatImg.complete && boatImg.naturalWidth > 0) {
        gl.bindTexture(gl.TEXTURE_2D, boatTexture);

        if (!boatInfo.active) {
           boatInfo.timeUntilNext--;
           if (boatInfo.timeUntilNext <= 0) {
              boatInfo.active = true;
              boatInfo.y = 100 + Math.random() * (height - 200);
              boatInfo.vx = 1.5 + Math.random() * 1.5;
              boatInfo.vy = (Math.random() - 0.5) * 0.8;
              if (Math.random() > 0.5) {
                 boatInfo.x = width + 100;
                 boatInfo.vx = -boatInfo.vx;
              } else {
                 boatInfo.x = -100;
              }
           }
        } else {
           boatInfo.x += boatInfo.vx;
           boatInfo.y += boatInfo.vy;
           
           // Apply a constant ripple at the boat's center.
           // The simulation automatically propagates this outwards locally creating a V-shaped wake!
           applyRipple(boatInfo.x - (boatInfo.vx * 15), boatInfo.y, 400, 0);
           applyRipple(boatInfo.x, boatInfo.y, 150, 0);

           if (boatInfo.x > width + 200 || boatInfo.x < -200 || boatInfo.y < -200 || boatInfo.y > height + 200) {
              boatInfo.active = false;
              boatInfo.timeUntilNext = 300 + Math.random() * 600; 
           }

           const isFacingLeft = boatInfo.vx < 0;
           // Maintain original aspect ratio and scale it to a reasonable size
           const targetWidth = 80;
           const aspectRatio = boatImg.naturalHeight / boatImg.naturalWidth;
           const bw = targetWidth; 
           const bh = targetWidth * aspectRatio;
           const angle = Math.atan2(boatInfo.vy, Math.abs(boatInfo.vx));

           // Draw Boat Shadow
           let matrix = m3.projection(width, height);
           matrix = m3.translate(matrix, Math.floor(boatInfo.x), Math.floor(boatInfo.y) + 10);
           if (isFacingLeft) matrix = m3.scale(matrix, -1, 1);
           matrix = m3.rotate(matrix, angle);
           matrix = m3.translate(matrix, -bw/2, -bh/2);
           matrix = m3.scale(matrix, bw, bh);

           gl.uniformMatrix3fv(matrixLoc, false, matrix);
           gl.uniform1f(alphaLoc, 0.3);
           gl.uniform1i(isShadowLoc, 1); 
           gl.drawArrays(gl.TRIANGLES, 0, 6);

           // Draw Boat
           matrix = m3.projection(width, height);
           matrix = m3.translate(matrix, Math.floor(boatInfo.x), Math.floor(boatInfo.y));
           if (isFacingLeft) matrix = m3.scale(matrix, -1, 1);
           matrix = m3.rotate(matrix, angle);
           matrix = m3.translate(matrix, -bw/2, -bh/2);
           matrix = m3.scale(matrix, bw, bh);

           gl.uniformMatrix3fv(matrixLoc, false, matrix);
           gl.uniform1f(alphaLoc, 1.0);
           gl.uniform1i(isShadowLoc, 0); 
           gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }
    };

    animationFrame = requestAnimationFrame(draw);

    // --- Interactive Listeners ---
    const handlePointerMove = (e) => {
      applyRipple(e.clientX, e.clientY, 150, 0); 
    };

    const handlePointerDown = (e) => {
      applyRipple(e.clientX, e.clientY, 2000, 1); 
    };

    // Custom Event Listener from React UI to trigger physics splashes
    const handleCustomSplash = (e) => {
      const { x, y, strength, size } = e.detail;
      applyRipple(x, y, strength, size);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('trigger-splash', handleCustomSplash);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('trigger-splash', handleCustomSplash);
      cancelAnimationFrame(animationFrame);
      isMounted = false; 
      fishImg.onload = null;
      boatImg.onload = null;
      
      gl.deleteTexture(waterTexture);
      gl.deleteTexture(fishTexture);
      gl.deleteTexture(boatTexture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-[#0e74af]"
    />
  );
};

export default PixelWater;