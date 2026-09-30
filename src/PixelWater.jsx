import { useEffect, useRef } from 'react';
import fishImgSrc from './assets/Salmon.png';
import boatImgSrc from './assets/Boat1.png';
import m3 from './water/matrix';
import { compileShader, fragmentShaderSource, vertexShaderSource } from './water/shaders';
import { quadVertices, waterColors } from './water/constants';
import {
  applyRipple as applyRippleToBuffer,
  applyWaveLine as applyWaveLineToBuffer,
  createBoatInfo,
  createFoam,
  createFishes,
  spawnFoam as spawnFoamInState,
} from './water/entities';

const PixelWater = ({ isPaused = false }) => {
  const canvasRef = useRef(null);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
      console.error('WebGL is not supported in your browser.');
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Get Locations
    const positionLoc = gl.getAttribLocation(program, "a_position");
    const texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    const matrixLoc = gl.getUniformLocation(program, "u_matrix");
    const imageLoc = gl.getUniformLocation(program, "u_image");
    const alphaLoc = gl.getUniformLocation(program, "u_alpha");
    const isShadowLoc = gl.getUniformLocation(program, "u_isShadow");
    const tintLoc = gl.getUniformLocation(program, "u_tint");

    // Setup Unit Quad Buffers (0 to 1)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    // Alpha Blending for Fishes
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // --- Config & State ---
    const getPixelScale = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const baseScale = window.innerWidth < 768 ? 3 : 5;
      return Math.max(2, Math.round(baseScale * dpr));
    };
    let scale = getPixelScale();
    let renderDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const yScale = 0.5;
    let width, height, cols, rows;
    let current, previous, pixelData, basePixelData;
    let dampening = 0.94;
    let isMounted = true;
    let isDocumentActive = !document.hidden;
    let lastScrollPosition = 0;
    let scrollAccumulator = 0;

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

    const foamTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, foamTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // --- Core Logic ---
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      scale = getPixelScale();
      renderDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * renderDpr);
      canvas.height = Math.floor(height * renderDpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

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
    
    const fishes = createFishes(8, window.innerWidth, window.innerHeight);
    const foam = createFoam();
    const boatInfo = createBoatInfo();
    const applyRipple = (x, y, strength, size) => applyRippleToBuffer(previous, cols, rows, scale, yScale, x, y, strength, size);
    const applyWaveLine = (screenY, strength, thickness = 1) => applyWaveLineToBuffer(previous, cols, rows, scale, yScale, screenY, strength, thickness);
    const spawnFoam = (x, y, count = 5, burst = 1) => spawnFoamInState(foam, x, y, count, burst);

    let lastFrameTime = 0;
    const fpsLimit = 50;
    const frameDuration = 1000 / fpsLimit;

    const draw = (timestamp) => {
      animationFrame = requestAnimationFrame(draw);

      if (isPausedRef.current) return; // Skip updating physics/drawing when paused
      if (timestamp - lastFrameTime < frameDuration) return;
      lastFrameTime = timestamp;

      const time = timestamp * 0.001;
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
          const caustic = Math.sin(i * 0.18 - time * 1.1 + j * 0.08) * Math.sin(j * 0.3 + time * 0.7);
          
          if (lineNoise > 0.995 && dashBreak > 0.3) { 
            colorIndex = 1; 
            stretch = 2 + Math.floor(Math.abs(Math.cos(i * 0.2)) * 3); 
          }

          if (caustic > 0.97 && lineNoise > 0.72 && dashBreak > 0.1) {
            colorIndex = 1;
            stretch = 1;
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
      gl.uniform4f(tintLoc, 1, 1, 1, 1);
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
             let nearbyX = 0;
             let nearbyY = 0;
             let nearbyCount = 0;
             fishes.forEach(other => {
               if (other === fish) return;
               const distance = Math.hypot(other.x - fish.x, other.y - fish.y);
               if (distance < 180) {
                 nearbyX += other.x;
                 nearbyY += other.y;
                 nearbyCount++;
               }
             });
             if (nearbyCount) {
               fish.vx += ((nearbyX / nearbyCount - fish.x) * 0.0003);
               fish.vy += ((nearbyY / nearbyCount - fish.y) * 0.0003);
             }
             fish.phase += 0.06;
             fish.vy += Math.sin(fish.phase) * 0.006;
             fish.vx = Math.max(-0.7, Math.min(0.7, fish.vx));
             fish.vy = Math.max(-0.35, Math.min(0.35, fish.vy));
             fish.x += fish.vx;
             fish.y += fish.vy;
             
             if (Math.random() < 0.0005) { 
                fish.isJumping = true;
                fish.vz = 6 + Math.random() * 6;
                applyRipple(fish.x, fish.y, -400, 0); 
                 spawnFoam(fish.x, fish.y, 3, 0.8);
             }
             
             if (Math.random() < 0.05) {
                fish.vx += (Math.random() - 0.5) * 0.15;
                const speed = Math.abs(fish.vx);
                if (speed > 0.7) {
                  fish.vx = (fish.vx / speed) * 0.7;
                }
             }
          }

          if (fish.x < -50) fish.x = width + 50;
          if (fish.x > width + 50) fish.x = -50;
          if (!fish.isJumping) {
            if (fish.y < 50) {
              fish.y = 50;
              fish.vy = Math.abs(fish.vy) * 0.5;
            }
            if (fish.y > height - 50) {
              fish.y = height - 50;
              fish.vy = -Math.abs(fish.vy) * 0.5;
            }
          }

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
             const wiggle = Math.sin(time * 5 + fish.x * 0.05 + fish.phase) * 0.1;
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
              spawnFoam(boatInfo.x, boatInfo.y, 4, 0.5);
           }
        } else {
           boatInfo.x += boatInfo.vx;
           boatInfo.y += boatInfo.vy;
           
           // Apply a constant ripple at the boat's center.
           // The simulation automatically propagates this outwards locally creating a V-shaped wake!
           applyRipple(boatInfo.x - (boatInfo.vx * 15), boatInfo.y, 400, 0);
           applyRipple(boatInfo.x, boatInfo.y, 150, 0);
           if (Math.random() < 0.08) spawnFoam(boatInfo.x - boatInfo.vx * 12, boatInfo.y, 1, 0.4);

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
           gl.uniform4f(tintLoc, 1, 1, 1, 1);
           gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }

      gl.bindTexture(gl.TEXTURE_2D, foamTexture);
      gl.uniform1i(isShadowLoc, 0);
      gl.uniform4f(tintLoc, 0.78, 0.96, 1, 1);
      for (let index = foam.length - 1; index >= 0; index--) {
        const drop = foam[index];
        drop.life -= 0.018;
        drop.x += drop.vx;
        drop.y += drop.vy;
        drop.vy += 0.045;
        if (drop.life <= 0) {
          foam.splice(index, 1);
          continue;
        }
        let matrix = m3.projection(width, height);
        matrix = m3.translate(matrix, Math.floor(drop.x), Math.floor(drop.y));
        matrix = m3.scale(matrix, Math.ceil(drop.size), Math.ceil(drop.size));
        gl.uniformMatrix3fv(matrixLoc, false, matrix);
        gl.uniform1f(alphaLoc, Math.min(1, drop.life * 2));
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      gl.uniform4f(tintLoc, 1, 1, 1, 1);
    };

    const wakeAnimation = () => {
      if (!animationFrame && isDocumentActive && isMounted) animationFrame = requestAnimationFrame(draw);
    };
    const setDocumentActive = (active) => {
      isDocumentActive = active;
      if (active) {
        lastFrameTime = 0;
        wakeAnimation();
      } else if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };
    const handleVisibilityChange = () => setDocumentActive(!document.hidden);
    const handleWindowBlur = () => setDocumentActive(false);
    const handleWindowFocus = () => setDocumentActive(true);

    animationFrame = requestAnimationFrame(draw);

    let lastPointer = null;

    // --- Interactive Listeners ---
    const handlePointerMove = (e) => {
      if (isPausedRef.current || !isDocumentActive) return;
      
      const x = e.clientX;
      const y = e.clientY;
      const isTouch = e.pointerType === 'touch';
      const rippleStrength = isTouch ? 90 : 150;
      
      if (lastPointer) {
        const dx = x - lastPointer.x;
        const dy = y - lastPointer.y;
        const dist = Math.hypot(dx, dy);
        
        // Prevent huge lines if mouse leaves and re-enters window far away
        if (dist < 300) {
          const steps = Math.max(1, Math.floor(dist / 5));
          for (let i = 1; i <= steps; i++) {
            applyRipple(lastPointer.x + dx * (i / steps), lastPointer.y + dy * (i / steps), rippleStrength, 0);
          }
        } else {
          applyRipple(x, y, rippleStrength, 0);
        }
      } else {
        applyRipple(x, y, rippleStrength, 0); 
      }
      
      lastPointer = { x, y };
    };

    const handleScroll = (e) => {
      if (isPausedRef.current || !isDocumentActive) return;
      const scrollTarget = e.target === document ? document.documentElement : e.target;
      const position = scrollTarget.scrollTop || window.scrollY || 0;
      const delta = position - lastScrollPosition;
      lastScrollPosition = position;
      scrollAccumulator += delta;
      if (Math.abs(scrollAccumulator) < 80) return;
      const strength = Math.min(32, Math.abs(scrollAccumulator) * 0.2);
      const direction = Math.sign(scrollAccumulator);
      const edgeY = direction > 0 ? height - 18 : 18;
      applyWaveLine(edgeY, strength * direction, 1);
      scrollAccumulator = 0;
    };

    const handlePointerLeave = () => {
      lastPointer = null;
    };

    const handlePointerDown = (e) => {
      if (isPausedRef.current) return;
      if (e.target instanceof Element && e.target.closest('[data-water-ignore]')) return;
      const cx = e.clientX;
      const cy = e.clientY;
      
      let hitSomething = false;

      // 1. Check if clicked on the boat
      if (boatInfo.active) {
        const dist = Math.hypot(boatInfo.x - cx, boatInfo.y - cy);
        if (dist < 60) {
          hitSomething = true;
          // Boat goes into overdrive and creates a massive splash
          boatInfo.vx *= 2.5;
          applyRipple(boatInfo.x, boatInfo.y, 5000, 2);
        }
      }

      // 2. Check if clicked on fishes
      if (!hitSomething) {
        for (const fish of fishes) {
          const dist = Math.hypot(fish.x - cx, fish.y - cy);
          // If clicked close to a fish that isn't already jumping
          if (dist < 40 && !fish.isJumping) {
            hitSomething = true;
            fish.isJumping = true;
            fish.vz = 8 + Math.random() * 5; // Launch into the air
            
            // Swim frantically away from the click
            fish.vx = (fish.x - cx) * 0.2;
            fish.vy = (fish.y - cy) * 0.2;
            
            applyRipple(fish.x, fish.y, 1500, 1);
            spawnFoam(fish.x, fish.y, 6, 1.2);
            break; // Stop checking after hitting one fish
          }
        }
      }

      // 3. Just a regular water ripple if nothing was hit
      if (!hitSomething) {
        applyRipple(cx, cy, 2000, 1);
        spawnFoam(cx, cy, e.pointerType === 'touch' ? 4 : 3, 0.8);
      }
    };

    // Custom Event Listener from React UI to trigger physics splashes
    const handleCustomSplash = (e) => {
      if (isPausedRef.current) return;
      const { x, y, strength, size } = e.detail;
      applyRipple(x, y, strength, size);
      spawnFoam(x, y, Math.min(12, 3 + size * 2), Math.min(1.5, Math.abs(strength) / 3000));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerup', handlePointerLeave);
    window.addEventListener('pointercancel', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('trigger-splash', handleCustomSplash);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerup', handlePointerLeave);
      window.removeEventListener('pointercancel', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('trigger-splash', handleCustomSplash);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('scroll', handleScroll, true);
      cancelAnimationFrame(animationFrame);
      isMounted = false; 
      fishImg.onload = null;
      boatImg.onload = null;
      
      gl.deleteTexture(waterTexture);
      gl.deleteTexture(fishTexture);
      gl.deleteTexture(boatTexture);
      gl.deleteTexture(foamTexture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Interactive WebGL pixel water background simulation"
      className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-[#0e74af]"
    />
  );
};

export default PixelWater;