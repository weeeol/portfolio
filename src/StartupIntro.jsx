import React, { useEffect, useMemo, useState } from 'react';

const StartupIntro = ({ onComplete }) => {
  const bootLines = useMemo(
    () => [
      '[ OK ] Mounting /dev/portfolio',
      '[ OK ] Initializing Veol-OS display manager',
      '[ OK ] Loading personal profile modules',
      '[ OK ] Starting secure shell environment',
      '[ OK ] Verifying graphical interface hooks',
      '[DONE] Welcome, guest'
    ],
    []
  );

  const [lineCount, setLineCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lineTimer = window.setInterval(() => {
      setLineCount((current) => {
        if (current >= bootLines.length) {
          window.clearInterval(lineTimer);
          return current;
        }
        return current + 1;
      });
    }, 260);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(progressTimer);
          return 100;
        }
        return current + 3;
      });
    }, 70);

    const finishTimer = window.setTimeout(() => {
      onComplete();
    }, 3400);

    const skipOnKey = (event) => {
      if (event.key === 'Enter' || event.key === 'Escape' || event.key === ' ') {
        onComplete();
      }
    };

    window.addEventListener('keydown', skipOnKey);

    return () => {
      window.clearInterval(lineTimer);
      window.clearInterval(progressTimer);
      window.clearTimeout(finishTimer);
      window.removeEventListener('keydown', skipOnKey);
    };
  }, [bootLines, onComplete]);

  return (
    <div className="h-screen w-full bg-black text-green-500 font-mono p-6 sm:p-10 flex flex-col justify-between">
      <div>
        <div className="text-xs sm:text-sm opacity-70">veol-os boot sequence</div>
        <pre className="mt-6 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
{` __      __ ______  ____   _
 \\ \\    / /|  ____|/ __ \\ | |
  \\ \\  / / | |__  | |  | || |
   \\ \\/ /  |  __| | |  | || |
    \\  /   | |____| |__| || |____
     \\/    |______|\\____/ |______|`}
        </pre>
        <div className="mt-8 space-y-1 text-xs sm:text-sm">
          {bootLines.slice(0, lineCount).map((line) => (
            <div key={line} className="tracking-wide">
              {line}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="h-2 w-full border border-green-700/60 bg-black overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-75"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-[10px] sm:text-xs opacity-70 flex justify-between">
          <span>booting... {Math.min(progress, 100)}%</span>
          <span>Press Enter to skip</span>
        </div>
      </div>
    </div>
  );
};

export default StartupIntro;