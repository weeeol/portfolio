import React, { useState, useRef, useEffect, useMemo } from 'react';
import PortfolioGUI from './PortfolioGUI';
import MatrixRain from './MatrixRain';
import StartupIntro from './StartupIntro';
import { asciiArt, fileSystem } from './data/commands';

const App = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Easter Egg States
  const [theme, setTheme] = useState({ bg: 'bg-slate-950', text: 'text-slate-300', accent: 'text-cyan-400' });
  const [showMatrix, setShowMatrix] = useState(false);
  
  // The master switch for the Graphical UI
  const [guiMode, setGuiMode] = useState(true);

  const availableThemes = useMemo(() => ({
    light: { bg: 'bg-[#fdf6e3]', text: 'text-[#657b83]', accent: 'text-[#b58900]' }, // Solarized Light Retro Vibe
    cyberpunk: { bg: 'bg-purple-900', text: 'text-yellow-400', accent: 'text-pink-500' },
    dark: { bg: 'bg-slate-950', text: 'text-slate-300', accent: 'text-cyan-400' },
    hacker: { bg: 'bg-black', text: 'text-green-500', accent: 'text-emerald-400' }
  }), []);

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const trimmedInput = input.trim().toLowerCase();
      let output = '';

      if (trimmedInput === '') return; // Do nothing on empty enter

      const [command, ...args] = trimmedInput.split(' ');

      switch (command) {
        case 'clear':
          setHistory([]);
          setInput('');
          return;
        case 'startx':
        case 'launch':
          setGuiMode(true);
          return;
        case 'matrix':
          setShowMatrix(true);
          output = 'Initializing Matrix protocol...';
          break;
        case 'github':
          window.open('https://github.com/weeeol', '_blank');
          output = 'Opening GitHub in a new tab...';
          break;
        case 'linkedin':
          window.open('https://www.linkedin.com/in/veolstevejose', '_blank');
          output = 'Opening LinkedIn in a new tab...';
          break;
        case 'sudo':
          output = `veol-os: ${trimmedInput}: Permission denied.\nThis incident has been reported to the system administrator :) .`;
          break;
        case 'theme': {
          const selectedTheme = args[0];
          const themeMap = {
            light: { msg: 'Theme updated to light mode. My eyes are burning.' },
            cyberpunk: { msg: 'Wake up, samurai. Theme updated to cyberpunk.' },
            dark: { msg: 'Theme updated to a clean dark mode.' },
            default: { msg: 'Theme updated to a clean dark mode.' },
            hacker: { msg: 'Theme restored to the classic hacker mode.' }
          };

          if (themeMap[selectedTheme]) {
            const mappedKey = selectedTheme === 'default' ? 'dark' : selectedTheme;
            setTheme(availableThemes[mappedKey]);
            output = themeMap[selectedTheme].msg;
          } else {
            output = `Theme '${selectedTheme}' not found.\nAvailable themes: dark, hacker, light, cyberpunk.`;
          }
          break;
        }
        default:
          if (fileSystem[trimmedInput]) {
            output = fileSystem[trimmedInput];
          } else {
            output = `Command not found: '${trimmedInput}'. Type 'help' for available commands.`;
          }
          break;
      }

      setHistory((prev) => [...prev, { command: `guest@veol-portfolio:~$ ${input}`, output }]);
      setInput('');
    }
  };

  // If GUI mode is active, render the Asteroid GUI instead of the terminal
  if (showIntro) {
    return <StartupIntro onComplete={() => setShowIntro(false)} />;
  }

  if (showMatrix) {
    return <MatrixRain onExit={() => setShowMatrix(false)} />;
  }

  if (guiMode) {
    return <PortfolioGUI onExit={() => setGuiMode(false)} />;
  }

  // Otherwise, render the classic Terminal UI
  return (
    <div 
      className={`${theme.bg} ${theme.text} font-mono h-screen w-full p-6 overflow-y-auto sm:text-lg text-sm transition-colors duration-300 cursor-text`}
      onClick={handleTerminalClick}
    >
      
      {/* ASCII Welcome Header */}
      <div className="mb-8">
        <pre className={`${theme.accent} font-bold leading-tight`}>
          {asciiArt}
        </pre>
        <div className={`${theme.accent} mt-4 whitespace-pre-wrap`}>
          {`Welcome to the terminal.\nType 'help' to see available commands.\nTip: Type 'startx' to launch the interactive graphical environment.`}
        </div>
      </div>

      {/* Command History Map */}
      {history.map((line, index) => (
        <div key={index} className="mb-6">
          <div className="flex items-center">
            <span className={`${theme.accent} mr-2 flex-shrink-0`} aria-hidden="true">{line.command.split(' ')[0]}</span>
            <span className="opacity-90">{line.command.substring(line.command.indexOf(' ') + 1)}</span>
          </div>
          <div className="whitespace-pre-wrap mt-2 pl-2 border-l-2 border-opacity-30 border-current opacity-80">{line.output}</div>
        </div>
      ))}

      {/* Active Input Line */}
      <div className="flex items-center mt-4">
        <span className={`${theme.accent} mr-2 flex-shrink-0`} aria-hidden="true">guest@veol-portfolio:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className={`bg-transparent ${theme.text} outline-none flex-grow w-full`}
          style={{ caretColor: 'currentColor' }}
          autoFocus
          spellCheck="false"
          autoComplete="off"
          aria-label="Terminal user input"
        />
      </div>
      
      {/* Invisible div to anchor the auto-scroll */}
      <div ref={bottomRef} className="pb-10" />
    </div>
  );
};

export default App;