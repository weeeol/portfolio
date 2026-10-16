import { useState, useEffect } from 'react';

const HeroSection = ({ showName, isDripping, drops }) => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (!showName) {
      return;
    }

    // Once it has faded in, start the continuous pulse animation (2000ms)
    const timer2 = setTimeout(() => setIsPulsing(true), 2000);

    return () => {
      clearTimeout(timer2);
      setIsPulsing(false);
    };
  }, [showName]);

  return (
    <section id="hero" className="w-full min-h-screen snap-start flex flex-col items-center justify-center p-6 bg-transparent relative pb-20">
      <div className={`relative transition-all duration-[1200ms] ease-out ${showName ? 'scale-100 blur-none opacity-100 brightness-100' : 'scale-[0.4] blur-xl opacity-0 brightness-50'}`}>
        <h1 
          className={`hero-name text-3xl md:text-5xl lg:text-7xl tracking-widest text-center px-4 leading-normal select-none pointer-events-none relative z-10 transition-all duration-1000 ease-in-out ${isPulsing ? 'name-glow-pulse' : ''}`}
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
