import React, { useEffect, useRef } from 'react';

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

    const draw = () => {
      // Fill base water
      ctx.fillStyle = `rgb(${waterColors[2][0]}, ${waterColors[2][1]}, ${waterColors[2][2]})`;
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.0015; // Time variable for Stardew-like wave scrolling

      for (let i = 1; i < cols - 1; i++) {
        for (let j = 1; j < rows - 1; j++) {
          const idx = i + j * cols;
          
          current[idx] = (
            previous[i - 1 + j * cols] +
            previous[i + 1 + j * cols] +
            previous[i + (j - 1) * cols] +
            previous[i + (j + 1) * cols]
          ) / 2 - current[idx];

          current[idx] *= dampening;

          // Val represents interactive fluid ripples
          let val = current[idx];
          
          // Very subtle, sparse horizontal lines (Stardew style)
          // Mainly uses Y (j) for straight lines, with a slight X (i) to break it into dashes
          const stardewWave = 
            Math.sin((j * 0.15) - time * 0.6) * 5 + 
            Math.sin((i * 0.1) + (j * 0.05) + time * 0.3) * 2.5;
          
          val += stardewWave;
          
          if (val > 4 || val < -4) {
            let colorIndex = 2; // base
            if (val > 25) colorIndex = 0; // interaction foam
            else if (val > 7) colorIndex = 1; // sparse light blue lines
            else if (val < -15) colorIndex = 4; // deep trough (splash)
            else if (val < -7) colorIndex = 3; // sparse dark lines

            if (colorIndex !== 2) {
              const c = waterColors[colorIndex];
              ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
              // Draw clean horizontal dashes
              const stretch = (colorIndex === 1 || colorIndex === 3) ? 4 : 1;
              ctx.fillRect(i * scale, j * scale * yScale, scale * stretch, scale * yScale);
            }
          }
        }
      }

      // Swap buffers
      const temp = previous;
      previous = current;
      current = temp;

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    const applyRipple = (clientX, clientY, strength, size) => {
      const cx = Math.floor(clientX / scale);
      const cy = Math.floor(clientY / (scale * yScale));

      // Drop in a pattern to look more like a pixel splash
      for(let x = -size; x <= size; x++) {
        for(let y = -size; y <= size; y++) {
          const nx = cx + x;
          const ny = cy + y;
          if(nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
              previous[getIndex(nx, ny)] = strength;
          }
        }
      }
    };

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