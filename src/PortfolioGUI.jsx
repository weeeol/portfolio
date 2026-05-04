import React, { useState, useRef } from 'react';
import bgImage from './assets/BG2.png';

const DraggableNote = ({ title, content, initialRotation }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    setIsDragging(true);
    // Support both mouse and touch events
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    
    let newX = clientX - dragStart.current.x;
    let newY = clientY - dragStart.current.y;
    
    // Rough boundaries so they stay on the board
    const BOUND_X = window.innerWidth < 768 ? 150 : 400;
    const BOUND_Y = window.innerWidth < 768 ? 200 : 300;
    
    newX = Math.max(-BOUND_X, Math.min(BOUND_X, newX));
    newY = Math.max(-BOUND_Y, Math.min(BOUND_Y, newY));

    setPosition({
      x: newX,
      y: newY
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
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
      {/* Pin on top of note */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full shadow-md border-b-2 border-gray-600"></div>
      <h3 className="text-[#8b5a2b] tracking-wider text-3xl uppercase mb-4 pointer-events-none">{title}</h3>
      <p className="text-[#4a2e1b] leading-relaxed pointer-events-none" dangerouslySetInnerHTML={{ __html: content }}></p>
    </div>
  );
};

const PortfolioGUI = ({ onExit }) => {
  return (
    // Wrap with the injected Google Font and Stardew styling logic
    <div className="relative w-full h-screen font-mono text-[#5c4033] font-bold overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-[#ff8c00] selection:text-white"
         style={{ 
           fontFamily: '"VT323", monospace',
           backgroundImage: `url(${bgImage})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      
      {/* Inject Google Pixel Font for Stardew Vibes */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
      `}} />

      <button 
        onClick={onExit}
        className="fixed top-4 right-4 md:top-8 md:right-8 z-50 text-xl tracking-widest uppercase bg-[#e6c17a] border-4 border-[#8b5a2b] text-[#4a2e1b] hover:bg-[#d4a373] transition-colors duration-300 focus:outline-none rounded-sm px-4 py-2 drop-shadow-md"
        aria-label="Close graphical interface"
      >
        Close Game
      </button>

      {/* Section 1: Hero (Giant floating wooden sign) */}
      <section className="w-full flex flex-col items-center justify-center p-6 pt-24 pb-16 bg-transparent min-h-[75vh]">
        <div className="max-w-4xl text-center space-y-6 pointer-events-none bg-[#e6c17a]/90 backdrop-blur-sm border-8 border-[#8b5a2b] rounded-lg p-10 drop-shadow-[8px_8px_0_rgba(0,0,0,0.4)]">
          <h1 className="text-5xl md:text-8xl tracking-widest text-[#fcd34d] drop-shadow-[4px_4px_0_#8b5a2b]" style={{ textShadow: "4px 4px 0px #8b5a2b, -2px -2px 0px #4a2e1b, 2px -2px 0px #4a2e1b, -2px 2px 0px #4a2e1b, 2px 2px 0px #4a2e1b" }}>
            Veol Steve Jose
          </h1>
          <p className="text-2xl md:text-4xl text-[#4a2e1b] tracking-wide pt-4">
            CS Engineer & Aspiring Game Developer.
          </p>
          
          <div className="flex justify-center gap-6 pt-6 pointer-events-auto">
            <a href="https://github.com/weeeol" target="_blank" rel="noreferrer" className="text-[#8b5a2b] hover:text-[#fcd34d] bg-[#4a2e1b] p-3 rounded-full hover:scale-110 transition-all duration-300 border-4 border-transparent hover:border-[#8b5a2b]">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="mailto:veolstevejose@gmail.com" className="text-[#8b5a2b] hover:text-[#fcd34d] bg-[#4a2e1b] p-3 rounded-full hover:scale-110 transition-all duration-300 border-4 border-transparent hover:border-[#8b5a2b]">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>

          <div className="pt-8">
            <div className="text-2xl uppercase tracking-widest text-[#4a2e1b] animate-pulse">
              - Scroll to Explore -
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Tech Arsenal (Wooden Bulletin Board) */}
     <section className="w-full flex flex-col items-center justify-center p-6 py-12 bg-transparent">
        <div className="max-w-7xl w-full text-center space-y-12 bg-[#e6c17a]/95 border-[16px] border-[#8b5a2b] p-8 md:p-16 shadow-[12px_12px_0_rgba(0,0,0,0.5)] relative">
          
          {/* Bulletin Board Pins */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-red-600 rounded-full shadow-md border-b-4 border-red-800"></div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full shadow-md border-b-4 border-blue-800"></div>
          
          <h2 className="text-5xl uppercase tracking-widest text-[#4a2e1b] border-b-4 border-[#8b5a2b] pb-4 inline-block">Bulletin Board: Skills</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-16 text-2xl pt-12 pb-8 h-[400px]">
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

      {/* Section 3: About Me (Dialogue Box) */}
      <section className="w-full flex flex-col items-center justify-center p-6 py-12 bg-transparent">
         <div className="relative max-w-4xl w-full text-left bg-[#e6c17a]/90 backdrop-blur-sm border-8 border-[#8b5a2b] rounded-lg p-10 drop-shadow-[8px_8px_0_rgba(0,0,0,0.4)] pointer-events-none">
          <h2 className="text-3xl uppercase tracking-widest text-[#4a2e1b] mb-6">Dialogue</h2>
          <div className="text-3xl md:text-5xl leading-snug text-[#4a2e1b]">
            "I am confident in my abilities as a CS Engineer. I welcome any questions and am committed to answering them with complete honesty."
          </div>
          {/* Pulsing dialogue triangle */}
          <div className="absolute bottom-6 right-6 w-0 h-0 border-l-[12px] border-l-transparent border-t-[20px] border-t-[#8b5a2b] border-r-[12px] border-r-transparent animate-bounce"></div>
        </div>
      </section>

      {/* Section 4: Projects (Notice Board) */}
      <section className="w-full flex flex-col items-center justify-start p-6 py-12 bg-transparent">
         <div className="max-w-6xl w-full space-y-16 bg-[#fff9e6]/95 border-x-[16px] border-[#8b5a2b] p-10 shadow-[10px_10px_0_rgba(0,0,0,0.4)]">
          <h2 className="text-5xl uppercase tracking-widest text-[#8b5a2b] text-center border-b-8 border-dashed border-[#8b5a2b] pb-6">Town Ledger: Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            
            <a href="https://github.com/weeeol/Flowmake" target="_blank" rel="noreferrer" className="md:col-span-2 block space-y-4 group cursor-pointer text-center bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform rotate-1 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-4xl md:text-5xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Flowmake</h3>
              <p className="text-2xl text-[#4a2e1b] max-w-2xl mx-auto">
                Full-stack application that automatically converts Python source code into modern, professional flowcharts by parsing the Abstract Syntax Tree (AST).
              </p>
            </a>

            <a href="https://github.com/vinish-dev/WinterHackathon-NoLatency" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform -rotate-1 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-3xl md:text-4xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">ExplainIt</h3>
              <p className="text-2xl text-[#4a2e1b] leading-relaxed">
                Static analysis and AI tool that explains code functionality and breaking points without ever modifying or uploading the source code.
              </p>
            </a>

            <a href="https://github.com/weeeol/ActivityApp" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform rotate-2 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-3xl md:text-4xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Activity App</h3>
              <p className="text-2xl text-[#4a2e1b] leading-relaxed">
                Developed in C using Hash Tables, Linked Lists, and Queues to provide real-time stock lookup and order processing for small businesses.
              </p>
            </a>

            <a href="https://github.com/weeeol/ProtoPlay" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform -rotate-2 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-3xl md:text-4xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">ProtoPlay</h3>
              <p className="text-2xl text-[#4a2e1b] leading-relaxed">
                An experimental game project built with Pygame, serving as a foundation for testing mechanics, sprite movement, and input handling.
              </p>
            </a>

            <a href="https://github.com/weeeol/Text_Editor" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform rotate-1 hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-3xl md:text-4xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Text Editor</h3>
              <p className="text-2xl text-[#4a2e1b] leading-relaxed">
                A lightweight desktop text editor engineered with Python and Tkinter, supporting rapid file operations and editing.
              </p>
            </a>

          </div>
        </div>
      </section>

      {/* Final Footer */}
      <footer className="w-full flex items-center justify-center p-6 bg-[#4a2e1b] text-xl text-[#e6c17a] border-t-8 border-[#8b5a2b] shadow-[inset_0_4px_0_rgba(0,0,0,0.2)] mt-12">
        <div className="w-full py-4 text-center tracking-widest">
          © 2026 Veol Steve Jose — made with React, Canvas, and Tailwind
        </div>
      </footer>
    </div>
  );
};

export default PortfolioGUI;