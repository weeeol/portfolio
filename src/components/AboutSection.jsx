import React, { useState } from 'react';
import profileImage from '../assets/Profile.png';

const AboutSection = () => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText("veolstevejose@gmail.com");
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <section id="about" className="w-full flex flex-col items-center justify-center p-4 bg-transparent min-h-screen snap-start">
      <div className="max-w-5xl w-full bg-[#f4e2b0] border-[#8b5a2b] border-[12px] p-6 md:p-10 shadow-[10px_10px_0_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-8 relative">
        <div className="absolute inset-0 border-[4px] border-[#cf9e5c] pointer-events-none"></div>

        <div className="w-full md:w-2/5 flex flex-col items-center justify-center gap-4 md:gap-6 z-10 mt-4 md:mt-0">
          <div className="w-52 h-64 md:w-64 md:h-80 bg-[#dfbb85] border-8 border-[#8b5a2b] shadow-[inset_6px_6px_0_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover object-top scale-[1.15]" />
          </div>
          <div className="flex flex-col gap-2 w-full max-w-[200px] md:max-w-[250px]">
            <h1 className="text-[12px] md:text-sm text-[#e6c17a] bg-[#4a2e1b] border-[4px] md:border-[6px] border-[#8b5a2b] px-4 py-3 md:px-4 md:py-3 text-center tracking-widest font-bold shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
              VEOL STEVE
            </h1>
            <h2 className="text-[10px] md:text-xs text-[#4a2e1b] bg-[#dfbb85] border-[4px] md:border-[6px] border-[#8b5a2b] px-4 py-2 md:px-4 md:py-2 text-center tracking-widest shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
              CS ENGINEER
            </h2>
          </div>
        </div>

        <div className="w-full md:w-3/5 flex flex-col justify-center gap-6 md:gap-10 z-10 pt-2">
          <div className="bg-[#dfbb85] border-[4px] md:border-[6px] border-[#8b5a2b] p-5 md:p-8 shadow-[inset_4px_4px_0_rgba(0,0,0,0.1)] md:shadow-[inset_6px_6px_0_rgba(0,0,0,0.1)]">
            <h2 className="text-sm md:text-xl uppercase tracking-widest text-[#4a2e1b] border-b-4 border-[#8b5a2b] pb-2 md:pb-3 mb-4 md:mb-6 inline-block">Profile Stats</h2>
            <div className="text-[10px] md:text-sm text-[#4a2e1b] leading-loose md:leading-[2.5] flex flex-col gap-2 md:gap-4">
              <p>CS Engineer & Aspiring Game Developer.</p>

              <p className="mt-2 md:mt-4 italic border-l-4 border-[#8b5a2b] pl-3 md:pl-4 bg-[#cf9e5c]/20 py-2 md:py-3 pr-2">
                "I am confident in my abilities as a CS Engineer. I welcome any questions and am committed to answering them with complete honesty."
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 md:gap-6">
            <a href="https://github.com/weeeol" target="_blank" rel="noreferrer" className="aspect-square bg-[#dfbb85] border-[4px] md:border-[6px] border-[#8b5a2b] flex items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[4px_4px_0_rgba(0,0,0,0.2)] md:shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="md:w-8 md:h-8 group-hover:scale-110 transition-transform"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>

            <div className="relative aspect-square">
              <button onClick={handleCopyEmail} className="w-full h-full bg-[#dfbb85] border-[4px] md:border-[6px] border-[#8b5a2b] flex items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[4px_4px_0_rgba(0,0,0,0.2)] md:shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none cursor-pointer">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="md:w-8 md:h-8 group-hover:scale-110 transition-transform"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </button>
              {showCopied && (
                <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 bg-[#4a2e1b] text-[#e6c17a] text-[10px] md:text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none animate-fade-in-up">
                  Copied!
                </div>
              )}
            </div>

            <a href="https://www.linkedin.com/in/veolstevejose" target="_blank" rel="noreferrer" className="aspect-square bg-[#dfbb85] border-[4px] md:border-[6px] border-[#8b5a2b] flex items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[4px_4px_0_rgba(0,0,0,0.2)] md:shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="md:w-8 md:h-8 group-hover:scale-110 transition-transform"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="/resume.pdf" download="Veol_Steve_Jose_Resume.pdf" className="aspect-square bg-[#dfbb85] border-[4px] md:border-[6px] border-[#8b5a2b] flex flex-col items-center justify-center hover:bg-[#e6c17a] transition-colors group shadow-[4px_4px_0_rgba(0,0,0,0.2)] md:shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-none cursor-pointer">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#4a2e1b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6 group-hover:scale-110 transition-transform mb-1 md:mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>
              <span className="text-[6px] md:text-[8px] tracking-widest font-bold text-[#4a2e1b] uppercase pointer-events-none group-hover:scale-110 transition-transform">Resume</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
