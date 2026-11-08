/**
 * Google Drive Integration Service for PPAP Management System
 * Uses Firebase Client Auth and Google Drive REST API v3
 * Scopes: https://www.googleapis.com/auth/drive.file
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { ExternalProjectFile } from '../types/ppap';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider with drive.file scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token management (per security guidelines, not in localStorage)
let cachedAccessToken: string | null = null;
let cachedDriveFolderId: string | null = null;

export const initDriveAuthListener = (
  onAuthChange: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async user => {
    if (user && cachedAccessToken) {
      onAuthChange(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      onAuthChange(null, null);
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive access token');
    }

    cachedAccessToken = credential.accessToken;
    return {
      user: result.user,
      accessToken: cachedAccessToken
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const signOutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedDriveFolderId = null;
};

/**
 * Locate or create the dedicated "PPAP_Management_System" folder in Google Drive
 */
export const getOrCreatePPAPFolder = async (
  accessToken: string,
  folderName = 'PPAP_Management_System'
): Promise<string> => {
  if (cachedDriveFolderId) {
    return cachedDriveFolderId;
  }

  // 1. Search for existing folder
  const query = encodeURIComponent(
    `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      cachedDriveFolderId = data.files[0].id;
      return cachedDriveFolderId;
    }
  }

  // 2. Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'PPAP Quality Documents, Drawings, and IATF 16949 Submission Packages'
    })
  });

  if (!createRes.ok) {
    throw new Error('Could not create PPAP folder on Google Drive');
  }

  const folderData = await createRes.json();
  cachedDriveFolderId = folderData.id;
  return cachedDriveFolderId;
};

/**
 * Upload binary file to Google Drive using multipart upload
 */
export const uploadFileToGoogleDrive = async (
  accessToken: string,
  file: Blob | File,
  meta: {
    fileName: string;
    mimeType?: string;
    description?: string;
    projectId?: string;
    elementId?: number;
  }
): Promise<{
  fileId: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: number;
}> => {
  const folderId = await getOrCreatePPAPFolder(accessToken);
  const mimeType = meta.mimeType || 'application/octet-stream';

  const metadata = {
    name: meta.fileName,
    parents: [folderId],
    description: meta.description || `PPAP Element ${meta.elementId || ''} Document`,
    properties: {
      projectId: meta.projectId || '',
      elementId: String(meta.elementId || '')
    }
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' });

  // Read binary data
  const fileArrayBuffer = await file.arrayBuffer();
  const fileDataBlob = new Blob([fileArrayBuffer], { type: mimeType });

  const multipartBody = new Blob(
    [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      metadataBlob,
      delimiter,
      `Content-Type: ${mimeType}\r\n\r\n`,
      fileDataBlob,
      closeDelimiter
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('Google Drive Upload Failed:', errText);
    throw new Error(`Google Drive upload failed: ${res.statusText}`);
  }

  const result = await res.json();
  return {
    fileId: result.id,
    name: result.name,
    webViewLink: result.webViewLink,
    webContentLink: result.webContentLink,
    size: Number(result.size) || file.size
  };
};

/**
 * List files in the PPAP Google Drive folder
 */
export const listPPAPGoogleDriveFiles = async (
  accessToken: string
): Promise<Array<any>> => {
  const folderId = await getOrCreatePPAPFolder(accessToken);
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime)&orderBy=modifiedTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!res.ok) {
    throw new Error('Failed to list files from Google Drive');
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Delete file from Google Drive (Requires user confirmation in UI before calling!)
 */
export const deleteFileFromGoogleDrive = async (
  accessToken: string,
  fileId: string
): Promise<boolean> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return res.ok;
};
