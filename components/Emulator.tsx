import React, { useEffect, useRef, useState } from 'react';
import { EmulatorStatus, RomData } from '../types';
import VirtualController from './VirtualController';
import { saveStateToDB, loadStateFromDB } from '../utils/db';

interface EmulatorProps {
  rom: RomData;
  onExit: () => void;
  onError: (msg: string) => void;
}

const Emulator: React.FC<EmulatorProps> = ({ rom, onExit, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorInstance = useRef<any>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState<EmulatorStatus>(EmulatorStatus.LOADING);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      // Silently fail
    }
  };

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;
    let active = true;

    const loop = () => {
      if (!active) return;
      
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        if (fpsRef.current) {
          fpsRef.current.innerText = `${frameCount}`;
          fpsRef.current.style.color = frameCount < 58 ? '#fbbf24' : '#4ade80';
        }
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      active = false;
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const startEmulator = async () => {
      if (!window.Nostalgist) {
        onError('Emulator core library not loaded.');
        return;
      }

      try {
        // IMPORTANT: Pass the File object directly to preserve filename
        emulatorInstance.current = await window.Nostalgist.launch({
          element: canvasRef.current,
          rom: rom.file, 
          core: 'snes9x', 
          runForever: true,
          style: {
             width: '100%',
             height: '100%',
             position: 'absolute',
             top: '0',
             left: '0',
             objectFit: 'contain',
             backgroundColor: 'transparent',
             zIndex: 10,
          }
        });

        if (isMounted) {
          setStatus(EmulatorStatus.RUNNING);
          window.focus();
        }
      } catch (err: any) {
        console.error('Emulator Error:', err);
        if (isMounted) {
            setStatus(EmulatorStatus.ERROR);
            onError(`Failed to start: ${err.message || 'Unknown error'}`);
        }
      }
    };

    startEmulator();
    
    return () => {
      isMounted = false;
      if (emulatorInstance.current) {
        try {
          emulatorInstance.current.exit();
        } catch (e) { console.error(e); }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rom]); 

  const handleSaveState = async () => {
    if (!emulatorInstance.current) return;
    
    try {
      showToast("Saving...");
      
      const result = await emulatorInstance.current.saveState();
      
      if (!result) {
        throw new Error("Emulator returned null result");
      }

      let blobCandidate = result;

      // Handle object return type { state: Blob, thumbnail: ... }
      // This fixes the "Core returned object: {"state":{},...}" error
      if (result && typeof result === 'object' && 'state' in result) {
         blobCandidate = result.state;
      }

      let stateBlob: Blob;

      // Robust check for return types (Blob vs Uint8Array vs Object)
      if (blobCandidate instanceof Blob) {
        stateBlob = blobCandidate;
      } else if (blobCandidate instanceof Uint8Array || blobCandidate instanceof ArrayBuffer) {
        // Cast to any to satisfy TS compiler regarding ArrayBufferLike vs ArrayBuffer in Blob constructor
        stateBlob = new Blob([blobCandidate as any]);
      } else {
         // If it's a generic object, it might be an error or a wrapper.
         console.error("Save returned non-standard object:", result);
         
         const json = JSON.stringify(result);
         throw new Error(`Core returned object: ${json.substring(0, 50)}...`);
      }

      // VALIDATION
      if (stateBlob.size < 1024) {
        let errorContent = "";
        try {
           errorContent = await stateBlob.text();
        } catch(e) { /* ignore */ }
        console.error(`Core produced invalid state (${stateBlob.size} bytes). Content:`, errorContent);
        throw new Error(`Save Failed: File too small (${stateBlob.size}b)`);
      }

      // Save to IndexedDB
      await saveStateToDB(rom.name, stateBlob);
      
      showToast("State Saved!");
      setMenuOpen(false);
    } catch (e: any) {
      console.error("Save failed:", e);
      showToast("Save Failed!");
    }
  };

  const handleLoadState = async () => {
    if (!emulatorInstance.current) return;
    
    try {
      showToast("Loading...");
      
      const stateBlob = await loadStateFromDB(rom.name);
      
      if (stateBlob) {
        if (stateBlob.size < 1024) {
           showToast("Bad Save File");
           return;
        }

        await emulatorInstance.current.loadState(stateBlob);
        showToast("State Loaded!");
        setMenuOpen(false);
      } else {
        showToast("No Save Found");
      }
    } catch (e) {
      console.error("Load failed:", e);
      showToast("Load Failed!");
    }
  };

  const handleInput = (code: string, key: string, keyCode: number, pressed: boolean) => {
    if (menuOpen) return;

    const eventType = pressed ? 'keydown' : 'keyup';
    const event = new KeyboardEvent(eventType, {
      code: code,
      key: key,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    Object.defineProperty(event, 'keyCode', { get: () => keyCode });
    Object.defineProperty(event, 'which', { get: () => keyCode });

    document.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden select-none touch-none">
      
      <div className="absolute inset-0 bg-black z-0"></div>

      <div className="relative w-full h-full z-10 flex items-center justify-center">
        
        {status === EmulatorStatus.LOADING && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur text-white">
             <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
             <p className="text-sm font-mono tracking-widest animate-pulse">BOOTING SYSTEM...</p>
          </div>
        )}

        {toastMsg && (
          <div className="absolute top-16 z-[60] bg-gray-800/90 text-white px-4 py-2 rounded-full border border-white/20 shadow-xl animate-bounce-in font-mono text-sm">
            {toastMsg}
          </div>
        )}

        <canvas ref={canvasRef} className="block w-full h-full object-contain image-pixelated" />

        <div className="absolute top-0 left-0 w-full flex justify-center pt-2 z-[100] pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full pl-4 pr-1 py-1 flex items-center gap-3 pointer-events-auto shadow-lg">
              
              <div ref={fpsRef} className="font-mono text-[10px] min-w-[20px] text-center font-bold text-green-400">
                  --
              </div>
              
              <div className="w-px h-3 bg-white/20"></div>

              <button 
                onClick={() => setMenuOpen(true)} 
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
              </button>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#1a1a1a] border border-gray-700 p-6 rounded-2xl w-64 shadow-2xl flex flex-col gap-3 animate-fade-in">
              <h2 className="text-center text-gray-400 text-xs font-bold tracking-[0.2em] mb-2">PAUSE MENU</h2>
              
              <button 
                onClick={() => setMenuOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-transform active:scale-95"
              >
                Resume
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleSaveState}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold text-xs uppercase transition-transform active:scale-95"
                >
                  Save State
                </button>
                <button 
                  onClick={handleLoadState}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold text-xs uppercase transition-transform active:scale-95"
                >
                  Load State
                </button>
              </div>

              <button 
                onClick={toggleFullscreen}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg font-bold text-xs uppercase transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                Toggle Fullscreen
              </button>

              <div className="h-px bg-gray-700 my-1"></div>

              <button 
                onClick={onExit}
                className="w-full bg-red-900/50 hover:bg-red-900/80 text-red-200 py-3 rounded-lg font-bold text-xs uppercase transition-transform active:scale-95"
              >
                Exit Game
              </button>
            </div>
          </div>
        )}

      </div>

      <div className={`transition-opacity duration-300 ${menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
         <VirtualController onInput={handleInput} />
      </div>

    </div>
  );
};

export default Emulator;