import React, { useState, useRef, useEffect, useMemo } from 'react';
import PortfolioGUI from './PortfolioGUI';
import MatrixRain from './MatrixRain';
import StartupIntro from './StartupIntro';

// The ASCII Banner
const asciiArt = `
 __      __ ______  ____   _      
 \\ \\    / /|  ____|/ __ \\ | |     
  \\ \\  / / | |__  | |  | || |     
   \\ \\/ /  |  __| | |  | || |     
    \\  /   | |____| |__| || |____ 
     \\/    |______|\\____/ |______|
                                  
   OS: Veol-OS v1.0.0
   Host: Veol Steve
   Kernel: GameDev-Core
`;

// Your static "Database"
const fileSystem = {
  "help": "Available commands: \n- whoami: About me\n- skills: Technical proficiency\n- projects: View portfolio work\n- startx / launch: Launch graphical UI\n- clear: Clear terminal\n- matrix: Initialize Matrix protocol\n- theme <dark|light|cyberpunk|hacker>: Change terminal theme\n- sudo <command>: Execute a command as superuser",
  "whoami": "Veol Steve Jose | CS Student (2024-2028) at St. Joseph Engineering College.\nAspiring game developer. I pride myself on professional transparency and answering questions honestly.",
  "skills": "=== CORE TECHNICAL SKILLS ===\nLanguages: C, C++, C#, Java, Python, JavaScript, React, Kotlin, Lua, HTML5, CSS3, Bash Script\nGame dev and design: Unreal Engine, Unity, Blender, GIMP\nTools: Node.js, Next.js, FastAPI, Qt, SQLite, MySQL, CMake, NPM, Vercel, Render, Raspberry Pi, LaTeX",
  "projects": "1. Text Editor: Python & Tkinter desktop application.\n2. ProtoPlay: Pygame experimental foundation for game mechanics & input handling.\n3. Inventory Lookup: C-based system utilizing Hash Tables, Linked Lists, and Queues.\n4. ExplainIt: AI & static analysis tool for code explanation without source modification.\n5. Flowmake: Full-stack Python AST parser that automatically generates professional flowcharts."
};

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Easter Egg States
  const [theme, setTheme] = useState({ bg: 'bg-slate-950', text: 'text-slate-300', accent: 'text-cyan-400' });
  const [showMatrix, setShowMatrix] = useState(false);
  
  // The master switch for the Graphical UI
  const [guiMode, setGuiMode] = useState(false);

  const availableThemes = useMemo(() => ({
    light: { bg: 'bg-slate-50', text: 'text-slate-900', accent: 'text-indigo-600' },
    cyberpunk: { bg: 'bg-purple-900', text: 'text-yellow-400', accent: 'text-pink-500' },
    dark: { bg: 'bg-slate-950', text: 'text-slate-300', accent: 'text-cyan-400' },
    hacker: { bg: 'bg-black', text: 'text-green-500', accent: 'text-emerald-400' }
  }), []);

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const trimmedInput = input.trim().toLowerCase();
      let output = '';

      if (trimmedInput === '') {
        output = ''; // Do nothing on empty enter
      } 
      else if (trimmedInput === 'clear') {
        setHistory([]);
        setInput('');
        return;
      } 
      else if (trimmedInput === 'startx' || trimmedInput === 'launch') {
        setGuiMode(true);
        return; 
      }
      else if (trimmedInput === 'matrix') {
        setShowMatrix(true);
        output = 'Initializing Matrix protocol...';
      }
      else if (trimmedInput.startsWith('sudo ')) {
        output = `veol-os: ${trimmedInput}: Permission denied.\nThis incident has been reported to the system administrator :) .`;
      } 
      else if (trimmedInput.startsWith('theme ')) {
        const selectedTheme = trimmedInput.split(' ')[1];
        
        if (selectedTheme === 'light') {
          setTheme(availableThemes.light);
          output = 'Theme updated to light mode. My eyes are burning.';
        } else if (selectedTheme === 'cyberpunk') {
          setTheme(availableThemes.cyberpunk);
          output = 'Wake up, samurai. Theme updated to cyberpunk.';
        } else if (selectedTheme === 'dark' || selectedTheme === 'default') {
          setTheme(availableThemes.dark);
          output = 'Theme updated to a clean dark mode.';
        } else if (selectedTheme === 'hacker') {
          setTheme(availableThemes.hacker);
          output = 'Theme restored to the classic hacker mode.';
        } else {
          output = `Theme '${selectedTheme}' not found.\nAvailable themes: dark, hacker, light, cyberpunk.`;
        }
      } 
      else if (fileSystem[trimmedInput]) {
        output = fileSystem[trimmedInput];
      } else {
        output = `Command not found: ${trimmedInput}. Type 'help' for available commands.`;
      }

      setHistory([...history, { command: `guest@veol-portfolio:~$ ${input}`, output }]);
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
    <div className={`${theme.bg} ${theme.text} font-mono h-screen w-full p-6 overflow-y-auto sm:text-lg text-sm transition-colors duration-300`}>
      
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
        <div key={index} className="mb-4">
          <div className="opacity-70">{line.command}</div>
          <div className="whitespace-pre-wrap mt-1">{line.output}</div>
        </div>
      ))}

      {/* Active Input Line */}
      <div className="flex items-center">
        <span className="opacity-70 mr-2 flex-shrink-0" aria-hidden="true">guest@veol-portfolio:~$</span>
        <input
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