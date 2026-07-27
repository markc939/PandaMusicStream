declare module "expo-audio" {
  export interface AudioSource {
    uri: string;
  }

  export interface AudioPlayer {
    currentTime: number;
    duration: number;
    playing: boolean;
    volume: number;
    play(): void;
    pause(): void;
    remove(): void;
    seekTo(seconds: number): Promise<void>;
    setActiveForLockScreen(active: boolean, metadata?: any): void;
    replace(source: AudioSource): void;
  }

  export interface AudioPlaylist {
    currentIndex: number;
    currentTime: number;
    duration: number;
    playing: boolean;
    volume: number;
    trackCount: number;
    play(): void;
    pause(): void;
    next(): void;
    previous(): void;
    seekTo(seconds: number): Promise<void>;
    skipTo(index: number): void;
    destroy(): void;
  }

  export function createAudioPlayer(source?: AudioSource): AudioPlayer;
  export function createAudioPlaylist(options?: { sources?: AudioSource[]; loop?: string }): AudioPlaylist;
  export function useAudioPlayer(source?: AudioSource, options?: any): AudioPlayer;
  export function useAudioPlaylist(options?: any): AudioPlaylist;
  export function useAudioPlayerStatus(player: AudioPlayer): any;
  export function useAudioPlaylistStatus(playlist: AudioPlaylist): any;
  export function setAudioModeAsync(mode: any): Promise<void>;
}

declare module "expo-secure-store" {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}

declare module "expo-file-system" {
  export const documentDirectory: string;
  export const cacheDirectory: string;

  export interface FileInfo {
    exists: boolean;
    uri: string;
    size?: number;
    modificationTime?: number;
    md5?: string;
  }

  export interface InfoOptions {
    size?: boolean;
  }

  export function getInfoAsync(fileUri: string, options?: InfoOptions): Promise<FileInfo>;
  export function readAsStringAsync(fileUri: string): Promise<string>;
  export function writeAsStringAsync(fileUri: string, contents: string): Promise<void>;
  export function makeDirectoryAsync(dirUri: string, options?: { intermediates: boolean }): Promise<void>;
  export function deleteAsync(fileUri: string, options?: { idempotent: boolean }): Promise<void>;

  export interface DownloadResult {
    uri: string;
    status: number;
    headers: Record<string, string>;
    md5?: string;
  }

  export interface DownloadResumable {
    downloadAsync(): Promise<DownloadResult | null>;
    pauseAsync(): Promise<void>;
    resumeAsync(): Promise<DownloadResult | null>;
  }

  export function createDownloadResumable(
    url: string,
    fileUri: string,
    options?: any,
    callback?: any,
    resumeData?: any
  ): DownloadResumable;
}

declare module "react-native-safe-area-context" {
  export function useSafeAreaInsets(): { top: number; bottom: number; left: number; right: number };
  export function SafeAreaProvider(props: any): any;
  export function SafeAreaView(props: any): any;
}
