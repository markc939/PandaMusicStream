import {
  AudioPlayer,
  AudioPlaylist,
  AudioSource,
  AudioStatus,
  setAudioModeAsync,
  createAudioPlayer as expoCreateAudioPlayer,
  createAudioPlaylist as expoCreateAudioPlaylist,
} from "expo-audio";
import { Track } from "../types";

let currentPlayer: AudioPlayer | null = null;
let currentPlaylist: AudioPlaylist | null = null;
let statusSubscription: { remove: () => void } | null = null;

export interface AudioServiceCallbacks {
  onTrackChange?: (track: Track, index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onQueueEnd?: () => void;
  onTrackEnd?: () => void;
}

let callbacks: AudioServiceCallbacks = {};
let playlistTracks: Track[] = [];

export function setCallbacks(cbs: AudioServiceCallbacks) {
  callbacks = cbs;
}

export async function initAudio(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: "doNotMix",
  });
}

function removeStatusListener() {
  if (statusSubscription) {
    statusSubscription.remove();
    statusSubscription = null;
  }
}

function setupStatusListener() {
  removeStatusListener();
  const player = currentPlaylist || currentPlayer;
  if (!player) return;

  statusSubscription = player.addListener("statusChange", (status: AudioStatus) => {
    if (status.status === "idle" && !status.isLoaded) {
      callbacks.onTrackEnd?.();
    }
  });
}

export function trackToAudioSource(track: Track): AudioSource {
  return { uri: track.downloadUrl };
}

export async function playTrack(track: Track): Promise<void> {
  try {
    removeStatusListener();
    if (currentPlaylist) {
      currentPlaylist.destroy();
      currentPlaylist = null;
    }
    if (currentPlayer) {
      currentPlayer.remove();
      currentPlayer = null;
    }

    const source = trackToAudioSource(track);
    currentPlayer = expoCreateAudioPlayer(source);

    currentPlayer.setActiveForLockScreen(true, {
      title: track.title,
      artist: track.artist,
      albumTitle: track.album,
    });

    currentPlayer.play();
    playlistTracks = [track];
    callbacks.onTrackChange?.(track, 0);
    callbacks.onPlayStateChange?.(true);
    setupStatusListener();
  } catch (e) {
    console.error("Failed to play track:", e);
  }
}

export async function playTracks(tracks: Track[], startIndex: number = 0): Promise<void> {
  try {
    removeStatusListener();
    if (currentPlaylist) {
      currentPlaylist.destroy();
      currentPlaylist = null;
    }
    if (currentPlayer) {
      currentPlayer.remove();
      currentPlayer = null;
    }

    const sources = tracks.map(trackToAudioSource);
    playlistTracks = tracks;

    currentPlaylist = expoCreateAudioPlaylist({
      sources,
      loop: "off",
    });

    if (startIndex > 0) {
      currentPlaylist.skipTo(startIndex);
    }

    currentPlaylist.play();
    callbacks.onTrackChange?.(tracks[startIndex], startIndex);
    callbacks.onPlayStateChange?.(true);
    setupStatusListener();
  } catch (e) {
    console.error("Failed to play tracks:", e);
  }
}

export function pause(): void {
  if (currentPlaylist && currentPlaylist.playing) {
    currentPlaylist.pause();
  } else if (currentPlayer && currentPlayer.playing) {
    currentPlayer.pause();
  }
  callbacks.onPlayStateChange?.(false);
}

export function resume(): void {
  if (currentPlaylist && !currentPlaylist.playing) {
    currentPlaylist.play();
  } else if (currentPlayer && !currentPlayer.playing) {
    currentPlayer.play();
  }
  callbacks.onPlayStateChange?.(true);
}

export function playPause(): void {
  const playing = currentPlaylist
    ? currentPlaylist.playing
    : currentPlayer
    ? currentPlayer.playing
    : false;

  if (playing) {
    pause();
  } else {
    resume();
  }
}

export function skipNext(): void {
  if (currentPlaylist) {
    currentPlaylist.next();
  }
}

export function skipPrevious(): void {
  if (currentPlaylist) {
    currentPlaylist.previous();
  }
}

export async function seekTo(seconds: number): Promise<void> {
  if (currentPlaylist) {
    await currentPlaylist.seekTo(seconds);
  } else if (currentPlayer) {
    await currentPlayer.seekTo(seconds);
  }
}

export function setVolume(volume: number): void {
  const v = Math.max(0, Math.min(1, volume));
  if (currentPlaylist) currentPlaylist.volume = v;
  if (currentPlayer) currentPlayer.volume = v;
}

export function getCurrentTime(): number {
  return currentPlaylist
    ? currentPlaylist.currentTime || currentPlayer?.currentTime || 0
    : currentPlayer?.currentTime || 0;
}

export function getDuration(): number {
  return currentPlaylist
    ? currentPlaylist.duration || currentPlayer?.duration || 0
    : currentPlayer?.duration || 0;
}

export function isPlaying(): boolean {
  return currentPlaylist
    ? currentPlaylist.playing
    : currentPlayer
    ? currentPlayer.playing
    : false;
}

export function cleanup(): void {
  removeStatusListener();
  if (currentPlaylist) {
    currentPlaylist.destroy();
    currentPlaylist = null;
  }
  if (currentPlayer) {
    currentPlayer.remove();
    currentPlayer = null;
  }
}
