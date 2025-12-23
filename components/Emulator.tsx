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
  const [status, setStatus] = useState<EmulatorStatus>(EmulatorStatus.LOADING);

  // Function to request wake lock (keep screen on)
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock active');
      } catch (err: any) {
        console.warn('Wake Lock Error:', err.name, err.message);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startEmulator = async () => {
      if (!window.Nostalgist) {
        onError('Emulator core library not loaded.');
        return;
      }

      try {
        console.log('Launching Emulator with ROM:', rom.name);
        
        // Request wake lock immediately on launch
        await requestWakeLock();

        // Nostalgist configuration
        // Using snes9x2010 for better performance on mobile devices
        emulatorInstance.current = await window.Nostalgist.launch({
          element: canvasRef.current,
          rom: rom.file,
          core: 'snes9x2010', 
          style: {
             width: '100%',
             height: '100%',
             position: 'absolute',
             top: '0',
             left: '0',
             objectFit: 'contain',
             backgroundColor: 'black',
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
    
    // Re-acquire wake lock if visibility changes (e.g., user tabs out and back)
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
    
    // Create a comprehensive keyboard event
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
    
    // Force legacy properties for Emscripten/SDL compatibility
    Object.defineProperty(event, 'keyCode', { get: () => keyCode });
    Object.defineProperty(event, 'which', { get: () => keyCode });

    document.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
      {/* Monochrome Loading Overlay */}
      {status === EmulatorStatus.LOADING && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin mb-4"></div>
          <p className="text-sm tracking-widest">LOADING SYSTEM...</p>
        </div>
      )}

      {/* The Emulator Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full object-contain image-pixelated" />

      {/* Mobile Controls Overlay */}
      <VirtualController onInput={handleInput} />

      {/* Minimalist Exit Button */}
      <button 
        onClick={onExit}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] text-gray-500 px-3 py-1 text-[10px] uppercase border border-gray-700 bg-black/80 hover:bg-white hover:text-black transition-colors backdrop-blur"
      >
        Close Game
      </button>
    </div>
  );
};

export default Emulator;