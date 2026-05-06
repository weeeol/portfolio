import React, { useEffect, useRef } from 'react';
import fishImgSrc from './assets/Salmon.png';

const PixelWater = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Config
    const scale = window.innerWidth < 768 ? 3 : 5; // Very small pixels for vast ocean
    const yScale = 0.5; // Oblique / isometric vertical squash factor
    let width, height;
    let cols, rows;

    let current = [];
    let previous = [];
    let dampening = 0.94; // slightly less dampening for continuous ocean feel

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      cols = Math.ceil(width / scale);
      rows = Math.ceil(height / (scale * yScale));

      current = new Float32Array(cols * rows).fill(0);
      previous = new Float32Array(cols * rows).fill(0);
    };

    window.addEventListener('resize', resize);
    resize();

    // The water colors including white for sun reflections
    const waterColors = [
      [255, 255, 255], // 0: sparkling sun reflection (white)
      [28, 163, 236],  // 1: lightest blue (crest)
      [14, 116, 175],  // 2: base water
      [7, 93, 145],    // 3: dark water (trough)
      [0, 69, 114]     // 4: darkest depth
    ];

    let animationFrame;
    
    const getIndex = (x, y) => x + y * cols;

    const fishImg = new Image();
    fishImg.src = fishImgSrc;
    
    // Pre-render a darkened silhouette to avoid using extremely slow ctx.filter
    const shadowCanvas = document.createElement('canvas');
    const shadowCtx = shadowCanvas.getContext('2d', { willReadFrequently: true });
    
    fishImg.onload = () => {
      shadowCanvas.width = fishImg.naturalWidth;
      shadowCanvas.height = fishImg.naturalHeight;
      shadowCtx.drawImage(fishImg, 0, 0);
      shadowCtx.globalCompositeOperation = 'source-in';
      shadowCtx.fillStyle = 'black';
      shadowCtx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    };
    
    const fishes = Array.from({ length: 8 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      z: 0,
      vz: 0,
      isJumping: false,
    }));

    const applyRipple = (clientX, clientY, strength, size) => {
      const cx = Math.floor(clientX / scale);
      const cy = Math.floor(clientY / (scale * yScale));

      for(let x = -size; x <= size; x++) {
        for(let y = -size; y <= size; y++) {
          const nx = cx + x;
          const ny = cy + y;
          // Only apply if within bounds
          if(nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
              // Note: using += feels slightly more natural for multiple interactions
              previous[getIndex(nx, ny)] += strength; 
          }
        }
      }
    };

    const draw = () => {
      // Fill base water
      ctx.fillStyle = `rgb(${waterColors[2][0]}, ${waterColors[2][1]}, ${waterColors[2][2]})`;
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.001; // Slower time for very calm water

      for (let j = 1; j < rows - 1; j++) {
        for (let i = 1; i < cols - 1; i++) {
          const idx = i + j * cols;
          
          current[idx] = (
            previous[i - 1 + j * cols] +
            previous[i + 1 + j * cols] +
            previous[i + (j - 1) * cols] +
            previous[i + (j + 1) * cols]
          ) / 2 - current[idx];

          current[idx] *= dampening;

          let val = current[idx];
          let colorIndex = 2; // base
          let stretch = 1;

          // 1. Draw Stardew-style idle lines VERY sparsely
          // Moving from BOTTOM to TOP, broken into disjoint randomized dashes
          const wavePhase = j * 0.12 + Math.sin(i * 0.015) * 1.2 + time * 1.5;
          const lineNoise = Math.sin(wavePhase);
          
          // Break the lines horizontally into disjoint segments using deterministic spatial noise
          const dashBreak = Math.sin(i * 0.15 + Math.sin(j * 0.1) * 2);
          
          // > 0.995 ensures incredibly thin lines (almost single pixel height)
          if (lineNoise > 0.995 && dashBreak > 0.3) { 
            colorIndex = 1; // light blue lines
            // Very short, thin disjointed dashes
            stretch = 2 + Math.floor(Math.abs(Math.cos(i * 0.2)) * 3); 
          }

          // 2. Override with interactive fluid ripples if they are strong
          if (val > 2 || val < -2) {
            if (val > 20) { colorIndex = 0; stretch = 1; } // foam
            else if (val > 5) { colorIndex = 1; stretch = 1; } // light blue splash
            else if (val < -10) { colorIndex = 4; stretch = 1; } // deep splash
            else if (val < -4) { colorIndex = 3; stretch = 1; } // med dark splash
          }

          if (colorIndex !== 2) {
            const c = waterColors[colorIndex];
            ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
            ctx.fillRect(i * scale, j * scale * yScale, scale * stretch, scale * yScale);
            
            // Skip inner loop if stretched to prevent drawing overlapping segments
            if (stretch > 1) {
              i += stretch - 1; 
            }
          }
        }
      }

      // Swap buffers
      const temp = previous;
      previous = current;
      current = temp;

      // Draw Fishes!
      if (fishImg.complete && fishImg.naturalWidth > 0) {
        fishes.forEach(fish => {
          // Physics step
          if (fish.isJumping) {
             fish.z += fish.vz;
             fish.vz -= 0.6; // gravity
             fish.x += fish.vx * 1.5; 
             fish.y += fish.vy * 1.5;
             
             if (fish.z <= 0) {
               // Landing splash
               fish.z = 0;
               fish.isJumping = false;
               applyRipple(fish.x, fish.y, 900, 1);
             }
          } else {
             // Swimming
             fish.x += fish.vx;
             fish.y += fish.vy;
             
             // Rare jump chance (very low probability)
             if (Math.random() < 0.0005) { 
                fish.isJumping = true;
                fish.vz = 6 + Math.random() * 6; // jump height
                applyRipple(fish.x, fish.y, -400, 0); // take-off splash
             }
             
             // Smooth directional wandering
             if (Math.random() < 0.05) {
                fish.vx += (Math.random() - 0.5) * 0.4;
                fish.vy += (Math.random() - 0.5) * 0.4;
                
                // Limit speed
                const speed = Math.hypot(fish.vx, fish.vy);
                if (speed > 1.2) {
                  fish.vx /= speed;
                  fish.vy /= speed;
                }
             }
          }

          // Screen wrapping
          if (fish.x < -50) fish.x = width + 50;
          if (fish.x > width + 50) fish.x = -50;
          if (fish.y < -50) fish.y = height + 50;
          if (fish.y > height + 50) fish.y = -50;

          const isFacingLeft = fish.vx < 0;

          ctx.save();
          // Adjust translation for oblique perspective height when jumping
          ctx.translate(fish.x, fish.y);
          if (isFacingLeft) {
             ctx.scale(-1, 1); 
          }
          
          const fw = 48; // scale fish up a bit so it's visible
          const fh = 48;

          if (fish.isJumping) {
             // Draw water shadow (bottom)
             ctx.globalAlpha = 0.15;
             ctx.drawImage(shadowCanvas, -fw/2, -fh/2, fw, fh);
             
             // Draw actual jumping fish, floating by 'z'
             ctx.globalAlpha = 1.0;
             const jumpAngle = Math.atan2(-fish.vz, Math.abs(fish.vx) * 2);
             ctx.translate(0, -fish.z);
             ctx.rotate(jumpAngle);
             ctx.drawImage(fishImg, -fw/2, -fh/2, fw, fh);
          } else {
             // Draw completely darkened fish shadow swimming under water
             ctx.globalAlpha = 0.2;
             // Add slight rotation wiggle while swimming
             const wiggle = Math.sin(time * 200 + fish.x * 0.1) * 0.1;
             ctx.rotate((Math.atan2(fish.vy, Math.abs(fish.vx)) * 0.5) + wiggle);
             ctx.drawImage(shadowCanvas, -fw/2, -fh/2, fw, fh);
          }
          
          ctx.restore();
          ctx.globalAlpha = 1.0; // Reset alpha for water drawing etc.
        });
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    const handlePointerMove = (e) => {
      // Allow moving ripples even if pointer is up, for interactive feel
      applyRipple(e.clientX, e.clientY, 150, 0); // Smaller drop for move (size 0 = 1x1 block)
    };

    const handlePointerDown = (e) => {
      applyRipple(e.clientX, e.clientY, 2000, 1); // Massive splash (size 1 = 3x3 block)
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrame);
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