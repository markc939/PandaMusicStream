import { getValidToken } from "./auth";
import { OneDriveItem, Track, Album, Artist } from "../types";
import { isAudioFile, getFileExtension } from "../lib/format";
import { parseGraphAudioItem, isPlaceholder, inferFromPath } from "../lib/metadata";
import { getCachedArtwork, setCachedArtwork } from "./artwork";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const CONCURRENCY = 5;

async function apiFetch(endpoint: string, params?: Record<string, string>): Promise<any> {
  const token = await getValidToken();
  if (!token) throw new Error("Not authenticated");

  let url = `${GRAPH_BASE}${endpoint}`;
  if (params) {
    const search = new URLSearchParams(params);
    url += `?${search.toString()}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Token expired");
    const text = await res.text();
    throw new Error(`Graph API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function listChildren(
  path: string,
  nextLink?: string
): Promise<{ items: OneDriveItem[]; nextLink?: string }> {
  const select = "id,name,size,folder,file,audio,image,video,lastModifiedDateTime,thumbnails,@microsoft.graph.downloadUrl";
  const expand = "thumbnails";

  let endpoint: string;
  if (nextLink) {
    endpoint = nextLink.replace(GRAPH_BASE, "");
  } else if (path) {
    endpoint = `/me/drive/root:/${path}:/children`;
  } else {
    endpoint = "/me/drive/root/children";
  }

  const data = await apiFetch(endpoint, {
    select,
    expand,
    top: "200",
  });

  return {
    items: (data.value || []).map((item: any) => ({
      ...item,
      thumbnails: item.thumbnails,
    })),
    nextLink: data["@odata.nextLink"],
  };
}

async function listAllChildren(path: string): Promise<OneDriveItem[]> {
  const all: OneDriveItem[] = [];
  let nextLink: string | undefined;
  do {
    const result = await listChildren(path, nextLink);
    all.push(...result.items);
    nextLink = result.nextLink;
  } while (nextLink);
  return all;
}

interface ScanProgress {
  foldersScanned: number;
  filesFound: number;
  foldersQueued: number;
}

type ProgressCallback = (progress: ScanProgress) => void;

interface AudioFileInfo {
  item: OneDriveItem;
  relativePath: string;
}

export async function scanAllMusic(
  musicFolder: string = "Music",
  onProgress?: ProgressCallback
): Promise<Track[]> {
  const progress: ScanProgress = { foldersScanned: 0, filesFound: 0, foldersQueued: 0 };
  const audioFiles: AudioFileInfo[] = [];
  const folderQueue: string[] = [musicFolder];
  progress.foldersQueued = 1;

  while (folderQueue.length > 0) {
    const batch = folderQueue.splice(0, CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (folderPath) => {
        try {
          const items = await listAllChildren(folderPath);
          progress.foldersScanned++;
          const subfolders: string[] = [];
          const audioItems: AudioFileInfo[] = [];

          for (const item of items) {
            if (item.folder) {
              subfolders.push(`${folderPath}/${item.name}`);
            } else if (item.file && isAudioFile(item.name)) {
              audioItems.push({
                item,
                relativePath: `${folderPath}/${item.name}`.replace(`${musicFolder}/`, ""),
              });
            }
          }

          return { subfolders, audioItems };
        } catch (err) {
          console.warn(`Failed to scan ${folderPath}:`, err);
          return { subfolders: [], audioItems: [] };
        }
      })
    );

    for (const result of results) {
      folderQueue.push(...result.subfolders);
      progress.foldersQueued += result.subfolders.length;
      audioFiles.push(...result.audioItems);
      progress.filesFound = audioFiles.length;
      onProgress?.({ ...progress });
    }
  }

  const tracks: Track[] = [];
  for (const { item, relativePath } of audioFiles) {
    const meta = parseGraphAudioItem(item);
    const pathFallback = inferFromPath(relativePath);

    const title = (meta.title && !isPlaceholder(meta.title)) ? meta.title : pathFallback.title;
    const artist = (meta.artist && !isPlaceholder(meta.artist)) ? meta.artist : pathFallback.artist;
    const album = (meta.album && !isPlaceholder(meta.album)) ? meta.album : pathFallback.album;
    const albumArtist = (meta.albumArtist && !isPlaceholder(meta.albumArtist)) ? meta.albumArtist : artist;

    const cachedArtwork = await getCachedArtwork(artist, album);

    tracks.push({
      id: item.id,
      title,
      artist,
      album,
      albumArtist,
      duration: meta.duration || 0,
      size: item.size || 0,
      format: getFileExtension(item.name),
      downloadUrl: item["@microsoft.graph.downloadUrl"] || "",
      coverUrl: meta.coverUrl || cachedArtwork || undefined,
      oneDrivePath: relativePath,
      driveId: item.parentReference?.driveId || "",
      parentId: item.id,
    });
  }

  return tracks;
}

export function buildLibrary(tracks: Track[]): Artist[] {
  const artistMap = new Map<string, Artist>();

  for (const track of tracks) {
    const artistKey = track.artist.toLowerCase();
    const albumKey = `${artistKey}|${track.album.toLowerCase()}`;

    let artist = artistMap.get(artistKey);
    if (!artist) {
      artist = {
        id: `artist_${artistKey}`,
        name: track.artist,
        albumCount: 0,
        albums: [],
        oneDrivePath: "",
      };
      artistMap.set(artistKey, artist);
    }

    let album = artist.albums.find(
      (a) => a.title.toLowerCase() === track.album.toLowerCase()
    );
    if (!album) {
      album = {
        id: `album_${albumKey}`,
        title: track.album,
        artist: track.artist,
        coverUrl: track.coverUrl,
        trackCount: 0,
        tracks: [],
        oneDrivePath: "",
      };
      artist.albums.push(album);
      artist.albumCount++;
    }

    album.tracks.push(track);
    album.trackCount = album.tracks.length;
    if (track.coverUrl && !album.coverUrl) {
      album.coverUrl = track.coverUrl;
    }
  }

  for (const artist of artistMap.values()) {
    for (const album of artist.albums) {
      album.tracks.sort((a, b) => a.title.localeCompare(b.title));
    }
    artist.albums.sort((a, b) => a.title.localeCompare(b.title));
  }

  return Array.from(artistMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function getItemWithUrl(itemId: string): Promise<OneDriveItem> {
  const data = await apiFetch(`/me/drive/items/${itemId}`, {
    select: "id,name,size,folder,file,audio,image,video,lastModifiedDateTime,thumbnails,@microsoft.graph.downloadUrl",
  });
  return data;
}

export async function searchItems(query: string): Promise<OneDriveItem[]> {
  const data = await apiFetch("/me/drive/root/search(q='" + encodeURIComponent(query) + "')", {
    select: "id,name,size,folder,file,audio,lastModifiedDateTime,thumbnails,@microsoft.graph.downloadUrl",
  });
  return data.value || [];
}

export function convertOneDriveItemToTrack(item: OneDriveItem): Track {
  const meta = parseGraphAudioItem(item);
  return {
    id: item.id,
    title: meta.title,
    artist: meta.artist,
    album: meta.album,
    albumArtist: meta.albumArtist,
    duration: meta.duration,
    size: item.size || 0,
    format: getFileExtension(item.name),
    downloadUrl: item["@microsoft.graph.downloadUrl"] || "",
    coverUrl: meta.coverUrl,
    oneDrivePath: (item.parentReference?.path || "") + "/" + item.name,
    driveId: item.parentReference?.driveId || "",
    parentId: item.parentReference?.path || "",
  };
}
