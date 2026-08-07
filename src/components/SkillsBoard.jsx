import React, { useState, useRef } from 'react';
import woodTexture from '../assets/wood.png';
import paperTexture from '../assets/paper1.png';

const DraggableNote = ({ title, content, initialRotation }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const bounds = useRef({ minX: -10000, maxX: 10000, minY: -10000, maxY: 10000 });
  const noteRef = useRef(null);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;

    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };

    if (noteRef.current) {
      const board = noteRef.current.closest('.bulletin-board');
      if (board) {
        const parentRect = board.getBoundingClientRect();
        const noteRect = noteRef.current.getBoundingClientRect();

        const originLeft = noteRect.left - position.x;
        const originRight = noteRect.right - position.x;
        const originTop = noteRect.top - position.y;
        const originBottom = noteRect.bottom - position.y;

        const PADDING = 20;
        bounds.current = {
          minX: parentRect.left - originLeft + PADDING,
          maxX: parentRect.right - originRight - PADDING,
          minY: parentRect.top - originTop + PADDING,
          maxY: parentRect.bottom - originBottom - PADDING
        };
      }
    }

    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;

    let newX = clientX - dragStart.current.x;
    let newY = clientY - dragStart.current.y;

    newX = Math.max(bounds.current.minX, Math.min(bounds.current.maxX, newX));
    newY = Math.max(bounds.current.minY, Math.min(bounds.current.maxY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={noteRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${initialRotation}deg) scale(${isDragging ? 1.05 : 1})`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 50 : 10,
        touchAction: 'none',
        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        backgroundImage: `url(${paperTexture})`,
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply'
      }}
      className="bg-[#fff9e6] p-6 border-4 border-[#cf9e5c] shadow-lg flex-1 hover:z-20 select-none pointer-events-auto relative"
    >
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full shadow-md border-b-2 border-gray-600"></div>
      <h3 className="text-[#8b5a2b] tracking-wider text-xl md:text-2xl uppercase mb-4 pointer-events-none">{title}</h3>
      <p className="text-[#4a2e1b] text-xs md:text-sm leading-relaxed md:leading-loose pointer-events-none" dangerouslySetInnerHTML={{ __html: content }}></p>
    </div>
  );
};

const SkillsBoard = () => {
  return (
    <section id="skills" className="w-full flex flex-col items-center justify-center p-4 bg-transparent min-h-screen snap-start">
      <div
        className="bulletin-board max-w-6xl w-full text-center bg-[#e6c17a]/95 border-[8px] md:border-[12px] border-[#8b5a2b] p-4 md:p-15 shadow-[6px_6px_0_rgba(0,0,0,0.5)] md:shadow-[10px_10px_0_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col justify-center items-center h-auto min-h-[600px] md:min-h-0"
        style={{ backgroundImage: `url(${woodTexture})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}
      >

        <div className="absolute top-2 left-2 md:top-4 md:left-4 w-4 h-4 md:w-6 md:h-6 bg-red-600 rounded-full shadow-md border-b-2 md:border-b-4 border-red-800"></div>
        <div className="absolute top-2 right-2 md:top-4 md:right-4 w-4 h-4 md:w-6 md:h-6 bg-blue-600 rounded-full shadow-md border-b-2 md:border-b-4 border-blue-800"></div>

        <h2 className="text-[12px] md:text-2xl uppercase tracking-widest text-[#4a2e1b] border-b-2 md:border-b-4 border-[#8b5a2b] pb-2 md:pb-3 inline-block mt-4 md:mt-4">Bulletin Board: Skills</h2>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-sm lg:text-sm pt-8 pb-4 h-auto lg:h-[350px] w-full mt-4 md:mt-0">
          <DraggableNote
            title="Languages"
            initialRotation={-2}
            content="C, C++, C#, Java, Python<br/>JavaScript, React, Kotlin<br/>HTML, CSS"
          />
          <DraggableNote
            title="Game Dev & Design"
            initialRotation={1}
            content="Unreal Engine, Unity <br/>Blender"
          />
          <DraggableNote
            title="Tools & Frameworks"
            initialRotation={-1}
            content="Node.js, Next.js, FastAPI, Vite <br/>SQLite, MySQL, <br/>Vercel, Render, Git, Linux"
          />
        </div>
      </div>
    </section>
  );
};

export default SkillsBoard;
