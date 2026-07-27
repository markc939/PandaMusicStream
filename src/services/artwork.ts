import * as FileSystem from "expo-file-system";

const CACHE_FILE = `${FileSystem.documentDirectory}artwork_cache.json`;
const ITUNES_SEARCH = "https://itunes.apple.com/search";

let artworkCache: Record<string, string> = {};
let cacheLoaded = false;

async function loadCache(): Promise<void> {
  if (cacheLoaded) return;
  try {
    const info = await FileSystem.getInfoAsync(CACHE_FILE);
    if (info.exists) {
      const raw = await FileSystem.readAsStringAsync(CACHE_FILE);
      artworkCache = JSON.parse(raw);
    }
  } catch {
    artworkCache = {};
  }
  cacheLoaded = true;
}

async function saveCache(): Promise<void> {
  await FileSystem.writeAsStringAsync(CACHE_FILE, JSON.stringify(artworkCache));
}

function cacheKey(artist: string, album: string): string {
  return `${artist.toLowerCase().trim()}|${album.toLowerCase().trim()}`;
}

export async function getCachedArtwork(artist: string, album: string): Promise<string | null> {
  await loadCache();
  return artworkCache[cacheKey(artist, album)] || null;
}

export interface ArtworkFetchProgress {
  total: number;
  completed: number;
  found: number;
  current: string;
}

type ArtworkProgressCallback = (progress: ArtworkFetchProgress) => void;

export async function fetchMissingArtwork(
  items: { artist: string; album: string }[],
  onProgress?: ArtworkProgressCallback
): Promise<number> {
  await loadCache();
  let found = 0;

  for (let i = 0; i < items.length; i++) {
    const { artist, album } = items[i];
    const key = cacheKey(artist, album);

    if (artworkCache[key]) {
      found++;
      onProgress?.({
        total: items.length,
        completed: i + 1,
        found,
        current: `${artist} - ${album}`,
      });
      continue;
    }

    try {
      const url = await searchItunes(artist, album);
      if (url) {
        artworkCache[key] = url;
        found++;
      }
    } catch {
    }

    onProgress?.({
      total: items.length,
      completed: i + 1,
      found,
      current: `${artist} - ${album}`,
    });
  }

  await saveCache();
  return found;
}

async function searchItunes(artist: string, album: string): Promise<string | null> {
  const query = encodeURIComponent(`${artist} ${album}`);
  const res = await fetch(`${ITUNES_SEARCH}?term=${query}&entity=album&limit=3&country=US`);

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  for (const result of data.results) {
    const resultArtist = (result.artistName || "").toLowerCase().trim();
    const resultAlbum = (result.collectionName || "").toLowerCase().trim();
    const searchArtist = artist.toLowerCase().trim();
    const searchAlbum = album.toLowerCase().trim();

    const artistMatch = resultArtist.includes(searchArtist) || searchArtist.includes(resultArtist);
    const albumMatch = resultAlbum.includes(searchAlbum) || searchAlbum.includes(resultAlbum);

    if (artistMatch && albumMatch && result.artworkUrl100) {
      return result.artworkUrl100.replace("100x100bb", "600x600bb");
    }
  }

  if (data.results[0]?.artworkUrl100) {
    return data.results[0].artworkUrl100.replace("100x100bb", "300x300bb");
  }

  return null;
}

export function getArtworkCacheSize(): number {
  return Object.keys(artworkCache).length;
}

export async function clearArtworkCache(): Promise<void> {
  artworkCache = {};
  cacheLoaded = true;
  await saveCache();
}
