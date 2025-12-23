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
  const wakeLockRef = useRef<any>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<EmulatorStatus>(EmulatorStatus.LOADING);

  // Function to request wake lock (keep screen on)
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err: any) {
        console.warn('Wake Lock Error:', err.name);
      }
    }
  };

  // FPS Counter Effect
  useEffect(() => {
    if (status !== EmulatorStatus.RUNNING) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        if (fpsRef.current) {
          fpsRef.current.innerText = `FPS: ${frameCount}`;
        }
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [status]);

  useEffect(() => {
    let isMounted = true;

    const startEmulator = async () => {
      if (!window.Nostalgist) {
        onError('Emulator core library not loaded.');
        return;
      }

      try {
        // Request wake lock immediately on launch
        await requestWakeLock();

        // Nostalgist configuration
        emulatorInstance.current = await window.Nostalgist.launch({
          element: canvasRef.current,
          rom: rom.file,
          core: 'snes9x2010', // snes9x2010 is highly optimized for lower-end devices
          runForever: true,
          style: {
             width: '100%',
             height: '100%',
             position: 'absolute',
             top: '0',
             left: '0',
             objectFit: 'contain', // Keeps aspect ratio
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
    
    // Re-acquire wake lock if visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === EmulatorStatus.RUNNING) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
      
      if (emulatorInstance.current) {
        emulatorInstance.current.exit();
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
      view: window,
      composed: true,
      repeat: false
    });
    
    Object.defineProperty(event, 'keyCode', { get: () => keyCode });
    Object.defineProperty(event, 'which', { get: () => keyCode });

    document.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden select-none touch-none">
      
      {/* Background fill for notch areas */}
      <div className="absolute inset-0 bg-black z-0"></div>

      {/* Main Game Container - Respects Safe Areas */}
      <div className="relative w-full h-full z-10 flex items-center justify-center pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        
        {/* Loading Overlay */}
        {status === EmulatorStatus.LOADING && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin mb-4 rounded-full"></div>
            <p className="text-sm font-mono tracking-widest animate-pulse">BOOTING SYSTEM...</p>
          </div>
        )}

        {/* The Emulator Canvas */}
        <canvas ref={canvasRef} className="block w-full h-full object-contain image-pixelated" />

        {/* FPS Counter - Now rendered with higher z-index and guaranteed correct ref usage */}
        {status === EmulatorStatus.RUNNING && (
          <div 
            ref={fpsRef} 
            className="absolute top-2 right-4 z-[70] text-[#00ff00] font-mono text-[10px] bg-black/60 px-2 py-1 rounded backdrop-blur-md pointer-events-none border border-white/10 shadow-lg"
          >
            FPS: --
          </div>
        )}
      </div>

      {/* Mobile Controls Overlay - Handles its own safe area logic */}
      <VirtualController onInput={handleInput} />

      {/* Minimalist Exit Button - Adjusted position to be less intrusive */}
      <button 
        onClick={onExit}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-[70] text-white/40 px-3 py-1 text-[9px] font-bold tracking-widest border border-white/10 bg-black/20 hover:bg-white/10 hover:text-white transition-all rounded-full backdrop-blur-md active:scale-95 active:bg-white/20"
      >
        MENU
      </button>
    </div>
  );
};

export default Emulator;