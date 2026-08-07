import React, { useRef, useEffect, useState } from 'react';

const MiniGame = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameId, setGameId] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const player = {
      x: canvas.width / 2,
      y: canvas.height - 80,
      width: 40,
      height: 40,
      speed: 8,
    };

    const bullets = [];
    const bugs = [];
    let bugSpeed = 2;
    let scoreCount = 0;
    let isGameOver = false;

    const spawnBug = () => {
      bugs.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 30,
        height: 30,
        type: Math.random() > 0.5 ? '404' : 'BUG'
      });
    };

    let frameCount = 0;

    const keys = {};
    
    // Fire bullet logic
    const fireBullet = () => {
      if (!isGameOver) {
        bullets.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 15,
          speed: 12
        });
      }
    };

    const handleKeyDown = (e) => {
      keys[e.key] = true;
      if (e.key === ' ') {
        fireBullet();
      }
      // Prevent spacebar scrolling
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      keys[e.key] = false;
    };

    // Mouse Controls
    const handleMouseMove = (e) => {
      if (!isGameOver) {
        // Center the ship on the mouse pointer horizontally
        let newX = e.clientX - player.width / 2;
        // Clamp to screen edges
        if (newX < 0) newX = 0;
        if (newX > canvas.width - player.width) newX = canvas.width - player.width;
        player.x = newX;
      }
    };

    const handleMouseClick = (e) => {
      // Don't fire if clicking UI buttons (they have z-index)
      if (e.target === canvas) {
        fireBullet();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseClick);

    const drawPlayer = () => {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(player.x + 15, player.y - 15, 10, 15);
    };

    const drawBullets = () => {
      ctx.fillStyle = '#fcd34d';
      bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
    };

    const drawBugs = () => {
      bugs.forEach(bug => {
        ctx.fillStyle = bug.type === '404' ? '#ef4444' : '#a855f7';
        ctx.fillRect(bug.x, bug.y, bug.width, bug.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(bug.type, bug.x + bug.width/2, bug.y - 5);
      });
    };

    const update = () => {
      if (isGameOver) return;

      if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
      if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;

      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) bullets.splice(i, 1);
      }

      frameCount++;
      // Spawn slightly slower: start at 1 per 2 seconds (120 frames), max speed 1 per 0.6 seconds (40 frames)
      if (frameCount % Math.max(40, 120 - Math.floor(scoreCount / 5)) === 0) {
        spawnBug();
      }

      for (let i = bugs.length - 1; i >= 0; i--) {
        bugs[i].y += bugSpeed + (scoreCount * 0.05);

        if (
          bugs[i].x < player.x + player.width &&
          bugs[i].x + bugs[i].width > player.x &&
          bugs[i].y < player.y + player.height &&
          bugs[i].y + bugs[i].height > player.y
        ) {
          isGameOver = true;
          setGameOver(true);
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
          if (
            bullets[j] &&
            bugs[i] &&
            bullets[j].x < bugs[i].x + bugs[i].width &&
            bullets[j].x + bullets[j].width > bugs[i].x &&
            bullets[j].y < bugs[i].y + bugs[i].height &&
            bullets[j].y + bullets[j].height > bugs[i].y
          ) {
            bugs.splice(i, 1);
            bullets.splice(j, 1);
            scoreCount += 10;
            setScore(scoreCount);
            break;
          }
        }
        
        if (bugs[i] && bugs[i].y > canvas.height) {
          isGameOver = true;
          setGameOver(true);
        }
      }
    };

    const loop = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars background
      if (Math.random() > 0.5) {
        ctx.fillStyle = 'white';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }

      if (!isGameOver) {
        update();
        drawPlayer();
        drawBullets();
        drawBugs();
      } else {
        ctx.fillStyle = 'red';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        ctx.fillStyle = 'white';
        ctx.font = '15px "Press Start 2P"';
        ctx.fillText(`SCORE: ${scoreCount}`, canvas.width/2, canvas.height/2 + 40);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameId]); // Only restart the effect when gameId changes

  return (
    <div className="fixed inset-0 z-[200] font-mono" style={{ fontFamily: '"Press Start 2P", system-ui' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');` }} />
      <canvas ref={canvasRef} className="block" />
      
      <div className="absolute top-4 left-4 text-[#4ade80] text-xl drop-shadow-[2px_2px_0_#000]">
        SCORE: {score}
      </div>
      
      <div className="absolute top-12 left-4 text-[#e6c17a] text-[10px] drop-shadow-[1px_1px_0_#000]">
        Mouse: Move | Click: Shoot
      </div>

      <button 
        onClick={onClose}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 border-4 border-red-800 hover:bg-red-500 transition-all text-xs z-10"
      >
        EXIT SYSTEM
      </button>

      {gameOver && (
        <button 
          onClick={() => { setScore(0); setGameOver(false); setGameId(prev => prev + 1); }}
          className="absolute top-2/3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 border-4 border-green-800 hover:bg-green-500 transition-colors z-10"
        >
          RESTART
        </button>
      )}
    </div>
  );
};

export default MiniGame;
