import React from 'react';

interface LibraryProps {
  onSelectRom: (file: File) => void;
}

const Library: React.FC<LibraryProps> = ({ onSelectRom }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onSelectRom(file);
      e.target.value = ''; // Reset so same file can be selected again
    }
  };

  return (
    <div className="min-h-screen bg-[#242424] text-gray-100 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Top Accent Line (US SNES Purple) */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#4f43ae] shadow-lg z-20"></div>

      {/* Background Texture (Subtle Noise/Plastic) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }}>
      </div>

      <div className="relative z-10 w-full max-w-md p-6 flex flex-col items-center gap-10">
        
        {/* Header - Retro Typography */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black italic tracking-wide text-gray-200 drop-shadow-md" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
            RETRO<span className="text-[#8b5cf6]">POCKET</span>
          </h1>
          <div className="flex justify-center gap-2 mt-3">
             {/* Super Famicom Colors */}
             <div className="w-8 h-2 bg-[#ef4444] rounded-sm"></div>
             <div className="w-8 h-2 bg-[#eab308] rounded-sm"></div>
             <div className="w-8 h-2 bg-[#3b82f6] rounded-sm"></div>
             <div className="w-8 h-2 bg-[#22c55e] rounded-sm"></div>
          </div>
          <p className="text-xs text-gray-400 font-bold tracking-[0.3em] uppercase mt-4">Portable Entertainment System</p>
        </div>

        {/* Main Interaction Area - "Cartridge Slot" */}
        <div className="w-full bg-[#1a1a1a] rounded-t-lg rounded-b-3xl p-1 shadow-2xl border-t border-white/10 border-b-4 border-black ring-1 ring-white/5">
           <div className="bg-[#202020] rounded-t rounded-b-2xl p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden">
              
              {/* Insert Arrow Decor */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-600">
                <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <div className="w-full mt-6 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                <label className="relative flex flex-col items-center justify-center w-full py-8 bg-[#2a2a2a] rounded-xl border-2 border-dashed border-gray-600 cursor-pointer hover:border-purple-400 hover:bg-[#333] transition-all active:scale-[0.98]">
                  <svg className="w-12 h-12 text-gray-400 mb-3 group-hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-lg font-bold text-gray-200 group-hover:text-white uppercase tracking-wide">Insert Cartridge</span>
                  <span className="text-xs text-gray-500 mt-1">.smc / .sfc / .zip</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".sfc,.smc,.zip"
                    onChange={handleFileChange} 
                  />
                </label>
              </div>

              <div className="w-full flex justify-between items-center px-1 border-t border-white/5 pt-4 mt-2">
                  <div className="text-[10px] text-gray-500 font-mono tracking-wider">POWER: ON</div>
                  <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
              </div>

           </div>
        </div>

        {/* Footer Info */}
        <div className="text-[10px] text-gray-600 font-mono text-center uppercase tracking-wider">
          <p>Core: Snes9x 2005</p>
          <p className="mt-1 opacity-50">Use 'Add to Home Screen' for full experience</p>
        </div>

      </div>
      
      {/* Bottom Vent Detail */}
      <div className="absolute bottom-6 w-full flex justify-center gap-2 opacity-20">
         {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1.5 h-6 bg-black rounded-full shadow-inner"></div>
         ))}
      </div>

    </div>
  );
};

export default Library;