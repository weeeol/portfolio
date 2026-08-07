import { useState, useEffect } from 'react';

export const useVeolCode = () => {
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const veolCode = ['v', 'e', 'o', 'l'];
    let keySequence = [];

    const handleKeyDown = (e) => {
      keySequence.push(e.key);
      keySequence = keySequence.slice(-4);

      if (keySequence.join('').toLowerCase() === veolCode.join('').toLowerCase()) {
        setSuccess(true);
        // Reset sequence so it doesn't trigger repeatedly
        keySequence = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { success, setSuccess };
};
