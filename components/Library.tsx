import React from 'react';

interface LibraryProps {
  onSelectRom: (file: File) => void;
}

const Library: React.FC<LibraryProps> = ({ onSelectRom }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onSelectRom(file);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-md border-2 border-white p-8 relative">
        {/* Decorative corners */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-black border-t-2 border-l-2 border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-black border-t-2 border-r-2 border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-black border-b-2 border-l-2 border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black border-b-2 border-r-2 border-white"></div>

        <header className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-widest border-b-2 border-white pb-2 inline-block">
            SNES.EMU
          </h1>
          <p className="text-xs mt-2 text-gray-400 uppercase tracking-widest">Mobile System</p>
        </header>

        <div className="space-y-8">
          {/* Upload Button */}
          <div className="relative group">
            <div className="w-full h-20 border-2 border-white flex items-center justify-center bg-black hover:bg-white hover:text-black transition-colors cursor-pointer">
              <span className="font-bold tracking-wider">[ LOAD CARTRIDGE ]</span>
            </div>
            
            <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileChange} 
            />
          </div>

          {/* Instructions */}
          <div className="text-xs space-y-2 text-gray-400 border-t border-gray-800 pt-4">
             <div className="flex justify-between">
               <span>ORIENTATION</span>
               <span className="text-white">LANDSCAPE</span>
             </div>
             <div className="flex justify-between">
               <span>INPUT</span>
               <span className="text-white">MULTI-TOUCH</span>
             </div>
             <div className="flex justify-between">
               <span>FORMATS</span>
               <span className="text-white">.SFC .SMC .ZIP</span>
             </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-[10px] text-gray-600 font-mono">
        NOSTALGIST CORE / SNES9X
      </div>
    </div>
  );
};

export default Library;