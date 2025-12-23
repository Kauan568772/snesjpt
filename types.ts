export interface RomData {
  name: string;
  file: File;
  lastPlayed?: number;
}

export enum EmulatorStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RUNNING = 'RUNNING',
  ERROR = 'ERROR',
}

export interface ButtonConfig {
  id: string;
  label?: string;
  code: string; // The physical key code (e.g., 'KeyZ', 'ArrowUp')
  key: string;  // The key value (e.g., 'z', 'ArrowUp')
  keyCode: number; // Legacy numeric key code (required for many Emscripten cores)
  className?: string;
}

// Global definition for the Nostalgist library loaded via CDN
declare global {
  interface Window {
    Nostalgist: {
      launch: (options: any) => Promise<any>;
    };
  }
}