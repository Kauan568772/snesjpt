import React, { useCallback, useRef, useState } from 'react';
import { BUTTONS } from '../constants';

interface VirtualControllerProps {
  onInput: (code: string, key: string, keyCode: number, pressed: boolean) => void;
}

const VirtualController: React.FC<VirtualControllerProps> = ({ onInput }) => {
  // Track active buttons to avoid spamming events
  const activeButtons = useRef<Set<string>>(new Set());
  const dpadRef = useRef<HTMLDivElement>(null);

  const vibrate = (duration: number = 10) => {
    if (navigator.vibrate) navigator.vibrate(duration);
  };

  const triggerInput = (btnId: string, pressed: boolean) => {
    const btn = BUTTONS[btnId];
    if (!btn) return;

    if (pressed) {
      if (!activeButtons.current.has(btnId)) {
        activeButtons.current.add(btnId);
        onInput(btn.code, btn.key, btn.keyCode, true);
        vibrate(10);
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
    e.preventDefault();
    if (!dpadRef.current) return;

    // Get input coordinates
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
    
    // Calculate distance from center normalized (-1 to 1 approximately)
    const x = (clientX - centerX) / (rect.width / 2);
    const y = (clientY - centerY) / (rect.height / 2);

    const deadzone = 0.2; 

    // Check directions
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

  // Reusable Button Component
  const ActionButton = ({ id, className, children, style }: { id: string, className: string, children: React.ReactNode, style?: React.CSSProperties }) => (
    <div
      className={`absolute flex items-center justify-center select-none transition-transform active:scale-95 pointer-events-auto ${className}`}
      style={style}
      onTouchStart={(e) => handleBtnStart(id, e)}
      onTouchEnd={(e) => handleBtnEnd(id, e)}
      onMouseDown={(e) => handleBtnStart(id, e)}
      onMouseUp={(e) => handleBtnEnd(id, e)}
      onMouseLeave={(e) => handleBtnEnd(id, e)}
    >
      {children}
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between font-mono safe-area-inset-bottom">
      
      {/* --- SHOULDER BUTTONS (FIXED CORNERS) --- */}
      {/* Re-positioned L and R buttons to ensure they are visible and easy to hit */}
      <ActionButton 
        id="L" 
        className="h-16 w-32 border-b-2 border-r-2 border-gray-500 bg-gray-900/80 text-white rounded-br-2xl active:bg-gray-700"
        style={{ top: 0, left: 0 }}
      >
         <span className="font-bold text-xl ml-2">L</span>
      </ActionButton>

      <ActionButton 
        id="R" 
        className="h-16 w-32 border-b-2 border-l-2 border-gray-500 bg-gray-900/80 text-white rounded-bl-2xl active:bg-gray-700"
        style={{ top: 0, right: 0 }}
      >
         <span className="font-bold text-xl mr-2">R</span>
      </ActionButton>

      <div className="flex-1 flex items-end justify-between w-full relative pb-8 px-8 mt-16">
        
        {/* --- D-PAD AREA --- */}
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
           {/* Visual D-Pad */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-full bg-gray-800 border-2 border-gray-600 rounded"></div>
              <div className="absolute w-full h-16 bg-gray-800 border-2 border-gray-600 rounded"></div>
              <div className="absolute w-4 h-4 bg-black rounded-full opacity-50"></div>
           </div>
           
           <div className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-500 font-bold">▲</div>
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 font-bold">▼</div>
           <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-bold">◀</div>
           <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 font-bold">▶</div>
        </div>

        {/* --- CENTER MENU --- */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
           <ActionButton id="SELECT" className="w-16 h-8 border border-gray-500 rounded-full bg-black active:bg-gray-700">
             <span className="text-[10px] tracking-widest text-gray-400">SEL</span>
           </ActionButton>
           <ActionButton id="START" className="w-16 h-8 border border-gray-500 rounded-full bg-black active:bg-gray-700">
             <span className="text-[10px] tracking-widest text-gray-400">START</span>
           </ActionButton>
        </div>

        {/* --- ACTION BUTTONS (ABXY) --- */}
        <div className="relative w-56 h-56 pointer-events-auto">
            {/* X - Top */}
            <ActionButton id="X" className="top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-white bg-blue-900/50 backdrop-blur active:bg-blue-500 group">
               <span className="text-xl font-bold text-white group-active:text-white">X</span>
            </ActionButton>

            {/* A - Right */}
            <ActionButton id="A" className="top-1/2 right-0 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white bg-red-900/50 backdrop-blur active:bg-red-500 group">
               <span className="text-xl font-bold text-white group-active:text-white">A</span>
            </ActionButton>
            
            {/* Y - Left */}
            <ActionButton id="Y" className="top-1/2 left-0 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white bg-green-900/50 backdrop-blur active:bg-green-500 group">
               <span className="text-xl font-bold text-white group-active:text-white">Y</span>
            </ActionButton>

            {/* B - Bottom */}
            <ActionButton id="B" className="bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-white bg-yellow-900/50 backdrop-blur active:bg-yellow-500 group">
               <span className="text-xl font-bold text-white group-active:text-white">B</span>
            </ActionButton>
        </div>

      </div>
    </div>
  );
};

export default VirtualController;