import React, { useEffect, useRef } from 'react';

const MatrixRain = ({ onExit }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Make canvas full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // The characters to use in the rain
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    
    // Array to track the Y coordinate of each column
    const drops = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      // Draw a translucent black rectangle to create the fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0'; // Classic Matrix Green
      ctx.font = fontSize + 'px monospace';

      // Loop over the drops
      for (let i = 0; i < drops.length; i++) {
        // Pick a random character
        const text = letters[Math.floor(Math.random() * letters.length)];
        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset the drop to the top randomly, or if it's off the screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        // Move the drop down
        drops[i]++;
      }
    };

    // Run the animation loop every 33 milliseconds
    const interval = setInterval(draw, 33);

    // Handle resizing the window
    const handleResize = () => {
       canvas.width = window.innerWidth;
       canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);

    // Clean up interval and event listeners when component unmounts
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    // This wrapper div covers the whole screen and listens for clicks to exit
    <div className="fixed inset-0 z-50 bg-black cursor-pointer" onClick={onExit}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-green-500 font-mono bg-black/80 px-4 py-2 rounded">
        Click anywhere to exit Matrix mode
      </div>
    </div>
  );
};

export default MatrixRain;