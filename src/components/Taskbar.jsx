import React, { useState, useEffect } from 'react';

const Taskbar = ({ waterEnabled, setWaterEnabled, activeSection, scrollToSection, showSideNav }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const handleScrollToSection = (section) => {
    scrollToSection(section);
    setShowMobileMenu(false);
    setShowSettings(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Main Taskbar */}
      <div className="bg-[#e6c17a] border-b-4 border-[#8b5a2b] shadow-[0_4px_0_rgba(0,0,0,0.3)] h-12 md:h-14 flex items-center justify-between px-2 md:px-4 gap-2 relative z-50">
        
        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`h-8 md:h-10 px-3 md:px-4 bg-[#4a2e1b] hover:bg-[#5c4033] text-[#e6c17a] border-2 md:border-4 border-[#8b5a2b] transition-all flex items-center gap-2 ${showSettings ? 'border-b-2 border-r-2 translate-y-[2px]' : 'border-b-4 md:border-b-[6px] border-r-4 md:border-r-[6px] active:border-b-2 active:border-r-2 active:translate-y-[2px]'}`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span className="text-[10px] md:text-xs tracking-widest uppercase mt-1 hidden sm:block">Settings</span>
          </button>
          
          {/* Settings Dropdown */}
          {showSettings && (
            <div className="absolute top-[calc(100%+8px)] left-0 bg-[#f4e2b0] border-[4px] border-[#8b5a2b] shadow-[6px_6px_0_rgba(0,0,0,0.5)] p-4 min-w-[200px] flex flex-col gap-4">
              <div className="text-[10px] md:text-xs text-[#8b5a2b] border-b-2 border-[#8b5a2b] pb-2 tracking-widest uppercase text-center font-bold">
                System Options
              </div>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-[8px] md:text-[10px] text-[#4a2e1b] tracking-widest uppercase mr-4">Pixel Water</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={waterEnabled}
                    onChange={(e) => setWaterEnabled(e.target.checked)}
                  />
                  <div className={`w-10 h-6 border-2 border-[#8b5a2b] transition-colors flex items-center ${waterEnabled ? 'bg-[#4ade80]' : 'bg-[#e6c17a]'}`}>
                    <div className={`w-4 h-4 bg-[#4a2e1b] border border-[#8b5a2b] transform transition-transform ${waterEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>

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
              onClick={() => handleScrollToSection(section)}
              className={`text-[10px] md:text-[12px] tracking-widest uppercase px-3 py-1.5 md:px-4 md:py-2 transition-all duration-200 border-2 md:border-[3px] ${activeSection === section
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
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden bg-[#dfbb85] border-t-2 border-[#8b5a2b] shadow-[0_4px_0_rgba(0,0,0,0.3)] z-40 relative">
          <nav className="flex flex-col">
            {['hero', 'about', 'skills', 'projects'].map((section) => (
              <button
                key={section}
                onClick={() => handleScrollToSection(section)}
                className={`text-[12px] tracking-widest uppercase px-4 py-3 transition-all duration-200 border-b border-[#8b5a2b] ${activeSection === section
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
  );
};

export default Taskbar;
