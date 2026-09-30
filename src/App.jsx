import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import PortfolioGUI from './PortfolioGUI';
import StartupIntro from './StartupIntro';

const App = () => {
  const [showIntro, setShowIntro] = useState(false); // set to true to enable intro
  const [waterEnabled, setWaterEnabled] = useState(true);

  if (showIntro) {
    return <StartupIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <>
      <PortfolioGUI 
        waterEnabled={waterEnabled}
        setWaterEnabled={setWaterEnabled}
      />
      <Analytics />
    </>
  );
};

export default App;