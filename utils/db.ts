import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// Helper: Convert Blob to Base64 (Required for Capacitor Filesystem)
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/octet-stream;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.readAsDataURL(blob);
  });
};

// Helper: Convert Base64 string back to Blob
const base64ToBlob = (base64: string, type = 'application/octet-stream'): Blob => {
  const binStr = atob(base64);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  return new Blob([arr], { type });
};

const SAVE_FOLDER = 'snes_saves';

export const saveStateToDB = async (romName: string, blob: Blob): Promise<void> => {
  try {
    console.log(`[NativeFS] Preparing to save state for ${romName}...`);

    // Validation
    if (blob.size < 1024) {
      throw new Error("Invalid state data size: " + blob.size);
    }

    const base64Data = await blobToBase64(blob);
    const fileName = `${romName.replace(/[^a-zA-Z0-9._-]/g, '_')}.sav`;
    const fullPath = `${SAVE_FOLDER}/${fileName}`;

    console.log(`[NativeFS] Writing to ${fullPath} via Kotlin Bridge...`);

    await Filesystem.writeFile({
      path: fullPath,
      data: base64Data,
      directory: Directory.Data, // Uses internal app storage (Safe, no extra permissions needed)
      recursive: true // Automatically creates the folder
    });

    console.log("[NativeFS] Save successful");
  } catch (err) {
    console.error("Native Save Error:", err);
    throw err;
  }
};

export const loadStateFromDB = async (romName: string): Promise<Blob | null> => {
  try {
    const fileName = `${romName.replace(/[^a-zA-Z0-9._-]/g, '_')}.sav`;
    const fullPath = `${SAVE_FOLDER}/${fileName}`;

    console.log(`[NativeFS] Attempting to load from ${fullPath}...`);

    try {
      const result = await Filesystem.readFile({
        path: fullPath,
        directory: Directory.Data
      });

      if (result.data) {
        // Capacitor might return data as a string (base64)
        const base64 = typeof result.data === 'string' ? result.data : String(result.data);
        const blob = base64ToBlob(base64);
        console.log(`[NativeFS] Loaded state. Size: ${blob.size} bytes`);
        return blob;
      }
    } catch (readErr) {
      // If file doesn't exist, Filesystem throws an error. We treat this as "no save found".
      console.log(`[NativeFS] No save file found for ${romName}`);
      return null;
    }
    
    return null;
  } catch (err) {
    console.error("Native Load Error:", err);
    throw err;
  }
};