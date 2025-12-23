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
  L: { code: 'KeyQ', key: 'q', keyCode: 81 },
  R: { code: 'KeyW', key: 'w', keyCode: 87 },
  SELECT: { code: 'ShiftRight', key: 'Shift', keyCode: 16 },
  START: { code: 'Enter', key: 'Enter', keyCode: 13 },
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