export interface OneDriveItem {
  id: string;
  name: string;
  size: number;
  lastModifiedDateTime: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
  audio?: {
    album?: string;
    albumArtist?: string;
    artist?: string;
    title?: string;
    duration?: number;
    genre?: string;
  };
  image?: any;
  video?: any;
  thumbnails?: { 0?: { large?: { url: string }; medium?: { url: string } } };
  "@microsoft.graph.downloadUrl"?: string;
  parentReference?: { path: string; driveId: string };
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  duration: number;
  size: number;
  format: string;
  downloadUrl: string;
  coverUrl?: string;
  oneDrivePath: string;
  driveId: string;
  parentId: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year?: number;
  coverUrl?: string;
  trackCount: number;
  tracks: Track[];
  oneDrivePath: string;
}

export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  albums: Album[];
  oneDrivePath: string;
}

export interface QueueItem {
  track: Track;
  album?: Album;
}

export type RepeatMode = "off" | "all" | "one";

export interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Track[];
  queueIndex: number;
}

export interface CacheInfo {
  trackId: string;
  localPath: string;
  size: number;
  cachedAt: string;
}

export type BrowseLevel = "root" | "artists" | "albums" | "tracks";

export interface BrowseState {
  level: BrowseLevel;
  currentPath: string;
  currentArtist?: string;
  currentAlbum?: string;
  items: OneDriveItem[];
  breadcrumbs: { label: string; path: string }[];
  isLoading: boolean;
  error: string | null;
}
