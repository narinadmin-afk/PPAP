/**
 * IndexedDB Local Storage Service for PPAP Management System
 * Provides offline-capable, high-capacity client-side binary storage
 * for engineering drawings, PDFs, CAD files, and test certs.
 */

import { ExternalProjectFile } from '../types/ppap';

const DB_NAME = 'PPAP_Offline_Vault';
const DB_VERSION = 1;
const STORE_FILES = 'files_metadata';
const STORE_BLOBS = 'files_blobs';

let dbInstance: IDBDatabase | null = null;

export const openPPAPDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store 1: Metadata
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const fileStore = db.createObjectStore(STORE_FILES, { keyPath: 'id' });
        fileStore.createIndex('projectId', 'projectId', { unique: false });
        fileStore.createIndex('category', 'category', { unique: false });
        fileStore.createIndex('elementId', 'elementId', { unique: false });
        fileStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }

      // Store 2: Binary Blobs
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
      }
    };

    request.onsuccess = event => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = event => {
      console.error('Failed to open IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Save file metadata and binary blob into IndexedDB
 */
export const saveFileToIndexedDB = async (
  fileMeta: ExternalProjectFile,
  fileContent: Blob | File | string
): Promise<ExternalProjectFile> => {
  const db = await openPPAPDatabase();

  return new Promise(async (resolve, reject) => {
    try {
      let blobToStore: Blob;

      if (fileContent instanceof Blob) {
        blobToStore = fileContent;
      } else if (typeof fileContent === 'string' && fileContent.startsWith('data:')) {
        // Convert Base64 Data URL to Blob
        const res = await fetch(fileContent);
        blobToStore = await res.blob();
      } else {
        // Fallback text/json blob
        blobToStore = new Blob([fileContent], { type: fileMeta.fileType || 'application/octet-stream' });
      }

      const tx = db.transaction([STORE_FILES, STORE_BLOBS], 'readwrite');
      const metaStore = tx.objectStore(STORE_FILES);
      const blobStore = tx.objectStore(STORE_BLOBS);

      const updatedMeta: ExternalProjectFile = {
        ...fileMeta,
        storageType: fileMeta.storageType || 'indexeddb'
      };

      metaStore.put(updatedMeta);
      blobStore.put({
        id: fileMeta.id,
        blob: blobToStore,
        fileName: fileMeta.fileName,
        fileType: fileMeta.fileType,
        size: blobToStore.size,
        updatedAt: new Date().toISOString()
      });

      tx.oncomplete = () => {
        resolve(updatedMeta);
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Retrieve binary blob from IndexedDB for downloading or previewing
 */
export const getFileBlobFromIndexedDB = async (fileId: string): Promise<Blob | null> => {
  const db = await openPPAPDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BLOBS, 'readonly');
    const store = tx.objectStore(STORE_BLOBS);
    const req = store.get(fileId);

    req.onsuccess = () => {
      const record = req.result;
      if (record && record.blob) {
        resolve(record.blob);
      } else {
        resolve(null);
      }
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
};

/**
 * Retrieve all files metadata from IndexedDB
 */
export const getAllFilesFromIndexedDB = async (): Promise<ExternalProjectFile[]> => {
  const db = await openPPAPDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const store = tx.objectStore(STORE_FILES);
    const req = store.getAll();

    req.onsuccess = () => {
      resolve(req.result || []);
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
};

/**
 * Delete file metadata and binary blob from IndexedDB
 */
export const deleteFileFromIndexedDB = async (fileId: string): Promise<boolean> => {
  const db = await openPPAPDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES, STORE_BLOBS], 'readwrite');
    tx.objectStore(STORE_FILES).delete(fileId);
    tx.objectStore(STORE_BLOBS).delete(fileId);

    tx.oncomplete = () => {
      resolve(true);
    };

    tx.onerror = () => {
      reject(tx.error);
    };
  });
};

/**
 * Get IndexedDB storage statistics (total file count & approximate bytes)
 */
export const getIndexedDBStorageStats = async (): Promise<{
  totalBytes: number;
  fileCount: number;
  formattedSize: string;
}> => {
  try {
    const db = await openPPAPDatabase();

    return new Promise(resolve => {
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result || [];
        let totalBytes = 0;
        records.forEach((r: any) => {
          if (r.size) {
            totalBytes += r.size;
          } else if (r.blob && r.blob.size) {
            totalBytes += r.blob.size;
          }
        });

        const formattedSize =
          totalBytes > 1024 * 1024
            ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
            : totalBytes > 1024
            ? `${(totalBytes / 1024).toFixed(1)} KB`
            : `${totalBytes} Bytes`;

        resolve({
          totalBytes,
          fileCount: records.length,
          formattedSize
        });
      };

      req.onerror = () => {
        resolve({ totalBytes: 0, fileCount: 0, formattedSize: '0 Bytes' });
      };
    });
  } catch {
    return { totalBytes: 0, fileCount: 0, formattedSize: '0 Bytes' };
  }
};
