import { useState, useEffect } from 'react';
import PixelWater from './PixelWater';
import LoadingScreen from './components/LoadingScreen';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsBoard from './components/SkillsBoard';
import ProjectLedger from './components/ProjectLedger';
import Taskbar from './components/Taskbar';
import BG2 from './assets/BG2.png';
import { useVeolCode } from './hooks/useVeolCode';
import MiniGame from './components/MiniGame';

const PortfolioGUI = ({ waterEnabled, setWaterEnabled, onReplayBootIntro }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading");
  const [subText, setSubText] = useState("Generating world...");
  const { success: showMiniGame, setSuccess: setShowMiniGame } = useVeolCode();

  // Animation states
  const [showName, setShowName] = useState(false);
  const [isDripping, setIsDripping] = useState(false);
  const [drops] = useState(() => Array.from({ length: 35 }).map(() => ({
    left: 10 + Math.random() * 80,
    delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.7,
    size: Math.random() > 0.5 ? 4 : 8,
    color: Math.random() > 0.5 ? '#1ca3ec' : '#0e74af'
  })));

  // Scroll Navigation State
  const [activeSection, setActiveSection] = useState('hero');
  const [showSideNav, setShowSideNav] = useState(false);

  useEffect(() => {

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

          window.dispatchEvent(new CustomEvent('trigger-splash', { detail: { x: w / 2, y: y, strength: 4000, size: 4 } }));
          window.dispatchEvent(new CustomEvent('trigger-splash', { detail: { x: w / 2 - 200, y: y, strength: 3000, size: 3 } }));
          window.dispatchEvent(new CustomEvent('trigger-splash', { detail: { x: w / 2 + 200, y: y, strength: 3000, size: 3 } }));

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
    }
  };

  if (isLoading) {
    return <LoadingScreen loadingText={loadingText} subText={subText} />;
  }

  return (
    <div className="relative w-full h-screen font-mono text-[#5c4033] font-bold overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-[#ff8c00] selection:text-white snap-y snap-proximity"
      onScroll={handleScroll}
      style={{ fontFamily: '"Press Start 2P", system-ui' }}>

      {showMiniGame && <MiniGame onClose={() => setShowMiniGame(false)} />}

      {waterEnabled ? (
        <PixelWater isPaused={false} />
      ) : (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none" 
          style={{ backgroundImage: `url(${BG2})` }} 
        />
      )}

      <div className="relative z-10">
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          @keyframes pixel-drip {
            0% { transform: translateY(0); opacity: 1; height: 6px; }
            70% { opacity: 1; }
            100% { transform: translateY(80px); opacity: 0; height: 16px; }
          }
        `}} />

        <HeroSection showName={showName} isDripping={isDripping} drops={drops} />
        <AboutSection />
        <SkillsBoard />
        <ProjectLedger />

        {/* Final Footer */}
        <footer className="w-full flex items-center justify-center p-2 md:p-4 bg-[#4a2e1b] text-[8px] md:text-[10px] text-[#e6c17a] border-t-4 md:border-t-8 border-[#8b5a2b] shadow-[inset_0_4px_0_rgba(0,0,0,0.2)] z-10 relative pb-16">
          <div className="w-full text-center tracking-widest leading-loose">
            © 2026 Veol Steve Jose — made with React, Canvas, and Tailwind
          </div>
        </footer>

        <Taskbar
          waterEnabled={waterEnabled}
          setWaterEnabled={setWaterEnabled}
          activeSection={activeSection}
          scrollToSection={scrollToSection}
          showSideNav={showSideNav}
          showName={showName}
          onReplayBootIntro={onReplayBootIntro}
        />
      </div>
    </div>
  );
};

export default PortfolioGUI;