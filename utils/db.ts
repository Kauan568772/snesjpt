export const DB_NAME = 'RetroPocketDB';
export const STORE_NAME = 'snes_states_v2';
const DB_VERSION = 2;

// Helper: robustly convert any Blob-like/Buffer object to ArrayBuffer
const blobToBuffer = async (data: any): Promise<ArrayBuffer> => {
  if (!data) {
    throw new Error("Data is null or undefined");
  }

  // 1. If it's already an ArrayBuffer, return it directly
  if (data instanceof ArrayBuffer) {
    return data;
  }

  // 2. If it's a TypedArray (like Uint8Array), return its underlying buffer
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice().buffer;
  }

  // 3. Use the Response API (Modern & Robust)
  try {
    return await new Response(data).arrayBuffer();
  } catch (e) {
    // 4. Ultimate fallback: Try to reconstruct a clean Blob and use FileReader
    console.warn("Response API failed, falling back to manual FileReader", e);
    
    return new Promise((resolve, reject) => {
      try {
        const safeBlob = new Blob([data], { type: data.type || 'application/octet-stream' });
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error("FileReader result was not an ArrayBuffer"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(safeBlob);
      } catch (err) {
        reject(err);
      }
    });
  }
};

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error("DB Open Error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const saveStateToDB = async (romName: string, blob: any): Promise<void> => {
  try {
    console.log(`[DB] Preparing to save state for ${romName}...`);
    
    // 1. Convert input to ArrayBuffer safely
    const arrayBuffer = await blobToBuffer(blob);
    
    console.log(`[DB] Converted to buffer. Size: ${arrayBuffer.byteLength} bytes`);

    // Validation: SNES states are complex. 15 bytes is definitely an error message or corruption.
    // Minimum safe size guess: 1KB.
    if (arrayBuffer.byteLength < 1024) {
       console.error("Attempted to save suspicious state data (<1KB). Likely an FS error message.");
       throw new Error("Invalid state data size: " + arrayBuffer.byteLength);
    }
    
    // 2. Open DB
    const db = await openDB();
    
    // 3. Store the ArrayBuffer
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const data = {
        rom: romName,
        buffer: arrayBuffer,
        timestamp: Date.now()
      };

      const request = store.put(data, romName);

      request.onsuccess = () => {
        console.log("[DB] Save successful");
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Save State Error:", err);
    throw err;
  }
};

export const loadStateFromDB = async (romName: string): Promise<Blob | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(romName);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.buffer) {
          console.log(`[DB] Loaded state for ${romName}. Size: ${result.buffer.byteLength} bytes`);
          // Convert the stored ArrayBuffer back to a Blob for the emulator
          const blob = new Blob([result.buffer], { type: 'application/octet-stream' });
          resolve(blob);
        } else {
          console.log(`[DB] No save found for ${romName}`);
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Load State Error:", err);
    throw err;
  }
};