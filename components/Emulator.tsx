import React, { useEffect, useRef, useState } from 'react';
import { EmulatorStatus, RomData } from '../types';
import VirtualController from './VirtualController';

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

  // Force Fullscreen helper - Auto-triggered on load
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log('Fullscreen blocked (expected if no gesture):', err));
    } else if ((elem as any).webkitRequestFullscreen) { /* Safari/Chrome */
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) { /* Firefox */
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).msRequestFullscreen) { /* IE/Edge */
      (elem as any).msRequestFullscreen();
    }
  };

  // FPS Counter Logic - Independent loop
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
          // Calculate approximate FPS
          fpsRef.current.innerText = `FPS:${frameCount}`;
          fpsRef.current.style.color = frameCount < 58 ? '#fbbf24' : '#4ade80'; // yellow vs green
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
        // Attempt fullscreen on launch automatically
        enterFullscreen();

        // Nostalgist configuration
        emulatorInstance.current = await window.Nostalgist.launch({
          element: canvasRef.current,
          rom: rom.file,
          // 2005 is significantly faster on mobile than 2010
          core: 'snes9x2005', 
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

  const handleInput = (code: string, key: string, keyCode: number, pressed: boolean) => {
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
    
    // Legacy mapping helpers
    Object.defineProperty(event, 'keyCode', { get: () => keyCode });
    Object.defineProperty(event, 'which', { get: () => keyCode });

    document.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden select-none touch-none">
      
      {/* Background fill */}
      <div className="absolute inset-0 bg-black z-0"></div>

      {/* Main Game Container */}
      <div className="relative w-full h-full z-10 flex items-center justify-center">
        
        {/* Loading Overlay */}
        {status === EmulatorStatus.LOADING && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur text-white">
             <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
             <p className="text-sm font-mono tracking-widest animate-pulse">BOOTING SYSTEM...</p>
          </div>
        )}

        {/* The Emulator Canvas */}
        <canvas ref={canvasRef} className="block w-full h-full object-contain image-pixelated" />

        {/* Top Toolbar (System Controls & FPS) */}
        {/* Placed in top center to avoid shoulder buttons L/R */}
        <div className="absolute top-0 left-0 w-full flex justify-center pt-2 z-[100] pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-4 pointer-events-auto shadow-lg transition-opacity opacity-70 hover:opacity-100">
              
              {/* FPS Display */}
              <div ref={fpsRef} className="font-mono text-[10px] min-w-[40px] text-center font-bold">
                  --
              </div>
              
              <div className="w-px h-3 bg-white/20"></div>

              {/* Exit Button - Fullscreen button removed for APK/Standalone feel */}
              <button 
                onClick={onExit} 
                className="text-[10px] font-bold text-red-400 hover:text-red-300 active:scale-95 transition-transform tracking-wider"
              >
                  EXIT
              </button>
          </div>
        </div>

      </div>

      {/* Mobile Controls */}
      <VirtualController onInput={handleInput} />

    </div>
  );
};

export default Emulator;