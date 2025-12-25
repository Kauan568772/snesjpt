import React, { useCallback, useRef, useState } from 'react';
import { BUTTONS, ALTERNATIVE_CONTROLLER_MAP } from '../constants';

interface VirtualControllerProps {
  onInput: (code: string, key: string, keyCode: number, pressed: boolean) => void;
  emulatorInstance?: any;
}

const VirtualController: React.FC<VirtualControllerProps> = ({ onInput, emulatorInstance }) => {
  const activeButtons = useRef<Set<string>>(new Set());
  const dpadRef = useRef<HTMLDivElement>(null);
  const [useAlternativeMapping, setUseAlternativeMapping] = useState(false);

  const vibrate = (duration: number = 8) => {
    if (navigator.vibrate) navigator.vibrate(duration);
  };

  const getButtonConfig = (btnId: string) => {
    if (useAlternativeMapping) {
      return (ALTERNATIVE_CONTROLLER_MAP as any)[btnId] || (BUTTONS as any)[btnId];
    }
    return (BUTTONS as any)[btnId];
  };

  const testButton = (btnId: string) => {
    const config = getButtonConfig(btnId);
    console.log(`Testing button ${btnId}:`, config);
    
    // Test input
    triggerInput(btnId, true);
    setTimeout(() => {
      triggerInput(btnId, false);
    }, 200);
  };

  const triggerInput = (btnId: string, pressed: boolean) => {
    const btn = getButtonConfig(btnId);
    if (!btn) {
      console.warn(`Button ${btnId} not found in mapping`);
      return;
    }

    if (pressed) {
      if (!activeButtons.current.has(btnId)) {
        activeButtons.current.add(btnId);
        
        // Send input to Nostalgist directly if available
        if (emulatorInstance && emulatorInstance.input) {
          emulatorInstance.input({
            code: btn.code,
            key: btn.key,
            keyCode: btn.keyCode,
            pressed: true
          });
        }
        
        // Also send via traditional keyboard event
        onInput(btn.code, btn.key, btn.keyCode, true);
        vibrate(10);
      }
    } else {
      if (activeButtons.current.has(btnId)) {
        activeButtons.current.delete(btnId);
        
        // Send input release to Nostalgist directly if available
        if (emulatorInstance && emulatorInstance.input) {
          emulatorInstance.input({
            code: btn.code,
            key: btn.key,
            keyCode: btn.keyCode,
            pressed: false
          });
        }
        
        // Also send via traditional keyboard event
        onInput(btn.code, btn.key, btn.keyCode, false);
      }
    }
  };

  // --- D-PAD LOGIC ---
  const handleDpadMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!dpadRef.current) return;

    let clientX, clientY;
    if ('targetTouches' in e) {
       const touch = e.targetTouches[0] || e.touches[0];
       if (!touch) return; 
       clientX = touch.clientX;
       clientY = touch.clientY;
    } else {
       if ((e as React.MouseEvent).buttons === 0) return; 
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

    const rect = dpadRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (clientX - centerX) / (rect.width / 2);
    const y = (clientY - centerY) / (rect.height / 2);

    const deadzone = 0.20; // Slightly larger deadzone for flat controls
    
    const up = y < -deadzone;
    const down = y > deadzone;
    const left = x < -deadzone;
    const right = x > deadzone;

    triggerInput('UP', up);
    triggerInput('DOWN', down);
    triggerInput('LEFT', left);
    triggerInput('RIGHT', right);

  }, [onInput]);

  const handleDpadEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerInput('UP', false);
    triggerInput('DOWN', false);
    triggerInput('LEFT', false);
    triggerInput('RIGHT', false);
  }, [onInput]);


  // --- GENERIC BUTTON LOGIC ---
  const handleBtnStart = (btnId: string, e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerInput(btnId, true);
  };

  const handleBtnEnd = (btnId: string, e: React.SyntheticEvent) => {
    e.preventDefault();
    triggerInput(btnId, false);
  };

  // Simple Flat Button Component
  const ActionButton = ({ id, className, label, colorClass }: any) => (
    <div
      className={`absolute flex items-center justify-center select-none active:opacity-50 ${className} ${colorClass}`}
      onTouchStart={(e) => handleBtnStart(id, e)}
      onTouchEnd={(e) => handleBtnEnd(id, e)}
      onMouseDown={(e) => handleBtnStart(id, e)}
      onMouseUp={(e) => handleBtnEnd(id, e)}
      onMouseLeave={(e) => handleBtnEnd(id, e)}
    >
      <span className="text-xl font-bold text-white pointer-events-none">{label}</span>
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between font-sans safe-area-inset pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* Debug Panel */}
      <div className="w-full flex justify-end px-2 pt-2 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-2 flex items-center gap-2">
          <button
            onClick={() => setUseAlternativeMapping(!useAlternativeMapping)}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              useAlternativeMapping 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {useAlternativeMapping ? 'Alt Layout' : 'Default Layout'}
          </button>
          <button
            onClick={() => testButton('A')}
            className="px-3 py-1 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-colors"
          >
            Test A
          </button>
          <div className="text-xs text-gray-400">
            {emulatorInstance ? '🎮 Connected' : '⚠️ No Emulator'}
          </div>
        </div>
      </div>
      
      {/* --- SHOULDER BUTTONS (Simple Rectangles) --- */}
      <div className="w-full flex justify-between px-2 pt-2">
          <div 
            onTouchStart={(e) => handleBtnStart('L', e)} onTouchEnd={(e) => handleBtnEnd('L', e)}
            className="w-32 h-14 bg-white/20 border border-white/30 rounded-br-2xl pointer-events-auto flex items-center justify-center active:bg-white/40"
          >
             <span className="text-white font-bold text-lg">L</span>
          </div>
          <div 
            onTouchStart={(e) => handleBtnStart('R', e)} onTouchEnd={(e) => handleBtnEnd('R', e)}
            className="w-32 h-14 bg-white/20 border border-white/30 rounded-bl-2xl pointer-events-auto flex items-center justify-center active:bg-white/40"
          >
             <span className="text-white font-bold text-lg">R</span>
          </div>
      </div>

      <div className="flex-1 flex items-end justify-between w-full relative pb-8 px-4 lg:px-12">
        
        {/* --- D-PAD (Simple Cross) --- */}
        <div 
          ref={dpadRef}
          className="relative w-48 h-48 pointer-events-auto touch-none"
          onTouchStart={handleDpadMove}
          onTouchMove={handleDpadMove}
          onTouchEnd={handleDpadEnd}
          onMouseDown={handleDpadMove}
          onMouseMove={handleDpadMove}
          onMouseUp={handleDpadEnd}
          onMouseLeave={handleDpadEnd}
        >
           {/* Visual Flat D-Pad */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
              <div className="w-14 h-40 bg-gray-600 rounded absolute"></div>
              <div className="h-14 w-40 bg-gray-600 rounded absolute"></div>
              <div className="w-14 h-14 bg-gray-500 rounded absolute z-10"></div> {/* Center */}
           </div>
        </div>

        {/* --- CENTER MENU (Simple Pills) --- */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
           <div className="flex flex-col items-center gap-1">
             <div 
                onTouchStart={(e) => handleBtnStart('SELECT', e)} onTouchEnd={(e) => handleBtnEnd('SELECT', e)}
                className="w-14 h-5 rounded-full bg-gray-600 border border-white/20 active:bg-gray-400"
             ></div>
             <span className="text-[10px] text-gray-400 font-bold">SEL</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <div 
                onTouchStart={(e) => handleBtnStart('START', e)} onTouchEnd={(e) => handleBtnEnd('START', e)}
                className="w-14 h-5 rounded-full bg-gray-600 border border-white/20 active:bg-gray-400"
             ></div>
             <span className="text-[10px] text-gray-400 font-bold">STA</span>
           </div>
        </div>

        {/* --- ACTION BUTTONS (Flat Circles) --- */}
        <div className="relative w-56 h-56 pointer-events-auto mb-2 mr-2">
            
            {/* X - Top */}
            <ActionButton 
              id="X" label="X"
              className="top-2 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-blue-400/50" 
              colorClass="bg-blue-600/40"
            />

            {/* A - Right */}
            <ActionButton 
              id="A" label="A"
              className="top-1/2 right-2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-red-400/50" 
              colorClass="bg-red-600/40"
            />
            
            {/* Y - Left */}
            <ActionButton 
              id="Y" label="Y"
              className="top-1/2 left-2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-green-400/50" 
              colorClass="bg-green-600/40"
            />

            {/* B - Bottom */}
            <ActionButton 
              id="B" label="B"
              className="bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-yellow-400/50" 
              colorClass="bg-yellow-500/40"
            />
        </div>

      </div>
    </div>
  );
};

export default VirtualController;