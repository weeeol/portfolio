import React, { useState, useRef, useEffect } from 'react';
import profileImage from './assets/Profile.png';
import PixelWater from './PixelWater';

const DraggableNote = ({ title, content, initialRotation }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const bounds = useRef({ minX: -10000, maxX: 10000, minY: -10000, maxY: 10000 });
  const noteRef = useRef(null);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };

    // Calculate dynamic boundaries so the note stays inside the bulletin board
    if (noteRef.current) {
      const board = noteRef.current.closest('.bulletin-board');
      if (board) {
        const parentRect = board.getBoundingClientRect();
        const noteRect = noteRef.current.getBoundingClientRect();
        
        // Subtract current translation to find the "0,0" origin bounds of the note
        const originLeft = noteRect.left - position.x;
        const originRight = noteRect.right - position.x;
        const originTop = noteRect.top - position.y;
        const originBottom = noteRect.bottom - position.y;

        // Apply a 20px padding from the board's inner edges
        const PADDING = 20;
        bounds.current = {
          minX: parentRect.left - originLeft + PADDING,
          maxX: parentRect.right - originRight - PADDING,
          minY: parentRect.top - originTop + PADDING,
          maxY: parentRect.bottom - originBottom - PADDING
        };
      }
    }

    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    
    let newX = clientX - dragStart.current.x;
    let newY = clientY - dragStart.current.y;
    
    // Restrict movement strictly to the calculated boundaries
    newX = Math.max(bounds.current.minX, Math.min(bounds.current.maxX, newX));
    newY = Math.max(bounds.current.minY, Math.min(bounds.current.maxY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={noteRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${initialRotation}deg) scale(${isDragging ? 1.05 : 1})`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 50 : 10,
        touchAction: 'none',
        transition: isDragging ? 'none' : 'transform 0.15s ease-out'
      }}
      className="bg-[#fff9e6] p-6 border-4 border-[#cf9e5c] shadow-lg flex-1 hover:z-20 select-none pointer-events-auto relative"
    >
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full shadow-md border-b-2 border-gray-600"></div>
      <h3 className="text-[#8b5a2b] tracking-wider text-xl md:text-2xl uppercase mb-4 pointer-events-none">{title}</h3>
      <p className="text-[#4a2e1b] text-xs md:text-sm leading-relaxed md:leading-loose pointer-events-none" dangerouslySetInnerHTML={{ __html: content }}></p>
    </div>
  );
};

const PortfolioGUI = ({ onExit }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading");
  const [subText, setSubText] = useState("Generating world...");
  
  // Animation states
  const [showName, setShowName] = useState(false);
  const [isDripping, setIsDripping] = useState(false);
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    const generatedDrops = Array.from({ length: 35 }).map(() => ({
      left: 10 + Math.random() * 80,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.7,
      size: Math.random() > 0.5 ? 4 : 8,
      color: Math.random() > 0.5 ? '#1ca3ec' : '#0e74af'
    }));
    setDrops(generatedDrops);

    const texts = ["Generating world...", "Packing inventory...", "Watering crops...", "Ready!"];
    const timer1 = setTimeout(() => setSubText(texts[1]), 800);
    const timer2 = setTimeout(() => setSubText(texts[2]), 1600);
    const timer3 = setTimeout(() => setSubText(texts[3]), 2200);
    
    const finishTimer = setTimeout(() => {
      setIsLoading(false);
      
      // Trigger sequence
      setTimeout(() => {
        setShowName(true);
        
        // When the text breaches the surface (about 400ms into the transition), fire the big splashes
        setTimeout(() => {
          const y = window.innerHeight / 2;
          const w = window.innerWidth;
          
          window.dispatchEvent(new CustomEvent('trigger-splash', { detail: { x: w/2, y: y, strength: 4000, size: 4 } }));
          window.dispatchEvent(new CustomEvent('trigger-splash', { detail: { x: w/2 - 200, y: y, strength: 3000, size: 3 } }));
          window.dispatchEvent(new CustomEvent('trigger-splash', { detail: { x: w/2 + 200, y: y, strength: 3000, size: 3 } }));
          
          setIsDripping(true);
        }, 400);

        // Stop dripping after 6 seconds
        setTimeout(() => setIsDripping(false), 6000);
      }, 300);
    }, 2500);

    let dots = 0;
    const dotInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      setLoadingText("Loading" + ".".repeat(dots));
    }, 300);

    return () => {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      clearTimeout(finishTimer); clearInterval(dotInterval);
    };
  }, []);

  // Make the drips cause physics ripples
  useEffect(() => {
    let dripInterval;
    if (isDripping) {
      dripInterval = setInterval(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        const randomX = (w / 2) + (Math.random() - 0.5) * (w * 0.6); 
        const dropY = (h / 2) + 80;
        
        window.dispatchEvent(new CustomEvent('trigger-splash', { 
          detail: { x: randomX, y: dropY, strength: 150, size: 0 } 
        }));
      }, 100); 
    }
    return () => clearInterval(dripInterval);
  }, [isDripping]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#2d1b14] flex flex-col items-center justify-center font-mono z-[100]" style={{ fontFamily: '"Press Start 2P", system-ui' }}>
        <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}} />
        <h2 className="text-[#fcd34d] text-xl md:text-3xl mb-12 tracking-widest min-w-[200px] text-left">
          {loadingText}
        </h2>
        <div className="w-64 md:w-96 h-10 bg-[#1a100c] border-[6px] border-[#8b5a2b] p-1 relative shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
           <div className="h-full bg-[#4ade80] animate-[load_2.5s_steps(10)_forwards]"></div>
        </div>
        <p className="mt-8 text-[#e6c17a] text-[10px] md:text-xs uppercase animate-pulse">{subText}</p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes load {
            0% { width: 0%; }
            20% { width: 20%; }
            40% { width: 30%; }
            60% { width: 60%; }
            80% { width: 90%; }
            100% { width: 100%; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen font-mono text-[#5c4033] font-bold overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-[#ff8c00] selection:text-white"
         style={{ fontFamily: '"Press Start 2P", system-ui' }}>
      
      <PixelWater />

      <div className="relative z-10">
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          @keyframes pixel-drip {
            0% { transform: translateY(0); opacity: 1; height: 6px; }
            70% { opacity: 1; }
            100% { transform: translateY(80px); opacity: 0; height: 16px; }
          }
        `}} />

      <button 
        onClick={onExit}
        className="fixed top-4 right-4 md:top-8 md:right-8 z-50 text-sm tracking-widest uppercase bg-[#e6c17a] border-4 border-[#8b5a2b] text-[#4a2e1b] hover:bg-[#d4a373] transition-colors duration-300 focus:outline-none rounded-sm px-4 py-2 drop-shadow-md"
      >
        Exit
      </button>

      {/* Section 1: Hero */}
      <section className="w-full h-screen flex flex-col items-center justify-center p-6 bg-transparent relative">
        <div className={`relative transition-all duration-[1200ms] ease-out ${showName ? 'scale-100 blur-none opacity-100 brightness-100' : 'scale-[0.4] blur-xl opacity-0 brightness-50'}`}>
          <h1 className="text-4xl md:text-6xl lg:text-8xl tracking-widest text-[#fcd34d] drop-shadow-[8px_8px_0_rgba(0,0,0,0.5)] text-center px-4 leading-normal select-none pointer-events-none relative z-10" style={{ textShadow: "6px 6px 0px #8b5a2b, -3px -3px 0px #4a2e1b, 3px -3px 0px #4a2e1b, -3px 3px 0px #4a2e1b, 3px 3px 0px #4a2e1b" }}>
            Veol Steve Jose
          </h1>
          
          {isDripping && (
            <div className="absolute inset-x-0 bottom-2 md:bottom-4 h-0 pointer-events-none z-0">
              {drops.map((drop, i) => (
                <div 
                  key={i}
                  className="absolute transition-opacity duration-300"
                  style={{
                    left: `${drop.left}%`,
                    width: `${drop.size}px`,
                    height: `${drop.size}px`,
                    backgroundColor: drop.color,
                    animation: `pixel-drip ${drop.duration}s linear infinite`,
                    animationDelay: `${drop.delay}s`,
                    boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.2)'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className={`absolute bottom-16 transition-opacity duration-1000 delay-1000 ${showName ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-[#4a2e1b] bg-[#e6c17a]/95 px-6 py-3 border-4 border-[#8b5a2b] shadow-[4px_4px_0_rgba(0,0,0,0.5)] pointer-events-none animate-bounce">
            V Scroll V
          </div>
        </div>
      </section>

      {/* Section 1.5: Inventory / About */}
      <section className="w-full flex flex-col items-center justify-center p-6 py-20 bg-transparent min-h-screen">
        <div className="max-w-6xl w-full bg-[#f4e2b0] border-[#8b5a2b] border-[16px] p-8 md:p-14 shadow-[16px_16px_0_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-12 relative">
          <div className="absolute inset-0 border-[6px] border-[#cf9e5c] pointer-events-none"></div>

          <div className="w-full md:w-2/5 flex flex-col items-center justify-center gap-8 z-10 mt-4 md:mt-0">
            <div className="w-84 h-100 bg-[#dfbb85] border-8 border-[#8b5a2b] shadow-[inset_6px_6px_0_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative overflow-hidden">
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover object-top scale-125" />
            </div>
            <h2 className="text-xs md:text-sm text-[#4a2e1b] bg-[#dfbb85] border-[6px] border-[#8b5a2b] px-6 py-4 w-full max-w-[250px] text-center tracking-widest shadow-[6px_6px_0_rgba(0,0,0,0.2)]">CS ENGINEER</h2>
          </div>
          
          <div className="w-full md:w-3/5 flex flex-col justify-center gap-10 z-10 pt-2">
            <div className="bg-[#dfbb85] border-[6px] border-[#8b5a2b] p-8 shadow-[inset_6px_6px_0_rgba(0,0,0,0.1)]">
              <h2 className="text-base md:text-xl uppercase tracking-widest text-[#4a2e1b] border-b-4 border-[#8b5a2b] pb-3 mb-6 inline-block">Profile Stats</h2>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-[2.5]">
                CS Engineer & Aspiring Game Developer.
                <br/><br/>
                "I am confident in my abilities as a CS Engineer. I welcome any questions and am committed to answering them with complete honesty."
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <a href="https://github.com/weeeol" target="_blank" rel="noreferrer" className="aspect-square bg-[#dfbb85] border-[6px] border-[#8b5a2b] flex items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none">
                 <svg viewBox="0 0 24 24" width="32" height="32" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href="mailto:veolstevejose@gmail.com" className="aspect-square bg-[#dfbb85] border-[6px] border-[#8b5a2b] flex items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none">
                 <svg viewBox="0 0 24 24" width="32" height="32" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <a href="https://www.linkedin.com/in/veolstevejose" target="_blank" rel="noreferrer" className="aspect-square bg-[#dfbb85] border-[6px] border-[#8b5a2b] flex items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none">
                 <svg viewBox="0 0 24 24" width="32" height="32" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <div className="aspect-square bg-[#dfbb85] border-[6px] border-[#8b5a2b] opacity-40 shadow-inner"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Tech Arsenal */}
     <section className="w-full flex flex-col items-center justify-center p-6 py-12 bg-transparent">
        {/* ADDED class 'bulletin-board' here to act as the boundary anchor for the notes */}
        <div className="bulletin-board max-w-7xl w-full text-center space-y-12 bg-[#e6c17a]/95 border-[16px] border-[#8b5a2b] p-8 md:p-16 shadow-[12px_12px_0_rgba(0,0,0,0.5)] relative">
          
          <div className="absolute top-4 left-4 w-8 h-8 bg-red-600 rounded-full shadow-md border-b-4 border-red-800"></div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full shadow-md border-b-4 border-blue-800"></div>
          
          <h2 className="text-2xl md:text-3xl uppercase tracking-widest text-[#4a2e1b] border-b-4 border-[#8b5a2b] pb-4 inline-block">Bulletin Board: Skills</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-16 text-sm lg:text-base pt-12 pb-8 h-auto lg:h-[400px]">
            <DraggableNote 
               title="Languages" 
               initialRotation={-2}
               content="C, C++, C#, Java, Python <br/>JavaScript, React, Kotlin, Lua <br/>HTML5, CSS3, Bash Script" 
            />
            <DraggableNote 
               title="Game Dev & Design" 
               initialRotation={1}
               content="Unreal Engine, Unity <br/>Blender, GIMP" 
            />
            <DraggableNote 
               title="Tools & Frameworks" 
               initialRotation={-1}
               content="Node.js, Next.js, FastAPI, Qt <br/>SQLite, MySQL, CMake, NPM <br/>Vercel, Render, Raspberry Pi, LaTeX" 
            />
          </div>
        </div>
      </section>

      {/* Section 3: Town Ledger */}
      <section className="w-full flex flex-col items-center justify-start p-6 py-12 bg-transparent">
         <div className="max-w-6xl w-full space-y-16 bg-[#fff9e6]/95 border-x-[16px] border-[#8b5a2b] p-10 shadow-[10px_10px_0_rgba(0,0,0,0.4)]">
          <h2 className="text-2xl md:text-4xl uppercase tracking-widest text-[#8b5a2b] text-center border-b-8 border-dashed border-[#8b5a2b] pb-6">Town Ledger: Projects</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            
            <a href="https://github.com/weeeol/Flowmake" target="_blank" rel="noreferrer" className="md:col-span-2 block space-y-4 group cursor-pointer text-center bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform rotate-1 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-xl md:text-2xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Flowmake</h3>
              <p className="text-xs md:text-sm lg:text-base text-[#4a2e1b] max-w-2xl mx-auto leading-relaxed md:leading-loose">
                Full-stack application that automatically converts Python source code into modern, professional flowcharts by parsing the Abstract Syntax Tree (AST).
              </p>
            </a>

            <a href="https://github.com/vinish-dev/WinterHackathon-NoLatency" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform -rotate-1 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-lg md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">ExplainIt</h3>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                Static analysis and AI tool that explains code functionality and breaking points without ever modifying or uploading the source code.
              </p>
            </a>

            <a href="https://github.com/weeeol/ActivityApp" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform rotate-2 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-lg md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Activity App</h3>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                Developed in C using Hash Tables, Linked Lists, and Queues to provide real-time stock lookup and order processing for small businesses.
              </p>
            </a>

            <a href="https://github.com/weeeol/ProtoPlay" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform -rotate-2 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-lg md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">ProtoPlay</h3>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                An experimental game project built with Pygame, serving as a foundation for testing mechanics, sprite movement, and input handling.
              </p>
            </a>

            <a href="https://github.com/weeeol/Text_Editor" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform rotate-1 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-lg md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Text Editor</h3>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                A lightweight desktop text editor engineered with Python and Tkinter, supporting rapid file operations and editing.
              </p>
            </a>

          </div>
        </div>
      </section>

      {/* Final Footer */}
      <footer className="w-full flex items-center justify-center p-6 bg-[#4a2e1b] text-[10px] md:text-xs text-[#e6c17a] border-t-8 border-[#8b5a2b] shadow-[inset_0_4px_0_rgba(0,0,0,0.2)] mt-12">
        <div className="w-full py-4 text-center tracking-widest leading-loose">
          © 2026 Veol Steve Jose — made with React, Canvas, and Tailwind
        </div>
      </footer>
      </div>
    </div>
  );
};

export default PortfolioGUI;