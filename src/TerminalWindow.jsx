import React, { useState, useRef, useEffect } from 'react';
import { asciiArt } from './data/commands';

const TerminalWindow = ({ 
  history, 
  input, 
  setInput, 
  handleCommand, 
  inputRef, 
  bottomRef, 
  theme, 
  onClose 
}) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(14);

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setFontSize(prev => Math.max(prev - 2, 8));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;
      
      // Keep terminal inside viewport bounds
      newX = Math.max(0, Math.min(newX, window.innerWidth - 150));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 100));

      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="fixed z-[100] shadow-[8px_8px_0_rgba(0,0,0,0.6)] border-[4px] border-[#8b5a2b] bg-[#4a2e1b] flex flex-col pointer-events-auto"
      style={{ 
        left: position.x, 
        top: position.y,
        width: '650px',
        maxWidth: '90vw',
        height: '400px',
        resize: 'both',
        overflow: 'hidden',
        minWidth: '320px',
        minHeight: '250px',
        fontFamily: '"Press Start 2P", system-ui' 
      }}
    >
      {/* 8-bit Title Bar - Drag Handle */}
      <div 
        className="bg-[#e6c17a] border-b-[4px] border-[#8b5a2b] p-2 md:p-3 flex justify-between items-center cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="text-[#4a2e1b] font-bold text-[10px] md:text-xs tracking-widest uppercase truncate pointer-events-none">
          C:\VEOL-OS\CMD.EXE
        </span>
        <div className="flex gap-1 md:gap-2">
          <button 
            onClick={handleZoomOut}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-5 h-5 md:w-6 md:h-6 bg-[#cf9e5c] border-[3px] border-[#8b5a2b] hover:bg-[#d4a373] active:translate-y-[2px] active:border-b-2 text-[#4a2e1b] flex items-center justify-center font-bold text-[10px] md:text-[12px]"
            title="Decrease Font Size"
            aria-label="Decrease Font Size"
          >
            -
          </button>
          <button 
            onClick={handleZoomIn}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-5 h-5 md:w-6 md:h-6 bg-[#cf9e5c] border-[3px] border-[#8b5a2b] hover:bg-[#d4a373] active:translate-y-[2px] active:border-b-2 text-[#4a2e1b] flex items-center justify-center font-bold text-[10px] md:text-[12px]"
            title="Increase Font Size"
            aria-label="Increase Font Size"
          >
            +
          </button>
          <button 
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-5 h-5 md:w-6 md:h-6 bg-[#cf9e5c] border-[3px] border-[#8b5a2b] hover:bg-[#d4a373] active:translate-y-[2px] active:border-b-2 text-[#4a2e1b] flex items-center justify-center font-bold text-[8px] md:text-[10px] ml-1"
            title="Close Terminal"
            aria-label="Close Terminal"
          >
            X
          </button>
        </div>
      </div>

      {/* Terminal Display Area */}
      <div 
        className={`${theme.bg} ${theme.text} font-mono flex-grow overflow-y-auto p-4 md:p-6 cursor-text border-[4px] border-transparent`}
        onClick={handleTerminalClick}
        style={{ fontFamily: 'monospace', fontSize: `${fontSize}px` }}
      >
        {/* ASCII Welcome Header */}
        <div className="mb-6 pointer-events-none select-none hidden sm:block">
          <pre className={`${theme.accent} font-bold leading-tight`} style={{ fontSize: `${Math.max(8, fontSize - 4)}px` }}>
            {asciiArt}
          </pre>
        </div>

        <div className={`${theme.accent} mb-6 whitespace-pre-wrap font-bold`}>
          {`Welcome to Veol-OS.\nType 'help' to see available commands.\nTip: Try 'theme light' or 'theme cyberpunk'.`}
        </div>

        {/* Command History Map */}
        {history.map((line, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center">
              <span className={`${theme.accent} mr-2 flex-shrink-0 font-bold`} aria-hidden="true">{line.command.split(' ')[0]}</span>
              <span className="opacity-90">{line.command.substring(line.command.indexOf(' ') + 1)}</span>
            </div>
            <div className="whitespace-pre-wrap mt-2 pl-2 border-l-2 border-opacity-30 border-current opacity-80 leading-relaxed font-bold">
              {line.output}
            </div>
          </div>
        ))}

        {/* Active Input Line */}
        <div className="flex items-center mt-2 group">
          <span className={`${theme.accent} mr-2 flex-shrink-0 font-bold`} aria-hidden="true">C:\\&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            className={`bg-transparent ${theme.text} outline-none flex-grow w-full font-bold`}
            style={{ caretColor: 'currentColor' }}
            autoFocus
            spellCheck="false"
            autoComplete="off"
            aria-label="Terminal user input"
          />
        </div>
        
        {/* Invisible div to anchor the auto-scroll */}
        <div ref={bottomRef} className="pb-4" />
      </div>
    </div>
  );
};

export default TerminalWindow;