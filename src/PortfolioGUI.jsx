import React, { useEffect, useRef } from 'react';

const PortfolioGUI = ({ onExit }) => {
  const canvasRef = useRef(null);

  // --- THE ANDROID 15 SPACE EXPLORATION ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Game State
    const ship = { vx: 0, vy: 0 };
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let isThrusting = false;
    let worldX = 0;
    let worldY = 0;

    // Generate Parallax Starfield (Memoized conceptually so they only generate once)
    const particles = [];
    const stars = Array.from({ length: 300 }, () => ({
      x: (Math.random() - 0.5) * 4000,
      y: (Math.random() - 0.5) * 4000,
      size: Math.random() * 2,
      parallax: Math.random() * 0.5 + 0.1
    }));

    // Hidden Planets to discover
    const planets = [
      { x: 800, y: -600, radius: 100, color: '#16a34a', hasRing: false, name: 'Android Green' },
      { x: -1200, y: 900, radius: 180, color: '#0ea5e9', hasRing: true, name: 'Sky Blue' }
    ];

    // Global Input Listeners (These trigger even through the UI)
    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseDown = (e) => {
      // Prevent thrusting if clicking a link or button
      if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'path' && e.target.tagName !== 'svg') {
        isThrusting = true;
      }
    };
    const handleMouseUp = () => { isThrusting = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const render = () => {
      // Deep space background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const shipX = canvas.width / 2;
      const shipY = canvas.height / 2;

      // Calculate Ship Angle
      const angle = Math.atan2(mouse.y - shipY, mouse.x - shipX);

      // Apply Physics
      if (isThrusting) {
        ship.vx += Math.cos(angle) * 0.25;
        ship.vy += Math.sin(angle) * 0.25;

        // Thrust Particle Emitter
        particles.push({
          x: shipX - Math.cos(angle) * 15,
          y: shipY - Math.sin(angle) * 15,
          vx: -Math.cos(angle) * 3 + (Math.random() - 0.5),
          vy: -Math.sin(angle) * 3 + (Math.random() - 0.5),
          life: 1.0
        });
      }

      // Space Friction (Inertia)
      ship.vx *= 0.985;
      ship.vy *= 0.985;

      // Move the camera/world based on ship velocity
      worldX += ship.vx;
      worldY += ship.vy;

      // Render Parallax Stars
      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
        let sx = (star.x - worldX * star.parallax) % canvas.width;
        let sy = (star.y - worldY * star.parallax) % canvas.height;
        if (sx < 0) sx += canvas.width;
        if (sy < 0) sy += canvas.height;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Planets
      planets.forEach(planet => {
        const px = planet.x - worldX + canvas.width / 2;
        const py = planet.y - worldY + canvas.height / 2;
        
        // Only draw if on screen
        if (px > -300 && px < canvas.width + 300 && py > -300 && py < canvas.height + 300) {
          // Draw Ring
          if (planet.hasRing) {
             ctx.beginPath();
             ctx.ellipse(px, py, planet.radius * 2.2, planet.radius * 0.4, Math.PI / 6, 0, 2 * Math.PI);
             ctx.strokeStyle = 'rgba(255,255,255,0.1)';
             ctx.lineWidth = 20;
             ctx.stroke();
          }
          // Draw Body
          ctx.fillStyle = planet.color;
          ctx.beginPath();
          ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
          ctx.fill();
          // Draw Atmosphere Glow
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(px, py, planet.radius + 12, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Render Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${p.life})`; // Android Blue Thruster
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render Ship
      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(angle);
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#050505';
      
      ctx.beginPath();
      ctx.moveTo(15, 0); // Nose
      ctx.lineTo(-10, 10); // Right wing
      ctx.lineTo(-5, 0); // Engine indent
      ctx.lineTo(-10, -10); // Left wing
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    // Note the bg is completely transparent now so the canvas shows through
    <div className="relative w-full h-screen text-gray-200 font-sans overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth selection:bg-white selection:text-black">
      
      {/* Background Canvas fixed to the back */}
      <canvas ref={canvasRef} className="fixed inset-0 z-[-1] pointer-events-none" aria-label="Interactive space exploration background" />

      <button 
        onClick={onExit}
        className="fixed top-8 right-8 z-50 text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
        aria-label="Close graphical interface"
      >
        [ Close GUI ]
      </button>

      {/* Section 1: Hero (Fully transparent to show off the game) */}
      <section className="h-screen w-full flex flex-col items-center justify-center snap-center p-6 bg-transparent">
        <div className="max-w-4xl text-center space-y-6 pointer-events-none">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl">
            Veol Steve Jose
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 tracking-wide font-light drop-shadow-md">
            CS Engineer & Aspiring Game Developer.
          </p>
          
          <div className="flex justify-center gap-6 pt-2 pointer-events-auto">
            <a href="https://github.com/weeeol" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 drop-shadow-md">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="mailto:veolstevejose@gmail.com" className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 drop-shadow-md">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>

          <div className="pt-12">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gray-400 animate-pulse drop-shadow-md">
              Hold Click to Thrust / Scroll to Explore
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Tech Arsenal (Frosted Glass) */}
     <section className="h-screen w-full flex flex-col items-center justify-center snap-center p-6 bg-black/40 backdrop-blur-md border-t border-b border-white/5">
        <div className="max-w-5xl text-center space-y-16 pointer-events-none">
          <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400">01 / Tech Arsenal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 text-sm md:text-base">
            <div className="space-y-6">
              <h3 className="text-white tracking-[0.2em] text-xs uppercase drop-shadow-md">Languages</h3>
              <p className="text-gray-300 leading-relaxed font-light">
                C, C++, C#, Java, Python <br/>
                JavaScript, React, Kotlin, Lua <br/>
                HTML5, CSS3, Bash Script
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-white tracking-[0.2em] text-xs uppercase drop-shadow-md">Game Dev & Design</h3>
              <p className="text-gray-300 leading-relaxed font-light">
                Unreal Engine, Unity <br/>
                Blender, GIMP
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-white tracking-[0.2em] text-xs uppercase drop-shadow-md">Tools & Frameworks</h3>
              <p className="text-gray-300 leading-relaxed font-light">
                Node.js, Next.js, FastAPI, Qt <br/>
                SQLite, MySQL, CMake, NPM <br/>
                Vercel, Render, Raspberry Pi, LaTeX
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: About Me */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center snap-center p-6 py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl w-full text-center space-y-12">
          <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400">02 / About Me</h2>
          <p className="text-3xl md:text-5xl leading-tight text-gray-300 font-light mx-auto drop-shadow-lg pointer-events-none">
            I am confident in my abilities as a CS Engineer, I welcome any questions and am committed to answering them with <span className="text-white font-medium">complete honesty.</span>
          </p>
        </div>
      </section>

      {/* Section 4: Projects */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center snap-center p-6 py-24 bg-black/50 backdrop-blur-md border-t border-white/5">
        <div className="max-w-6xl w-full space-y-16">
          <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 text-center">03 / Selected Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            
            <div className="md:col-span-2 space-y-4 group cursor-default text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-gray-400 group-hover:text-white transition-colors duration-500 tracking-tight drop-shadow-md">Flowmake</h3>
              <p className="text-gray-400 group-hover:text-gray-200 transition-colors duration-500 font-light max-w-2xl mx-auto">
                Full-stack application that automatically converts Python source code into modern, professional flowcharts by parsing the Abstract Syntax Tree (AST).
              </p>
            </div>

            <div className="space-y-3 group cursor-default border-l border-gray-700 pl-6 hover:border-white/50 transition-colors duration-500 bg-black/20 p-4 rounded-r-xl">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-white transition-colors duration-500 tracking-tight">ExplainIt</h3>
              <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-200 transition-colors duration-500 font-light leading-relaxed">
                Static analysis and AI tool that explains code functionality and breaking points without ever modifying or uploading the source code.
              </p>
            </div>

            <div className="space-y-3 group cursor-default border-l border-gray-700 pl-6 hover:border-white/50 transition-colors duration-500 bg-black/20 p-4 rounded-r-xl">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-white transition-colors duration-500 tracking-tight">Inventory System</h3>
              <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-200 transition-colors duration-500 font-light leading-relaxed">
                Developed in C using Hash Tables, Linked Lists, and Queues to provide real-time stock lookup and order processing for small businesses.
              </p>
            </div>

            <div className="space-y-3 group cursor-default border-l border-gray-700 pl-6 hover:border-white/50 transition-colors duration-500 bg-black/20 p-4 rounded-r-xl">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-white transition-colors duration-500 tracking-tight">ProtoPlay</h3>
              <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-200 transition-colors duration-500 font-light leading-relaxed">
                An experimental game project built with Pygame, serving as a foundation for testing mechanics, sprite movement, and input handling.
              </p>
            </div>

            <div className="space-y-3 group cursor-default border-l border-gray-700 pl-6 hover:border-white/50 transition-colors duration-500 bg-black/20 p-4 rounded-r-xl">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-white transition-colors duration-500 tracking-tight">Text Editor</h3>
              <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-200 transition-colors duration-500 font-light leading-relaxed">
                A lightweight desktop text editor engineered with Python and Tkinter, supporting rapid file operations and editing.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Final Footer: placed in its own full-screen snap section so it can be reached */}
      <section className="h-screen w-full flex items-end justify-center snap-center p-6 bg-transparent">
        <div className="w-full py-8 text-center text-sm text-gray-400/80">
          © 2026 Veol Steve Jose — made with React, Canvas, and Tailwind
        </div>
      </section>
    </div>
  );
};

export default PortfolioGUI;