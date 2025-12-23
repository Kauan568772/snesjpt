import React, { useCallback, useRef } from 'react';
import { BUTTONS } from '../constants';

interface VirtualControllerProps {
  onInput: (code: string, key: string, keyCode: number, pressed: boolean) => void;
}

const VirtualController: React.FC<VirtualControllerProps> = ({ onInput }) => {
  const activeButtons = useRef<Set<string>>(new Set());
  const dpadRef = useRef<HTMLDivElement>(null);
  
  // Visual feedback refs to avoid React renders
  const dpadVisualRef = useRef<HTMLDivElement>(null);

  const vibrate = (duration: number = 8) => {
    if (navigator.vibrate) navigator.vibrate(duration);
  };

  const triggerInput = (btnId: string, pressed: boolean) => {
    const btn = BUTTONS[btnId];
    if (!btn) return;

    if (pressed) {
      if (!activeButtons.current.has(btnId)) {
        activeButtons.current.add(btnId);
        onInput(btn.code, btn.key, btn.keyCode, true);
        vibrate(8); // Short, sharp vibration
      }
    } else {
      if (activeButtons.current.has(btnId)) {
        activeButtons.current.delete(btnId);
        onInput(btn.code, btn.key, btn.keyCode, false);
      }
    }
  };

  // --- D-PAD LOGIC ---
  const handleDpadMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); // Critical to prevent scrolling/zooming
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
    
    // Normalize coordinates (-1 to 1)
    const x = (clientX - centerX) / (rect.width / 2);
    const y = (clientY - centerY) / (rect.height / 2);

    // Deadzone and Sensitivity
    const deadzone = 0.15; 
    
    const up = y < -deadzone;
    const down = y > deadzone;
    const left = x < -deadzone;
    const right = x > deadzone;

    triggerInput('UP', up);
    triggerInput('DOWN', down);
    triggerInput('LEFT', left);
    triggerInput('RIGHT', right);

    // Update D-Pad Visual Tilt (Optional polish)
    if (dpadVisualRef.current) {
        const rotateX = down ? 10 : (up ? -10 : 0);
        const rotateY = right ? 10 : (left ? -10 : 0);
        dpadVisualRef.current.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

  }, [onInput]);

  const handleDpadEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerInput('UP', false);
    triggerInput('DOWN', false);
    triggerInput('LEFT', false);
    triggerInput('RIGHT', false);
    
    if (dpadVisualRef.current) {
        dpadVisualRef.current.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg)';
    }
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

  // Reusable styled button
  const ActionButton = ({ id, className, children, colorClass = "bg-gray-800" }: any) => (
    <div
      className={`absolute flex items-center justify-center select-none transition-all active:scale-90 pointer-events-auto shadow-lg shadow-black/30 backdrop-blur-sm ${className} ${colorClass}`}
      onTouchStart={(e) => handleBtnStart(id, e)}
      onTouchEnd={(e) => handleBtnEnd(id, e)}
      onMouseDown={(e) => handleBtnStart(id, e)}
      onMouseUp={(e) => handleBtnEnd(id, e)}
      onMouseLeave={(e) => handleBtnEnd(id, e)}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
      {children}
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between font-sans safe-area-inset pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* --- SHOULDER BUTTONS --- */}
      <div className="w-full flex justify-between px-2 pt-2">
          <div 
            onTouchStart={(e) => handleBtnStart('L', e)} onTouchEnd={(e) => handleBtnEnd('L', e)}
            className="w-32 h-14 bg-gray-800/40 backdrop-blur-md rounded-bl-3xl rounded-tr-md border-t border-l border-white/10 shadow-lg active:bg-gray-700/60 pointer-events-auto flex items-center justify-center ml-2 transition-colors"
          >
             <span className="text-white/60 font-bold text-lg drop-shadow-md">L</span>
          </div>
          <div 
            onTouchStart={(e) => handleBtnStart('R', e)} onTouchEnd={(e) => handleBtnEnd('R', e)}
            className="w-32 h-14 bg-gray-800/40 backdrop-blur-md rounded-br-3xl rounded-tl-md border-t border-r border-white/10 shadow-lg active:bg-gray-700/60 pointer-events-auto flex items-center justify-center mr-2 transition-colors"
          >
             <span className="text-white/60 font-bold text-lg drop-shadow-md">R</span>
          </div>
      </div>

      <div className="flex-1 flex items-end justify-between w-full relative pb-8 px-6 lg:px-12">
        
        {/* --- D-PAD --- */}
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
           {/* Visual D-Pad Container */}
           <div 
             ref={dpadVisualRef}
             className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75"
           >
              {/* D-Pad Base Cross */}
              <div className="relative w-40 h-40 opacity-80">
                <div className="absolute left-1/2 top-0 bottom-0 w-14 -translate-x-1/2 bg-gradient-to-b from-gray-700 to-gray-900 rounded shadow-black shadow-md border border-gray-600/50 backdrop-blur-sm"></div>
                <div className="absolute top-1/2 left-0 right-0 h-14 -translate-y-1/2 bg-gradient-to-b from-gray-700 to-gray-900 rounded shadow-black shadow-md border border-gray-600/50 backdrop-blur-sm"></div>
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 inset-shadow"></div>
                
                {/* Arrows */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/30 text-xl">▲</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/30 text-xl">▼</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 text-xl">◀</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 text-xl">▶</div>
              </div>
           </div>
        </div>

        {/* --- CENTER MENU --- */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 pointer-events-auto">
           <div className="flex flex-col items-center gap-1">
             <div 
                onTouchStart={(e) => handleBtnStart('SELECT', e)} onTouchEnd={(e) => handleBtnEnd('SELECT', e)}
                className="w-16 h-6 rounded-full bg-gray-700/80 border border-gray-500/50 shadow-inner transform -rotate-12 active:scale-95 active:bg-gray-600"
             ></div>
             <span className="text-[10px] tracking-widest text-gray-500 font-bold">SELECT</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <div 
                onTouchStart={(e) => handleBtnStart('START', e)} onTouchEnd={(e) => handleBtnEnd('START', e)}
                className="w-16 h-6 rounded-full bg-gray-700/80 border border-gray-500/50 shadow-inner transform -rotate-12 active:scale-95 active:bg-gray-600"
             ></div>
             <span className="text-[10px] tracking-widest text-gray-500 font-bold">START</span>
           </div>
        </div>

        {/* --- ACTION BUTTONS (ABXY) --- */}
        <div className="relative w-56 h-56 pointer-events-auto transform rotate-[-15deg] mb-4 mr-2">
            {/* Background container for buttons */}
            <div className="absolute inset-4 rounded-full bg-gray-900/20 backdrop-blur-sm -z-10 border border-white/5"></div>

            {/* X - Top - Blue */}
            <ActionButton 
              id="X" 
              className="top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-b-4 border-blue-900/50" 
              colorClass="bg-blue-600/80"
            >
               <span className="text-xl font-bold text-blue-100/90">X</span>
            </ActionButton>

            {/* A - Right - Red */}
            <ActionButton 
              id="A" 
              className="top-1/2 right-0 -translate-y-1/2 w-16 h-16 rounded-full border-b-4 border-red-900/50" 
              colorClass="bg-red-600/80"
            >
               <span className="text-xl font-bold text-red-100/90">A</span>
            </ActionButton>
            
            {/* Y - Left - Green */}
            <ActionButton 
              id="Y" 
              className="top-1/2 left-0 -translate-y-1/2 w-16 h-16 rounded-full border-b-4 border-green-900/50" 
              colorClass="bg-green-600/80"
            >
               <span className="text-xl font-bold text-green-100/90">Y</span>
            </ActionButton>

            {/* B - Bottom - Yellow */}
            <ActionButton 
              id="B" 
              className="bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-b-4 border-yellow-900/50" 
              colorClass="bg-yellow-500/80"
            >
               <span className="text-xl font-bold text-yellow-100/90">B</span>
            </ActionButton>
        </div>

      </div>
    </div>
  );
};

export default VirtualController;