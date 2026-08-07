import React from 'react';

const LoadingScreen = ({ loadingText, subText }) => {
  return (
    <div className="fixed inset-0 bg-[#2d1b14] flex flex-col items-center justify-center font-mono z-[100]" style={{ fontFamily: '"Press Start 2P", system-ui' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');` }} />
      <h2 className="text-[#fcd34d] text-xl md:text-3xl mb-12 tracking-widest min-w-[200px] text-left">
        {loadingText}
      </h2>
      <div className="w-64 md:w-96 h-10 bg-[#1a100c] border-[6px] border-[#8b5a2b] p-1 relative shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
        <div className="h-full bg-[#4ade80] animate-[load_2.5s_steps(10)_forwards]"></div>
      </div>
      <p className="mt-8 text-[#e6c17a] text-[10px] md:text-xs uppercase animate-pulse">{subText}</p>
      <style dangerouslySetInnerHTML={{
        __html: `
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
};

export default LoadingScreen;
