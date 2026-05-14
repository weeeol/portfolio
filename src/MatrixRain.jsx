import React, { useEffect, useRef } from 'react';

const MatrixRain = ({ onExit }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Use the parent element's dimensions to fit the container
    const resizeCanvas = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvas.width = canvasRef.current.parentElement.clientWidth;
        canvas.height = canvasRef.current.parentElement.clientHeight;
      }
    };
    
    resizeCanvas();

    // The characters to use in the rain
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
    const fontSize = 16;
    
    // Array to track the Y coordinate of each column
    let columns = canvas.width / fontSize;
    let drops = Array(Math.floor(columns)).fill(1);

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

    const handleResize = () => {
       resizeCanvas();
       columns = canvas.width / fontSize;
       drops = Array(Math.floor(columns)).fill(1);
    }
    window.addEventListener('resize', handleResize);

    // Clean up interval and event listeners when component unmounts
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    // This wrapper div covers the container and listens for clicks to exit
    <div className="absolute inset-0 z-50 bg-black cursor-pointer" onClick={onExit} role="button" aria-label="Exit Matrix mode">
      <canvas ref={canvasRef} className="block w-full h-full" aria-label="Matrix rain animation" />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-green-500 font-mono bg-black/80 px-2 py-1 rounded text-xs" aria-hidden="true">
        Click to exit Matrix mode
      </div>
    </div>
  );
};

export default MatrixRain;