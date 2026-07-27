const PLACEHOLDER_VALUES = [
  "artist", "album", "track", "title", "file",
  "unknown artist", "unknown album", "unknown",
  "new recording", "new track", "untitled",
  "", " ", "-",
];

export function isPlaceholder(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed.length <= 1) return true;
  return PLACEHOLDER_VALUES.includes(trimmed);
}

export function inferFromPath(relativePath: string): {
  title: string;
  artist: string;
  album: string;
} {
  const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean);
  const filename = parts.pop() || "";
  const title = filename.replace(/\.[^.]+$/, "").trim();

  const dashMatch = title.match(/^(\d+)\s*[-–—.]\s*(.+)$/);
  const cleanTitle = dashMatch ? dashMatch[2].trim() : title;

  const trackNumMatch = title.match(/^(\d+)/);
  const trackNumberTitle = trackNumMatch ? title.replace(/^\d+\s*[-–—.]?\s*/, "").trim() : title;

  let artist = "Unknown Artist";
  let album = "Unknown Album";

  if (parts.length >= 2) {
    artist = parts[parts.length - 2].trim();
    album = parts[parts.length - 1].trim();
  } else if (parts.length === 1) {
    album = parts[0].trim();
  }

  const fixedTitle = trackNumberTitle || cleanTitle || filename;

  return { title: fixedTitle, artist, album };
}

export function inferTrackMetadata(name: string): { title: string; artist?: string } {
  let title = name.replace(/\.[^.]+$/, "").trim();
  const dashMatch = title.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (dashMatch) {
    return { artist: dashMatch[1].trim(), title: dashMatch[2].trim() };
  }
  return { title };
}

export function parseGraphAudioItem(item: any): {
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  duration: number;
  coverUrl?: string;
} {
  const name = item.name || "";
  const graphAudio = item.audio || {};

  let title = graphAudio.title || "";
  let artist = graphAudio.artist || "";
  let album = graphAudio.album || "";
  let albumArtist = graphAudio.albumArtist || "";
  let duration = graphAudio.duration || 0;

  if (!title || !artist) {
    const inferred = inferTrackMetadata(name);
    if (!title) title = inferred.title;
    if (!artist) artist = inferred.artist || "Unknown Artist";
  }
  if (!album) album = "Unknown Album";
  if (!albumArtist) albumArtist = artist;

  const thumbnails = item.thumbnails;
  const coverUrl = thumbnails?.[0]?.large?.url || thumbnails?.[0]?.medium?.url || undefined;

  return { title, artist, album, albumArtist, duration: duration || 0, coverUrl };
}
