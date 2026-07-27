import * as FileSystem from "expo-file-system";
import { Track, CacheInfo } from "../types";

let CACHE_DIR = "";
let INDEX_FILE = "";
let cacheDirInitialized = false;

async function ensureCacheDir(): Promise<string> {
  if (!cacheDirInitialized) {
    const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || "";
    CACHE_DIR = `${docDir}music_cache/`;
    INDEX_FILE = `${CACHE_DIR}cache_index.json`;
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
    cacheDirInitialized = true;
  }
  return CACHE_DIR;
}

let cacheIndex: CacheInfo[] = [];

export async function initCache(): Promise<void> {
  await ensureCacheDir();
  await loadIndex();
}

async function loadIndex(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(INDEX_FILE);
    if (info.exists) {
      const content = await FileSystem.readAsStringAsync(INDEX_FILE);
      cacheIndex = JSON.parse(content);
    }
  } catch {
    cacheIndex = [];
  }
}

async function saveIndex(): Promise<void> {
  await FileSystem.writeAsStringAsync(INDEX_FILE, JSON.stringify(cacheIndex));
}

export async function isTrackCached(trackId: string): Promise<boolean> {
  return cacheIndex.some((c) => c.trackId === trackId);
}

export async function getCachedPath(track: Track): Promise<string | null> {
  const entry = cacheIndex.find((c) => c.trackId === track.id);
  if (!entry) return null;

  const info = await FileSystem.getInfoAsync(entry.localPath);
  return info.exists ? entry.localPath : null;
}

export async function downloadTrack(track: Track): Promise<string | null> {
  try {
    const ext = track.format || "mp3";
    const localPath = `${CACHE_DIR}${track.id}.${ext}`;

    const downloadResumable = FileSystem.createDownloadResumable(
      track.downloadUrl,
      localPath
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) return null;

    const fileInfo = await FileSystem.getInfoAsync(localPath, { size: true });

    const entry: CacheInfo = {
      trackId: track.id,
      localPath,
      size: (fileInfo as any).size || 0,
      cachedAt: new Date().toISOString(),
    };

    const existingIndex = cacheIndex.findIndex((c) => c.trackId === track.id);
    if (existingIndex >= 0) {
      cacheIndex[existingIndex] = entry;
    } else {
      cacheIndex.push(entry);
    }

    await saveIndex();
    return localPath;
  } catch (e) {
    console.error("Download failed:", e);
    return null;
  }
}

export async function deleteCachedTrack(trackId: string): Promise<boolean> {
  const entry = cacheIndex.find((c) => c.trackId === trackId);
  if (!entry) return false;

  try {
    await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
    cacheIndex = cacheIndex.filter((c) => c.trackId !== trackId);
    await saveIndex();
    return true;
  } catch {
    cacheIndex = cacheIndex.filter((c) => c.trackId !== trackId);
    await saveIndex();
    return false;
  }
}

export async function getCacheSize(): Promise<{ files: number; bytes: number }> {
  const files = cacheIndex.length;
  const bytes = cacheIndex.reduce((sum, c) => sum + c.size, 0);
  return { files, bytes };
}

export async function clearAllCache(): Promise<void> {
  try {
    await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    cacheIndex = [];
    await saveIndex();
  } catch (e) {
    console.error("Failed to clear cache:", e);
  }
}

export function getCachedTracks(): CacheInfo[] {
  return [...cacheIndex];
}
