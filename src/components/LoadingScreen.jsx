import React, { useState, useEffect } from 'react';
import woodTexture from '../assets/wood.png'; 

const LoadingScreen = ({ loadingText, subText }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // PortfolioGUI handles 2500ms total. We'll simulate 50 intervals of 50ms (2% each)
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Remove the animated dots from the prop text so we can use a pure blinking cursor
  const cleanLoadingText = loadingText.replace(/\./g, '');

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center font-mono z-[100] overflow-hidden bg-[#2d1b14]" 
         style={{ fontFamily: '"Press Start 2P", system-ui' }}>
      
      {/* Background Texture with Dark Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-repeat opacity-40 pointer-events-none" 
        style={{ backgroundImage: `url(${woodTexture})`, backgroundSize: '250px' }} 
      />
      <div className="absolute inset-0 z-0 bg-black/50 pointer-events-none" />

      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%'
        }}
      />
      <div className="absolute inset-0 z-50 pointer-events-none bg-black/5 animate-[pulse_4s_ease-in-out_infinite]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4">
        <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');` }} />
        
        {/* Title with blinking cursor */}
        <h2 className="text-[#fcd34d] text-xl md:text-3xl mb-8 tracking-widest w-full max-w-md text-left drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
          {cleanLoadingText}
          <span className="animate-[pulse_1s_step-end_infinite] ml-1">_</span>
        </h2>

        {/* Progress Bar Container */}
        <div className="flex items-center gap-4 mb-4 w-full justify-center">
          <div className="w-64 md:w-96 h-10 bg-[#1a100c] border-[6px] border-[#8b5a2b] p-1 relative shadow-[8px_8px_0_rgba(0,0,0,0.8)] overflow-hidden">
            <div 
              className="h-full bg-[#4ade80] shadow-[0_0_15px_#4ade80] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
            {/* Glossy overlay on bar */}
            <div className="absolute top-0 left-0 w-full h-1/3 bg-white/20 pointer-events-none"></div>
          </div>
          
          {/* Percentage */}
          <div className="text-[#4ade80] text-sm md:text-lg min-w-[60px] text-right drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
            {progress}%
          </div>
        </div>

        {/* Dynamic Typewriter Subtext */}
        <p className="mt-6 text-[#e6c17a] text-[10px] md:text-xs uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] h-4 text-center">
          &gt; {subText}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
