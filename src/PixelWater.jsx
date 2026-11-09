import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import salmonImgSrc from './assets/Salmon.png';
import redMulletImgSrc from './assets/Red_Mullet.png';
import herringImgSrc from './assets/Herring.png';
import stingrayImgSrc from './assets/Stingray.png';
import boatImgSrc from './assets/Boat1.png';
import { waterColors } from './water/constants';
import {
  applyRipple as applyRippleToBuffer,
  applyWaveLine as applyWaveLineToBuffer,
  createBoatInfo,
  createFoam,
  createFishes,
  spawnFoam as spawnFoamInState,
} from './water/entities';

// Disable Three.js automated sRGB gamma curve to prevent pixel art washing out
THREE.ColorManagement.enabled = false;

const createWaterGeometry = (w, h) => {
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

const createCenteredQuadGeometry = (w, h) => {
  const geo = new THREE.BufferGeometry();
  const hw = w * 0.5;
  const hh = h * 0.5;
  const positions = new Float32Array([
    -hw, -hh, 0,
     hw, -hh, 0,
    -hw,  hh, 0,
    -hw,  hh, 0,
     hw, -hh, 0,
     hw,  hh, 0,
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

const PixelWater = ({ isPaused = false }) => {
  const canvasRef = useRef(null);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;
    let isDocumentActive = !document.hidden;
    let animationFrame;

    // --- Three.js Setup ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x0e74af, 1.0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1000, 1000);
    camera.position.set(0, 0, 500);

    const textureLoader = new THREE.TextureLoader();
    const loadPixelTexture = (src, onLoad) => {
      const tex = textureLoader.load(src, onLoad);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.flipY = false;
      tex.colorSpace = THREE.LinearSRGBColorSpace;
      return tex;
    };

    // Textures & Master Materials
    const fishSources = [salmonImgSrc, redMulletImgSrc, herringImgSrc, stingrayImgSrc];
    const fishTextures = fishSources.map(src => loadPixelTexture(src));

    const fishHullMaterials = fishTextures.map(
      tex =>
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 1.0,
          depthWrite: false,
          depthTest: true,
          side: THREE.DoubleSide,
        })
    );

    const fishShadowMaterials = fishTextures.map(
      tex =>
        new THREE.MeshBasicMaterial({
          map: tex,
          color: 0x000000,
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
          depthTest: true,
          side: THREE.DoubleSide,
        })
    );

    let boatGeo = createCenteredQuadGeometry(80, 44);
    const boatTexture = loadPixelTexture(boatImgSrc, tex => {
      if (!isMounted) return;
      const aspect = tex.image.height / tex.image.width;
      const bw = 80;
      const bh = 80 * aspect;
      const newBoatGeo = createCenteredQuadGeometry(bw, bh);
      boatHullMesh.geometry = newBoatGeo;
      boatShadowMesh.geometry = newBoatGeo;
      boatGeo.dispose();
      boatGeo = newBoatGeo;
    });

    const boatHullMaterial = new THREE.MeshBasicMaterial({
      map: boatTexture,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });

    const boatShadowMaterial = new THREE.MeshBasicMaterial({
      map: boatTexture,
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });

    const boatShadowMesh = new THREE.Mesh(boatGeo, boatShadowMaterial);
    boatShadowMesh.visible = false;
    scene.add(boatShadowMesh);

    const boatHullMesh = new THREE.Mesh(boatGeo, boatHullMaterial);
    boatHullMesh.visible = false;
    scene.add(boatHullMesh);

    // Fish Meshes with cloned materials for independent opacity control
    const MAX_FISH = 8;
    const fishes = createFishes(MAX_FISH, window.innerWidth, window.innerHeight, fishSources.length);
    const fishGeo = createCenteredQuadGeometry(48, 48);

    const fishMeshPairs = fishes.map(fish => {
      const shadowMaterial = fishShadowMaterials[fish.spriteIndex].clone();
      const shadowMesh = new THREE.Mesh(fishGeo, shadowMaterial);
      shadowMesh.visible = false;
      scene.add(shadowMesh);

      const hullMaterial = fishHullMaterials[fish.spriteIndex].clone();
      const hullMesh = new THREE.Mesh(fishGeo, hullMaterial);
      hullMesh.visible = false;
      scene.add(hullMesh);

      return { shadowMesh, hullMesh, shadowMaterial, hullMaterial };
    });

    // Foam Particles InstancedMesh
    const MAX_FOAM = 500;
    const foam = createFoam();
    const foamGeo = createCenteredQuadGeometry(1, 1);
    const foamAlphas = new Float32Array(MAX_FOAM);
    foamGeo.setAttribute('a_alpha', new THREE.InstancedBufferAttribute(foamAlphas, 1));

    const foamMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float a_alpha;
        varying float v_alpha;
        void main() {
          v_alpha = a_alpha;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float v_alpha;
        uniform vec3 u_color;
        void main() {
          gl_FragColor = vec4(u_color, v_alpha);
        }
      `,
      uniforms: {
        u_color: { value: new THREE.Color(0.78, 0.96, 1.0) },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });

    const foamMesh = new THREE.InstancedMesh(foamGeo, foamMaterial, MAX_FOAM);
    foamMesh.count = 0;
    scene.add(foamMesh);
    const dummy = new THREE.Object3D();

    // Water Surface
    const waterMaterial = new THREE.MeshBasicMaterial({
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,
    });
    const waterMesh = new THREE.Mesh(createWaterGeometry(1, 1), waterMaterial);
    waterMesh.position.set(0, 0, 0);
    scene.add(waterMesh);

    // --- Simulation State ---
    const getPixelScale = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const baseScale = window.innerWidth < 768 ? 3 : 5;
      return Math.max(2, Math.round(baseScale * dpr));
    };

    let scale = getPixelScale();
    let renderDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const yScale = 0.5;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let current, previous, pixelData, basePixelData;
    let waterTexture = null;
    const dampening = 0.94;
    let lastScrollPosition = 0;
    let scrollAccumulator = 0;

    const boatInfo = createBoatInfo();
    const applyRipple = (x, y, strength, size) => applyRippleToBuffer(previous, cols, rows, scale, yScale, x, y, strength, size);
    const applyWaveLine = (screenY, strength, thickness = 1) => applyWaveLineToBuffer(previous, cols, rows, scale, yScale, screenY, strength, thickness);
    const spawnFoam = (x, y, count = 5, burst = 1) => spawnFoamInState(foam, x, y, count, burst);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      scale = getPixelScale();
      renderDpr = Math.min(window.devicePixelRatio || 1, 1.5);

      renderer.setPixelRatio(renderDpr);
      renderer.setSize(width, height, false);

      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();

      cols = Math.ceil(width / scale);
      rows = Math.ceil(height / (scale * yScale));

      current = new Float32Array(cols * rows).fill(0);
      previous = new Float32Array(cols * rows).fill(0);

      pixelData = new Uint8Array(cols * rows * 4);
      basePixelData = new Uint8Array(cols * rows * 4);

      for (let k = 0; k < cols * rows; k++) {
        const idx = k * 4;
        basePixelData[idx] = waterColors[2][0];
        basePixelData[idx + 1] = waterColors[2][1];
        basePixelData[idx + 2] = waterColors[2][2];
        basePixelData[idx + 3] = 255;
      }

      if (waterTexture) {
        waterTexture.dispose();
      }

      waterTexture = new THREE.DataTexture(
        pixelData,
        cols,
        rows,
        THREE.RGBAFormat,
        THREE.UnsignedByteType
      );
      waterTexture.minFilter = THREE.NearestFilter;
      waterTexture.magFilter = THREE.NearestFilter;
      waterTexture.generateMipmaps = false;
      waterTexture.flipY = false;
      waterTexture.colorSpace = THREE.LinearSRGBColorSpace;

      waterMaterial.map = waterTexture;
      waterMaterial.needsUpdate = true;

      if (waterMesh.geometry) {
        waterMesh.geometry.dispose();
      }
      waterMesh.geometry = createWaterGeometry(cols * scale, rows * scale * yScale);
    };

    window.addEventListener('resize', resize);
    resize();

    let lastFrameTime = 0;
    const fpsLimit = 50;
    const frameDuration = 1000 / fpsLimit;

    // --- Render Loop ---
    const draw = (timestamp) => {
      animationFrame = requestAnimationFrame(draw);

      if (isPausedRef.current) return;
      if (timestamp - lastFrameTime < frameDuration) return;
      lastFrameTime = timestamp;

      const time = timestamp * 0.001;
      pixelData.set(basePixelData);

      // Simulation Step
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

          const val = current[idx];
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
              pixelData[pIdx + 1] = c[1];
              pixelData[pIdx + 2] = c[2];
            }
            if (stretch > 1) i += stretch - 1;
          }
        }
      }

      const temp = previous;
      previous = current;
      current = temp;

      if (waterTexture) {
        waterTexture.needsUpdate = true;
      }

      // --- Update Fishes ---
      fishes.forEach((fish, idx) => {
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
          let separationX = 0;
          let separationY = 0;

          fishes.forEach(other => {
            if (other === fish) return;
            const distance = Math.hypot(other.x - fish.x, other.y - fish.y);
            if (distance < 180) {
              nearbyX += other.x;
              nearbyY += other.y;
              nearbyCount++;
            }
            if (distance > 0 && distance < 70) {
              const separation = (70 - distance) / 70;
              separationX -= ((other.x - fish.x) / distance) * separation;
              separationY -= ((other.y - fish.y) / distance) * separation;
            }
          });

          if (nearbyCount) {
            fish.vx += ((nearbyX / nearbyCount - fish.x) * 0.00015);
            fish.vy += ((nearbyY / nearbyCount - fish.y) * 0.00015);
          }
          fish.vx += separationX * 0.018;
          fish.vy += separationY * 0.018;
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
        fish.shadowX = fish.x;
        fish.shadowY = fish.y;

        const isFacingLeft = fish.vx < 0;
        const { shadowMesh, hullMesh, shadowMaterial } = fishMeshPairs[idx];

        if (fish.isJumping) {
          const imgOffset = Math.PI / 2;
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
        } else {
          const wiggle = Math.sin(time * 5 + fish.x * 0.05 + fish.phase) * 0.1;
          const imgOffset = Math.PI / 2;
          const angle = (Math.atan2(fish.vy, Math.abs(fish.vx)) * 0.5) + wiggle + imgOffset;

          shadowMesh.visible = true;
          shadowMesh.position.set(Math.floor(fish.x), Math.floor(fish.y), 1);
          shadowMesh.rotation.z = isFacingLeft ? -angle : angle;
          shadowMesh.scale.set(isFacingLeft ? -1 : 1, 1, 1);
          shadowMaterial.opacity = 0.2;

          hullMesh.visible = false;
        }
      });

      // --- Update Boat ---
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
        boatShadowMesh.visible = false;
        boatHullMesh.visible = false;
      } else {
        boatInfo.x += boatInfo.vx;
        boatInfo.y += boatInfo.vy;

        applyRipple(boatInfo.x - (boatInfo.vx * 15), boatInfo.y, 400, 0);
        applyRipple(boatInfo.x, boatInfo.y, 150, 0);
        if (Math.random() < 0.08) spawnFoam(boatInfo.x - boatInfo.vx * 12, boatInfo.y, 1, 0.4);

        if (boatInfo.x > width + 200 || boatInfo.x < -200 || boatInfo.y < -200 || boatInfo.y > height + 200) {
          boatInfo.active = false;
          boatInfo.timeUntilNext = 300 + Math.random() * 600;
        }

        const isFacingLeft = boatInfo.vx < 0;
        const angle = Math.atan2(boatInfo.vy, Math.abs(boatInfo.vx));

        boatShadowMesh.visible = true;
        boatShadowMesh.position.set(Math.floor(boatInfo.x), Math.floor(boatInfo.y + 10), 1.5);
        boatShadowMesh.rotation.z = isFacingLeft ? -angle : angle;
        boatShadowMesh.scale.set(isFacingLeft ? -1 : 1, 1, 1);

        boatHullMesh.visible = true;
        boatHullMesh.position.set(Math.floor(boatInfo.x), Math.floor(boatInfo.y), 3);
        boatHullMesh.rotation.z = isFacingLeft ? -angle : angle;
        boatHullMesh.scale.set(isFacingLeft ? -1 : 1, 1, 1);
      }

      // --- Update Foam Particles ---
      let activeFoamCount = 0;
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

        if (activeFoamCount < MAX_FOAM) {
          dummy.position.set(Math.floor(drop.x), Math.floor(drop.y), 4);
          const size = Math.ceil(drop.size);
          dummy.scale.set(size, size, 1);
          dummy.updateMatrix();
          foamMesh.setMatrixAt(activeFoamCount, dummy.matrix);
          foamAlphas[activeFoamCount] = Math.min(1.0, drop.life * 2.0);
          activeFoamCount++;
        }
      }

      foamMesh.count = activeFoamCount;
      if (activeFoamCount > 0) {
        foamMesh.instanceMatrix.needsUpdate = true;
        foamGeo.attributes.a_alpha.needsUpdate = true;
      }

      renderer.render(scene, camera);
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
      const rippleStrength = isTouch ? 20 : 150;

      if (lastPointer) {
        const dx = x - lastPointer.x;
        const dy = y - lastPointer.y;
        const dist = Math.hypot(dx, dy);

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
      const isTouch = e.pointerType === 'touch';
      const rippleSize = isTouch ? 0 : 1;

      let hitSomething = false;

      // 1. Check if clicked on the boat
      if (boatInfo.active) {
        const dist = Math.hypot(boatInfo.x - cx, boatInfo.y - cy);
        if (dist < 60) {
          hitSomething = true;
          boatInfo.vx *= 2.5;
          applyRipple(boatInfo.x, boatInfo.y, isTouch ? 1200 : 5000, isTouch ? 1 : 2);
        }
      }

      // 2. Check if clicked on fishes
      if (!hitSomething) {
        for (const fish of fishes) {
          const dist = Math.hypot(fish.x - cx, fish.y - cy);
          if (dist < 40 && !fish.isJumping) {
            hitSomething = true;
            fish.isJumping = true;
            fish.vz = 8 + Math.random() * 5;
            fish.vx = (fish.x - cx) * 0.2;
            fish.vy = (fish.y - cy) * 0.2;

            applyRipple(fish.x, fish.y, isTouch ? 450 : 1500, rippleSize);
            spawnFoam(fish.x, fish.y, isTouch ? 3 : 6, isTouch ? 0.7 : 1.2);
            break;
          }
        }
      }

      // 3. Regular water ripple if nothing was hit
      if (!hitSomething) {
        applyRipple(cx, cy, isTouch ? 450 : 2000, rippleSize);
        spawnFoam(cx, cy, isTouch ? 2 : 3, isTouch ? 0.5 : 0.8);
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
      isMounted = false;
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

      // Dispose Geometries
      if (waterMesh.geometry) waterMesh.geometry.dispose();
      boatGeo.dispose();
      fishGeo.dispose();
      foamGeo.dispose();

      // Dispose Materials
      waterMaterial.dispose();
      boatHullMaterial.dispose();
      boatShadowMaterial.dispose();
      fishHullMaterials.forEach(mat => mat.dispose());
      fishShadowMaterials.forEach(mat => mat.dispose());
      fishMeshPairs.forEach(({ shadowMaterial, hullMaterial }) => {
        shadowMaterial.dispose();
        hullMaterial.dispose();
      });
      foamMaterial.dispose();

      // Dispose Textures
      if (waterTexture) waterTexture.dispose();
      boatTexture.dispose();
      fishTextures.forEach(tex => tex.dispose());

      // Dispose Renderer
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Interactive Three.js pixel water background simulation"
      className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-[#0e74af]"
    />
  );
};

export default PixelWater;
