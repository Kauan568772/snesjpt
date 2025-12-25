import { ButtonConfig } from './types';

// Precise mapping for Emscripten/SDL applications
// We include keyCode because many older WASM ports rely on it (event.which / event.keyCode)
export const CONTROLLER_MAP = {
  UP: { code: 'ArrowUp', key: 'ArrowUp', keyCode: 38 },
  DOWN: { code: 'ArrowDown', key: 'ArrowDown', keyCode: 40 },
  LEFT: { code: 'ArrowLeft', key: 'ArrowLeft', keyCode: 37 },
  RIGHT: { code: 'ArrowRight', key: 'ArrowRight', keyCode: 39 },
  A: { code: 'KeyX', key: 'x', keyCode: 88 },     // SNES A = Keyboard x
  B: { code: 'KeyZ', key: 'z', keyCode: 90 },     // SNES B = Keyboard z
  X: { code: 'KeyS', key: 's', keyCode: 83 },     // SNES X = Keyboard s
  Y: { code: 'KeyA', key: 'a', keyCode: 65 },     // SNES Y = Keyboard a
  L: { code: 'KeyQ', key: 'q', keyCode: 81 },     // SNES L = Keyboard q
  R: { code: 'KeyW', key: 'w', keyCode: 87 },     // SNES R = Keyboard w
  SELECT: { code: 'ShiftRight', key: 'Shift', keyCode: 16 }, // SELECT = Right Shift
  START: { code: 'Enter', key: 'Enter', keyCode: 13 },       // START = Enter
};

// Alternative mappings for better compatibility
export const ALTERNATIVE_CONTROLLER_MAP = {
  UP: { code: 'ArrowUp', key: 'ArrowUp', keyCode: 38 },
  DOWN: { code: 'ArrowDown', key: 'ArrowDown', keyCode: 40 },
  LEFT: { code: 'ArrowLeft', key: 'ArrowLeft', keyCode: 37 },
  RIGHT: { code: 'ArrowRight', key: 'ArrowRight', keyCode: 39 },
  A: { code: 'KeyJ', key: 'j', keyCode: 74 },     // Alternative: SNES A = Keyboard j
  B: { code: 'KeyK', key: 'k', keyCode: 75 },     // Alternative: SNES B = Keyboard k
  X: { code: 'KeyU', key: 'u', keyCode: 85 },     // Alternative: SNES X = Keyboard u
  Y: { code: 'KeyI', key: 'i', keyCode: 73 },     // Alternative: SNES Y = Keyboard i
  L: { code: 'KeyO', key: 'o', keyCode: 79 },     // Alternative: SNES L = Keyboard o
  R: { code: 'KeyP', key: 'p', keyCode: 80 },     // Alternative: SNES R = Keyboard p
  SELECT: { code: 'Space', key: ' ', keyCode: 32 }, // Alternative: SELECT = Space
  START: { code: 'Enter', key: 'Enter', keyCode: 13 },   // START = Enter
};

export const BUTTONS: Record<string, ButtonConfig> = {
  UP: { id: 'UP', ...CONTROLLER_MAP.UP },
  DOWN: { id: 'DOWN', ...CONTROLLER_MAP.DOWN },
  LEFT: { id: 'LEFT', ...CONTROLLER_MAP.LEFT },
  RIGHT: { id: 'RIGHT', ...CONTROLLER_MAP.RIGHT },
  A: { id: 'A', label: 'A', ...CONTROLLER_MAP.A },
  B: { id: 'B', label: 'B', ...CONTROLLER_MAP.B },
  X: { id: 'X', label: 'X', ...CONTROLLER_MAP.X },
  Y: { id: 'Y', label: 'Y', ...CONTROLLER_MAP.Y },
  SELECT: { id: 'SELECT', label: 'SELECT', ...CONTROLLER_MAP.SELECT },
  START: { id: 'START', label: 'START', ...CONTROLLER_MAP.START },
  L: { id: 'L', label: 'L', ...CONTROLLER_MAP.L },
  R: { id: 'R', label: 'R', ...CONTROLLER_MAP.R },
};