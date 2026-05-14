import React, { useState, useRef, useEffect } from 'react';
import profileImage from './assets/Profile.png';
import woodTexture from './assets/wood.png';
import paperTexture from './assets/paper1.png';
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
        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        backgroundImage: `url(${paperTexture})`,
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply'
      }}
      className="bg-[#fff9e6] p-6 border-4 border-[#cf9e5c] shadow-lg flex-1 hover:z-20 select-none pointer-events-auto relative"
    >
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full shadow-md border-b-2 border-gray-600"></div>
      <h3 className="text-[#8b5a2b] tracking-wider text-xl md:text-2xl uppercase mb-4 pointer-events-none">{title}</h3>
      <p className="text-[#4a2e1b] text-xs md:text-sm leading-relaxed md:leading-loose pointer-events-none" dangerouslySetInnerHTML={{ __html: content }}></p>
    </div>
  );
};

const PortfolioGUI = ({ onToggleTerminal, isTerminalOpen }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading");
  const [subText, setSubText] = useState("Generating world...");
  
  // Animation states
  const [showName, setShowName] = useState(false);
  const [isDripping, setIsDripping] = useState(false);
  const [drops, setDrops] = useState([]);
  
  // Scroll Navigation State
  const [activeSection, setActiveSection] = useState('hero');
  const [showSideNav, setShowSideNav] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Mail copied state
  const [showCopied, setShowCopied] = useState(false);
  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText("veolstevejose@gmail.com");
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Retro Taskbar Time state
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

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

  // Scroll listener for side navigation
  const handleScroll = (e) => {
    const scrollY = e.currentTarget.scrollTop;
    const windowHeight = window.innerHeight;
    
    // Show side nav only when scrolled past 50% of the hero section
    setShowSideNav(scrollY > windowHeight * 0.5);

    // Determine active section based on scroll position
    const sections = ['hero', 'about', 'skills', 'projects'];
    let current = 'hero';
    
    for (const section of sections) {
      const el = document.getElementById(section);
      if (el && scrollY >= el.offsetTop - windowHeight * 0.3) {
        current = section;
      }
    }
    setActiveSection(current);
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setShowMobileMenu(false);
    }
  };

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
    <div className="relative w-full h-screen font-mono text-[#5c4033] font-bold overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-[#ff8c00] selection:text-white snap-y snap-proximity"
         onScroll={handleScroll}
         style={{ fontFamily: '"Press Start 2P", system-ui' }}>
      
      <PixelWater isPaused={isTerminalOpen} />

      <div className="relative z-10">
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          @keyframes pixel-drip {
            0% { transform: translateY(0); opacity: 1; height: 6px; }
            70% { opacity: 1; }
            100% { transform: translateY(80px); opacity: 0; height: 16px; }
          }
        `}} />

      {/* Section 1: Hero */}
      <section id="hero" className="w-full min-h-screen snap-start flex flex-col items-center justify-center p-6 bg-transparent relative pb-20">
        <div className={`relative transition-all duration-[1200ms] ease-out ${showName ? 'scale-100 blur-none opacity-100 brightness-100' : 'scale-[0.4] blur-xl opacity-0 brightness-50'}`}>
          <h1 className="text-3xl md:text-5xl lg:text-7xl tracking-widest text-[#fcd34d] drop-shadow-[6px_6px_0_rgba(0,0,0,0.5)] text-center px-4 leading-normal select-none pointer-events-none relative z-10" style={{ textShadow: "4px 4px 0px #8b5a2b, -2px -2px 0px #4a2e1b, 2px -2px 0px #4a2e1b, -2px 2px 0px #4a2e1b, 2px 2px 0px #4a2e1b" }}>
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
      </section>

      {/* Section 1.5: Inventory / About */}
      <section id="about" className="w-full flex flex-col items-center justify-center p-4 bg-transparent min-h-screen snap-start">
        <div className="max-w-5xl w-full bg-[#f4e2b0] border-[#8b5a2b] border-[12px] p-6 md:p-10 shadow-[10px_10px_0_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-8 relative">
          <div className="absolute inset-0 border-[4px] border-[#cf9e5c] pointer-events-none"></div>

          <div className="w-full md:w-2/5 flex flex-col items-center justify-center gap-6 z-10 mt-4 md:mt-0">
            <div className="w-64 h-80 bg-[#dfbb85] border-8 border-[#8b5a2b] shadow-[inset_6px_6px_0_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative overflow-hidden">
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover object-top scale-[1.15]" />
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
              
              <div className="relative aspect-square">
                <button onClick={handleCopyEmail} className="w-full h-full bg-[#dfbb85] border-[6px] border-[#8b5a2b] flex items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none cursor-pointer">
                  <svg viewBox="0 0 24 24" width="32" height="32" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </button>
                {showCopied && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#4a2e1b] text-[#e6c17a] text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none animate-fade-in-up">
                    Copied!
                  </div>
                )}
              </div>

              <a href="https://www.linkedin.com/in/veolstevejose" target="_blank" rel="noreferrer" className="aspect-square bg-[#dfbb85] border-[6px] border-[#8b5a2b] flex items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none">
                 <svg viewBox="0 0 24 24" width="32" height="32" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <div className="aspect-square bg-[#dfbb85] border-[6px] border-[#8b5a2b] opacity-40 shadow-inner"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Tech Arsenal */}
     <section id="skills" className="w-full flex flex-col items-center justify-center p-4 bg-transparent min-h-screen snap-start">
        <div 
          className="bulletin-board max-w-6xl w-full text-center bg-[#e6c17a]/95 border-[12px] border-[#8b5a2b] p-6 md:p-15 shadow-[10px_10px_0_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col justify-center items-center"
          style={{ backgroundImage: `url(${woodTexture})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}
        >
          
          <div className="absolute top-4 left-4 w-6 h-6 bg-red-600 rounded-full shadow-md border-b-4 border-red-800"></div>
          <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full shadow-md border-b-4 border-blue-800"></div>
          
          <h2 className="text-xl md:text-2xl uppercase tracking-widest text-[#4a2e1b] border-b-4 border-[#8b5a2b] pb-3 inline-block mt-4">Bulletin Board: Skills</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-xs lg:text-sm pt-8 pb-4 h-auto lg:h-[350px] w-full">
            <DraggableNote 
               title="Languages" 
               initialRotation={-2}
               content="C, C++, C#, Java, Python <br/>JavaScript, React, Kotlin, Lua <br/>HTML, CSS, Bash Script" 
            />
            <DraggableNote 
               title="Game Dev & Design" 
               initialRotation={1}
               content="Unreal Engine, Unity <br/>Blender, GIMP" 
            />
            <DraggableNote 
               title="Tools & Frameworks" 
               initialRotation={-1}
               content="Node.js, Next.js, FastAPI, Qt <br/>SQLite, MySQL, CMake, NPM <br/>Vercel, Render, Raspberry Pi, LaTeX, Git, Linux" 
            />
          </div>
        </div>
      </section>

      {/* Section 3: Town Ledger */}
      <section id="projects" className="w-full flex flex-col items-center justify-center p-4 bg-transparent min-h-screen snap-start">
         <div className="max-w-5xl w-full space-y-12 bg-[#fff9e6]/95 border-x-[12px] border-[#8b5a2b] p-8 pb-12 shadow-[8px_8px_0_rgba(0,0,0,0.4)] relative">
          <h2 className="text-xl md:text-3xl uppercase tracking-widest text-[#8b5a2b] text-center border-b-6 border-dashed border-[#8b5a2b] pb-4">Town Ledger: Projects</h2>

          <div className="flex flex-col gap-y-12">
            
            <a href="https://github.com/weeeol/Flowmake" target="_blank" rel="noreferrer" className="block space-y-4 group cursor-pointer text-center bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-xl md:text-2xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Flowmake</h3>
              <p className="text-xs md:text-sm lg:text-base text-[#4a2e1b] max-w-2xl mx-auto leading-relaxed md:leading-loose">
                Full-stack application that automatically converts Python source code into modern, professional flowcharts by parsing the Abstract Syntax Tree (AST).
              </p>
            </a>

            <a href="https://github.com/vinish-dev/WinterHackathon-NoLatency" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-lg md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">ExplainIt</h3>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                Static analysis and AI tool that explains code functionality and breaking points without ever modifying or uploading the source code.
              </p>
            </a>

            <a href="https://github.com/weeeol/ActivityApp" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-lg md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Activity App</h3>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                Developed in Kotlin for Android, this app helps users track and manage their daily activities with a clean interface and efficient performance.
              </p>
            </a>

            <a href="https://github.com/weeeol/ProtoPlay" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-lg md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">ProtoPlay</h3>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                An experimental game project built with Pygame, serving as a foundation for testing mechanics, sprite movement, and input handling.
              </p>
            </a>

            <a href="https://github.com/weeeol/Text_Editor" target="_blank" rel="noreferrer" className="block space-y-3 group cursor-pointer bg-[#e6c17a] p-8 border-4 border-[#8b5a2b] shadow-md transform hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
              <h3 className="text-lg md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">Text Editor</h3>
              <p className="text-xs md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                A lightweight desktop text editor engineered with Python and Tkinter, supporting rapid file operations and editing.
              </p>
            </a>

          </div>
        </div>
      </section>
      
      {/* Final Footer */}
      <footer className="w-full flex items-center justify-center p-2 md:p-4 bg-[#4a2e1b] text-[8px] md:text-[10px] text-[#e6c17a] border-t-4 md:border-t-8 border-[#8b5a2b] shadow-[inset_0_4px_0_rgba(0,0,0,0.2)] z-10 relative pb-16">
        <div className="w-full text-center tracking-widest leading-loose">
          © 2026 Veol Steve Jose — made with React, Canvas, and Tailwind
        </div>
      </footer>
      
      {/* 8-bit Top Taskbar */}
      <div className="fixed top-0 left-0 right-0 bg-[#e6c17a] border-b-4 border-[#8b5a2b] shadow-[0_4px_0_rgba(0,0,0,0.3)] z-50 flex flex-col">
        {/* Main Taskbar */}
        <div className="h-12 md:h-14 flex items-center justify-between px-2 md:px-4 gap-2">
          {/* Start Button / Terminal Access */}
          <button 
            onClick={onToggleTerminal}
            className="h-8 md:h-10 px-3 md:px-4 bg-[#4a2e1b] hover:bg-[#5c4033] text-[#e6c17a] border-2 md:border-4 border-b-4 md:border-b-[6px] border-r-4 md:border-r-[6px] border-[#8b5a2b] active:border-b-2 active:border-r-2 active:translate-y-[2px] transition-all flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            <span className="text-[10px] md:text-xs tracking-widest uppercase mt-1 hidden sm:block">Terminal</span>
          </button>

          {/* Mobile Name Display - Shows when scrolled down */}
          {showSideNav && (
            <div className="md:hidden text-[10px] tracking-widest uppercase text-[#4a2e1b] font-bold whitespace-nowrap">
              Veol Steve Jose
            </div>
          )}

          {/* Section Navigation Links - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-2 md:gap-4 lg:gap-6">
            {['hero', 'about', 'skills', 'projects'].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`text-[10px] md:text-[12px] tracking-widest uppercase px-3 py-1.5 md:px-4 md:py-2 transition-all duration-200 border-2 md:border-[3px] ${
                  activeSection === section 
                    ? 'bg-[#8b5a2b] text-[#e6c17a] border-[#4a2e1b] shadow-inner font-bold' 
                    : 'bg-transparent text-[#4a2e1b] border-transparent hover:bg-[#dfbb85] hover:border-[#8b5a2b]'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>

          {/* Hamburger Menu Button - Visible only on Mobile */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden h-8 px-2 bg-[#4a2e1b] hover:bg-[#5c4033] text-[#e6c17a] border-2 border-b-4 border-r-4 border-[#8b5a2b] active:border-b-2 active:border-r-2 active:translate-y-[2px] transition-all flex flex-col items-center justify-center gap-1"
          >
            <div className="w-5 h-0.5 bg-[#e6c17a]"></div>
            <div className="w-5 h-0.5 bg-[#e6c17a]"></div>
            <div className="w-5 h-0.5 bg-[#e6c17a]"></div>
          </button>

          {/* System Tray (Clock) */}
          <div className="h-8 md:h-10 px-3 bg-[#cf9e5c] border-2 md:border-4 border-t-4 md:border-t-[6px] border-l-4 md:border-l-[6px] border-[#8b5a2b] shadow-inner flex items-center justify-center text-[#4a2e1b] hidden sm:flex">
            <span className="text-[10px] md:text-xs tracking-widest drop-shadow-[1px_1px_0_rgba(255,255,255,0.3)] mt-1">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
            </span>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden bg-[#dfbb85] border-t-2 border-[#8b5a2b] shadow-[0_4px_0_rgba(0,0,0,0.3)]">
            <nav className="flex flex-col">
              {['hero', 'about', 'skills', 'projects'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-[12px] tracking-widest uppercase px-4 py-3 transition-all duration-200 border-b border-[#8b5a2b] ${
                    activeSection === section 
                      ? 'bg-[#8b5a2b] text-[#e6c17a] font-bold' 
                      : 'bg-[#dfbb85] text-[#4a2e1b] hover:bg-[#e6c17a]'
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default PortfolioGUI;