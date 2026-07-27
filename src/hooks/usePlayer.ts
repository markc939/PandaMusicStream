import { useState, useEffect, useCallback, useRef } from "react";
import { Track, RepeatMode } from "../types";
import {
  initAudio,
  playTrack,
  playTracks,
  pause,
  resume,
  playPause as audioPlayPause,
  skipNext,
  skipPrevious,
  seekTo,
  setVolume,
  getCurrentTime,
  getDuration,
  cleanup,
  setCallbacks,
} from "../services/audio";
import { getCachedPath, initCache } from "../services/cache";

function shuffleArray(arr: Track[]): Track[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function usePlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffled, setIsShuffled] = useState(false);
  const [volume, setVolumeLevel] = useState(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalQueueRef = useRef<Track[]>([]);

  useEffect(() => {
    initAudio();
    initCache();
    setCallbacks({
      onTrackChange: (track, index) => {
        setCurrentTrack(track);
        setQueueIndex(index);
      },
      onPlayStateChange: (playing) => {
        setIsPlaying(playing);
        if (playing) {
          startProgressInterval();
        } else {
          stopProgressInterval();
        }
      },
      onTimeUpdate: (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      onQueueEnd: () => {
        handleQueueEnd();
      },
      onTrackEnd: () => {
        handleTrackEnd();
      },
    });
    return () => {
      cleanup();
      stopProgressInterval();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startProgressInterval();
    } else {
      stopProgressInterval();
    }
    return () => stopProgressInterval();
  }, [isPlaying]);

  function startProgressInterval() {
    stopProgressInterval();
    intervalRef.current = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setDuration(getDuration());
    }, 250);
  }

  function stopProgressInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const handleQueueEnd = useCallback(() => {
    if (repeatMode === "all") {
      setQueueIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === "one" && currentTrack) {
      const cachedPath = (currentTrack as any)._cachedPath;
      const trackWithCache = cachedPath
        ? { ...currentTrack, downloadUrl: cachedPath }
        : currentTrack;
      playTrack(trackWithCache);
      setCurrentTime(0);
      setDuration(0);
    } else if (queueIndex < queue.length - 1) {
      setQueueIndex((prev) => prev + 1);
    } else if (repeatMode === "all") {
      setQueueIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, currentTrack, queueIndex, queue.length]);

  const resolveTrackSource = useCallback(async (track: Track): Promise<Track> => {
    try {
      const cachedPath = await getCachedPath(track);
      if (cachedPath) {
        return { ...track, downloadUrl: cachedPath, _cachedPath: cachedPath } as Track & { _cachedPath: string };
      }
    } catch {}
    return track;
  }, []);

  const play = useCallback(
    async (track: Track, trackQueue?: Track[], index?: number) => {
      if (trackQueue && index !== undefined) {
        const resolved = await resolveTrackSource(track);
        if (isShuffled) {
          const withoutCurrent = trackQueue.filter((_, i) => i !== index);
          const shuffled = shuffleArray(withoutCurrent);
          const newQueue = [resolved, ...shuffled];
          originalQueueRef.current = trackQueue;
          setQueue(newQueue);
          setQueueIndex(0);
          await playTracks(newQueue, 0);
        } else {
          originalQueueRef.current = trackQueue;
          setQueue(trackQueue);
          setQueueIndex(index);
          await playTracks(trackQueue, index);
        }
      } else {
        const resolved = await resolveTrackSource(track);
        await playTrack(resolved);
      }
    },
    [isShuffled, resolveTrackSource]
  );

  const playAll = useCallback(
    async (tracks: Track[], startIndex: number = 0) => {
      originalQueueRef.current = tracks;
      if (isShuffled) {
        const current = tracks[startIndex];
        const withoutCurrent = tracks.filter((_, i) => i !== startIndex);
        const shuffled = shuffleArray(withoutCurrent);
        const newQueue = [current, ...shuffled];
        setQueue(newQueue);
        setQueueIndex(0);
        await playTracks(newQueue, 0);
      } else {
        setQueue(tracks);
        setQueueIndex(startIndex);
        await playTracks(tracks, startIndex);
      }
    },
    [isShuffled]
  );

  const togglePlayPause = useCallback(() => {
    audioPlayPause();
  }, []);

  const next = useCallback(() => {
    if (queueIndex < queue.length - 1) {
      setQueueIndex(queueIndex + 1);
      skipNext();
    } else if (repeatMode === "all") {
      setQueueIndex(0);
    }
  }, [queueIndex, queue.length, repeatMode]);

  const previous = useCallback(() => {
    if (currentTime > 3) {
      seekTo(0);
      setCurrentTime(0);
    } else if (queueIndex > 0) {
      setQueueIndex(queueIndex - 1);
      skipPrevious();
    } else if (repeatMode === "all" && queue.length > 0) {
      const lastIndex = queue.length - 1;
      setQueueIndex(lastIndex);
      skipNext();
    }
  }, [currentTime, queueIndex, repeatMode, queue.length]);

  const seek = useCallback(async (seconds: number) => {
    await seekTo(seconds);
    setCurrentTime(seconds);
  }, []);

  const changeVolume = useCallback((v: number) => {
    setVolumeLevel(v);
    setVolume(v);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
    originalQueueRef.current = [...originalQueueRef.current, track];
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  }, [queueIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
    originalQueueRef.current = [];
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const newShuffled = !prev;
      if (newShuffled && queue.length > 0 && queueIndex >= 0) {
        const currentTrack = queue[queueIndex];
        const remaining = queue.filter((_, i) => i !== queueIndex);
        const shuffled = shuffleArray(remaining);
        const newQueue = [currentTrack, ...shuffled];
        setQueue(newQueue);
        setQueueIndex(0);
      } else if (!newShuffled && originalQueueRef.current.length > 0) {
        const currentTrack = queue[queueIndex];
        const restored = originalQueueRef.current;
        const newIndex = restored.findIndex((t) => t.id === currentTrack?.id);
        setQueue(restored);
        setQueueIndex(newIndex >= 0 ? newIndex : 0);
      }
      return newShuffled;
    });
  }, [queue, queueIndex]);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    queue,
    queueIndex,
    repeatMode,
    isShuffled,
    volume,
    play,
    playAll,
    pause: () => { pause(); setIsPlaying(false); },
    resume: () => { resume(); setIsPlaying(true); },
    togglePlayPause,
    next,
    previous,
    seek,
    changeVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleRepeat,
    toggleShuffle,
  };
}
