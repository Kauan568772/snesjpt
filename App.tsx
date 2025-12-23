import React, { useState } from 'react';
import Library from './components/Library';
import Emulator from './components/Emulator';
import { RomData } from './types';

function App() {
  const [currentRom, setCurrentRom] = useState<RomData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRom = (file: File) => {
    setError(null);
    setCurrentRom({
      name: file.name,
      file: file,
      lastPlayed: Date.now(),
    });
  };

  const handleExit = () => {
    setCurrentRom(null);
  };

  const handleError = (msg: string) => {
    setError(msg);
    setCurrentRom(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {currentRom ? (
        <Emulator 
          rom={currentRom} 
          onExit={handleExit}
          onError={handleError}
        />
      ) : (
        <>
          {error && (
            <div className="fixed top-0 left-0 w-full bg-red-600 text-white p-3 text-center z-50 shadow-lg animate-bounce-in">
              <span className="font-bold">Error:</span> {error}
              <button 
                onClick={() => setError(null)} 
                className="ml-4 underline text-sm"
              >
                Dismiss
              </button>
            </div>
          )}
          <Library onSelectRom={handleSelectRom} />
        </>
      )}
    </div>
  );
}

export default App;
