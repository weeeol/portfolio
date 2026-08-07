import React, { useState, useEffect } from 'react';

const HeroSection = ({ showName, isDripping, drops }) => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (showName) {
      // Start the glow animation slightly before it completely finishes rising (1000ms)
      const timer1 = setTimeout(() => setIsGlowing(true), 1000);
      // Once it has faded in, start the continuous pulse animation (2000ms)
      const timer2 = setTimeout(() => setIsPulsing(true), 2000);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    } else {
      setIsGlowing(false);
      setIsPulsing(false);
    }
  }, [showName]);

  const baseShadow = "4px 4px 0px #8b5a2b, -2px -2px 0px #4a2e1b, 2px -2px 0px #4a2e1b, -2px 2px 0px #4a2e1b, 2px 2px 0px #4a2e1b, 0 0 25px rgba(252, 211, 77, 0), 0 0 50px rgba(252, 211, 77, 0)";
  const glowMax = "4px 4px 0px #8b5a2b, -2px -2px 0px #4a2e1b, 2px -2px 0px #4a2e1b, -2px 2px 0px #4a2e1b, 2px 2px 0px #4a2e1b, 0 0 25px rgba(252, 211, 77, 0.8), 0 0 50px rgba(252, 211, 77, 0.4)";
  const glowMin = "4px 4px 0px #8b5a2b, -2px -2px 0px #4a2e1b, 2px -2px 0px #4a2e1b, -2px 2px 0px #4a2e1b, 2px 2px 0px #4a2e1b, 0 0 10px rgba(252, 211, 77, 0.4), 0 0 20px rgba(252, 211, 77, 0.1)";

  return (
    <section id="hero" className="w-full min-h-screen snap-start flex flex-col items-center justify-center p-6 bg-transparent relative pb-20">
      <style>
        {`
          @keyframes glowPulse {
            0% { text-shadow: ${glowMax}; }
            50% { text-shadow: ${glowMin}; }
            100% { text-shadow: ${glowMax}; }
          }
          .name-glow-pulse {
            animation: glowPulse 3s infinite ease-in-out;
          }
        `}
      </style>
      <div className={`relative transition-all duration-[1200ms] ease-out ${showName ? 'scale-100 blur-none opacity-100 brightness-100' : 'scale-[0.4] blur-xl opacity-0 brightness-50'}`}>
        <h1 
          className={`text-3xl md:text-5xl lg:text-7xl tracking-widest text-[#fcd34d] drop-shadow-[6px_6px_0_rgba(0,0,0,0.5)] text-center px-4 leading-normal select-none pointer-events-none relative z-10 transition-all duration-1000 ease-in-out ${isPulsing ? 'name-glow-pulse' : ''}`} 
          style={!isPulsing ? { textShadow: isGlowing ? glowMax : baseShadow } : {}}
        >
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
  );
};

export default HeroSection;
