import { useState, useCallback } from "react";
import { Track, Album, Artist } from "../types";
import {
  scanAllMusic,
  buildLibrary,
  searchItems,
  convertOneDriveItemToTrack,
  getItemWithUrl,
} from "../services/onedrive";
import { isAudioFile } from "../lib/format";

const DEFAULT_MUSIC_FOLDER = "Music";

export interface ScanProgress {
  foldersScanned: number;
  filesFound: number;
  foldersQueued: number;
}

export function useOneDrive() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [allTracks, setAllTracks] = useState<Track[]>([]);

  const loadArtists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setScanProgress(null);
    try {
      const foundTracks = await scanAllMusic(DEFAULT_MUSIC_FOLDER, (progress) => {
        setScanProgress({ ...progress });
      });
      setAllTracks(foundTracks);

      const result = buildLibrary(foundTracks);
      setArtists(result);
      setAlbums([]);
      setTracks([]);
    } catch (e: any) {
      setError(e.message || "Failed to scan library");
    } finally {
      setIsLoading(false);
      setScanProgress(null);
    }
  }, []);

  const loadAlbumTracks = useCallback(
    async (artistName: string, albumName: string) => {
      const albumTracks = allTracks.filter(
        (t) =>
          t.artist.toLowerCase() === artistName.toLowerCase() &&
          t.album.toLowerCase() === albumName.toLowerCase()
      );
      setTracks(albumTracks);
    },
    [allTracks]
  );

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setTracks([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const lower = query.toLowerCase();
      const localResults = allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.artist.toLowerCase().includes(lower) ||
          t.album.toLowerCase().includes(lower)
      );

      if (localResults.length > 0) {
        setTracks(localResults);
        setIsLoading(false);
        return;
      }

      const results = await searchItems(query);
      const audioItems = results.filter((i) => i.file && isAudioFile(i.name));
      const trackPromises = audioItems.map(async (item) => {
        if (!item["@microsoft.graph.downloadUrl"]) {
          try {
            const itemWithUrl = await getItemWithUrl(item.id);
            return convertOneDriveItemToTrack(itemWithUrl);
          } catch {
            return null;
          }
        }
        return convertOneDriveItemToTrack(item);
      });
      const resolvedTracks = (await Promise.all(trackPromises)).filter(Boolean) as Track[];
      setTracks(resolvedTracks);
    } catch (e: any) {
      setError(e.message || "Search failed");
    } finally {
      setIsLoading(false);
    }
  }, [allTracks]);

  const getAlbumsNeedingArtwork = useCallback((): { artist: string; album: string }[] => {
    const needed: { artist: string; album: string }[] = [];
    const seen = new Set<string>();
    for (const track of allTracks) {
      if (track.coverUrl) continue;
      const key = `${track.artist}|${track.album}`;
      if (!seen.has(key)) {
        seen.add(key);
        needed.push({ artist: track.artist, album: track.album });
      }
    }
    return needed;
  }, [allTracks]);

  return {
    artists,
    albums,
    tracks,
    allTracks,
    isLoading,
    error,
    scanProgress,
    loadArtists,
    loadAlbumTracks,
    search,
    getAlbumsNeedingArtwork,
  };
}
