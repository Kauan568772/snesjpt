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

  // Force Fullscreen helper
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log(err));
    } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
      (elem as any).webkitRequestFullscreen();
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
          fpsRef.current.innerText = `FPS: ${frameCount}`;
          fpsRef.current.style.color = frameCount < 58 ? 'yellow' : '#00ff00';
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
        // Attempt fullscreen on launch
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
    
    // Retry fullscreen on input if not active (many browsers require user interaction)
    if (pressed && !document.fullscreenElement) {
        enterFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden select-none touch-none">
      
      {/* Background fill */}
      <div className="absolute inset-0 bg-black z-0"></div>

      {/* Main Game Container */}
      <div className="relative w-full h-full z-10 flex items-center justify-center">
        
        {/* Loading Overlay */}
        {status === EmulatorStatus.LOADING && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
             <p className="text-xl font-mono animate-pulse">LOADING SYSTEM...</p>
          </div>
        )}

        {/* The Emulator Canvas */}
        <canvas ref={canvasRef} className="block w-full h-full object-contain image-pixelated" />

        {/* FPS Counter - Fixed Position and High Z-Index */}
        <div 
            ref={fpsRef} 
            className="absolute top-2 right-4 z-[100] font-mono text-sm bg-black/50 px-2 py-1 text-green-400 border border-white/20"
        >
            FPS: ..
        </div>
      </div>

      {/* Mobile Controls */}
      <VirtualController onInput={handleInput} />

      {/* Menu Button */}
      <button 
        onClick={onExit}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] text-gray-400 px-4 py-2 text-xs font-bold border border-gray-600 bg-black/40"
      >
        EXIT
      </button>
    </div>
  );
};

export default Emulator;