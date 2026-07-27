import { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Equalizer from "../src/components/Equalizer";
import { usePlayerContext } from "../src/hooks/PlayerContext";
import { useOneDrive } from "../src/hooks/useOneDrive";
import { analyzeSamples } from "../src/lib/fft";
import { EQSettings, getDefaultEQ } from "../src/services/eq";
import { getCacheSize, clearAllCache } from "../src/services/cache";
import { fetchMissingArtwork, getArtworkCacheSize, clearArtworkCache, ArtworkFetchProgress } from "../src/services/artwork";

export default function SettingsScreen() {
  const { isPlaying } = usePlayerContext();
  const { allTracks, loadArtists, getAlbumsNeedingArtwork } = useOneDrive();

  const [eqSettings, setEqSettings] = useState<EQSettings>(getDefaultEQ());
  const [magnitudes, setMagnitudes] = useState<number[]>(new Array(12).fill(0));
  const [cacheInfo, setCacheInfo] = useState({ files: 0, bytes: 0 });
  const [showCacheConfirm, setShowCacheConfirm] = useState(false);
  const [showArtworkConfirm, setShowArtworkConfirm] = useState(false);
  const [artworkProgress, setArtworkProgress] = useState<ArtworkFetchProgress | null>(null);
  const [artworkCount, setArtworkCount] = useState(0);
  const timeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    loadCacheInfo();
    setArtworkCount(getArtworkCacheSize());
  }, []);

  useEffect(() => {
    if (isPlaying) {
      simulateAudioAnalysis();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setMagnitudes(Array.from({ length: 12 }, () => 0.02 + Math.random() * 0.03));
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  function simulateAudioAnalysis() {
    timeRef.current = 0;
    const synthBands = [0.1, 0.15, 0.2, 0.35, 0.5, 0.6, 0.45, 0.3, 0.2, 0.15, 0.1, 0.08];
    function tick() {
      timeRef.current += 0.05;
      setMagnitudes(synthBands.map((base, i) =>
        Math.max(0.02, Math.min(1, base +
          Math.sin(timeRef.current * (3 + i * 1.5) + i * 0.7) * 0.25 +
          Math.cos(timeRef.current * (1.2 + i * 0.8)) * 0.15
        ))
      ));
      animFrameRef.current = requestAnimationFrame(tick);
    }
    tick();
  }

  async function loadCacheInfo() {
    const info = await getCacheSize();
    setCacheInfo(info);
  }

  const handleClearCache = useCallback(async () => {
    await clearAllCache();
    setCacheInfo({ files: 0, bytes: 0 });
    setShowCacheConfirm(false);
  }, []);

  const handleFetchArtwork = useCallback(async () => {
    const albumsNeedingArtwork = getAlbumsNeedingArtwork();
    if (albumsNeedingArtwork.length === 0) {
      setShowArtworkConfirm(false);
      return;
    }

    setArtworkProgress({ total: albumsNeedingArtwork.length, completed: 0, found: 0, current: "" });

    const found = await fetchMissingArtwork(albumsNeedingArtwork, (progress) => {
      setArtworkProgress({ ...progress });
    });

    setArtworkProgress(null);
    setArtworkCount(getArtworkCacheSize());
    setShowArtworkConfirm(false);
    loadArtists();
  }, [getAlbumsNeedingArtwork, loadArtists]);

  const handleClearArtwork = useCallback(async () => {
    await clearArtworkCache();
    setArtworkCount(0);
    loadArtists();
  }, [loadArtists]);

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const albumsNeedingArtwork = getAlbumsNeedingArtwork();

  return (
    <LinearGradient colors={["#12122a", "#0a0a14"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="px-5 pt-4 pb-3">
          <Text className="text-3xl font-bold text-[#f0f0ff] tracking-tight">Settings</Text>
        </View>

        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View className="gap-4">
            <Equalizer isPlaying={isPlaying} magnitudes={magnitudes} settings={eqSettings} onSettingsChange={setEqSettings} />

            <View className="rounded-2xl border border-[#2a2a4e]/50 bg-[#12122a] overflow-hidden">
              <View className="px-4 py-3 border-b border-[#2a2a4e]/30">
                <View className="flex-row items-center gap-3">
                  <LinearGradient colors={["rgba(245,158,11,0.2)", "rgba(233,69,96,0.2)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-9 h-9 rounded-xl items-center justify-center">
                    <Ionicons name="image" size={18} color="#f59e0b" />
                  </LinearGradient>
                  <View>
                    <Text className="text-base font-bold text-[#f0f0ff]">Album Artwork</Text>
                    <Text className="text-xs text-[#8888aa]">{artworkCount} cached · {albumsNeedingArtwork.length} missing</Text>
                  </View>
                </View>
              </View>

              {artworkProgress ? (
                <View className="px-4 py-4 items-center">
                  <ActivityIndicator size="small" color="#f59e0b" />
                  <Text className="text-sm text-[#f0f0ff] mt-3 font-semibold">Fetching artwork...</Text>
                  <View className="w-full bg-[#1a1a3e] rounded-full h-1.5 mt-3 overflow-hidden">
                    <LinearGradient colors={["#f59e0b", "#e94560"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="h-full rounded-full" style={{ width: `${(artworkProgress.completed / artworkProgress.total) * 100}%` }} />
                  </View>
                  <Text className="text-xs text-[#4a4a6a] mt-2">
                    {artworkProgress.found} found · {artworkProgress.completed} of {artworkProgress.total}
                  </Text>
                  <Text className="text-xs text-[#4a4a6a] mt-0.5" numberOfLines={1}>
                    {artworkProgress.current}
                  </Text>
                </View>
              ) : showArtworkConfirm ? (
                <View className="px-4 py-4 items-center">
                  <Text className="text-sm text-[#f0f0ff] mb-1 font-semibold">Fetch album covers from iTunes?</Text>
                  <Text className="text-xs text-[#8888aa] mb-3">{albumsNeedingArtwork.length} albums need artwork</Text>
                  <View className="flex-row gap-3">
                    <Pressable onPress={handleFetchArtwork} className="bg-[#7c3aed] px-6 py-2.5 rounded-xl">
                      <Text className="text-sm font-bold text-white">Fetch Now</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowArtworkConfirm(false)} className="bg-[#1a1a3e] px-6 py-2.5 rounded-xl border border-[#2a2a4e]">
                      <Text className="text-sm font-bold text-[#8888aa]">Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="px-4 py-3 gap-2.5">
                  <Pressable onPress={() => setShowArtworkConfirm(true)} className="flex-row items-center justify-between active:opacity-70">
                    <Text className="text-sm text-[#8888aa]">
                      {albumsNeedingArtwork.length > 0
                        ? `${albumsNeedingArtwork.length} albums missing covers`
                        : "All albums have artwork"}
                    </Text>
                    <LinearGradient colors={["rgba(245,158,11,0.2)", "rgba(233,69,96,0.2)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="px-3 py-1.5 rounded-xl">
                      <Text className="text-xs font-bold text-[#f59e0b]">Fetch Missing</Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable onPress={handleClearArtwork} className="flex-row items-center justify-between active:opacity-70">
                    <Text className="text-sm text-[#8888aa]">Clear cached artwork</Text>
                    <Text className="text-xs font-bold text-[#e94560]">Clear All</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View className="rounded-2xl border border-[#2a2a4e]/50 bg-[#12122a] overflow-hidden">
              <View className="px-4 py-3 border-b border-[#2a2a4e]/30">
                <View className="flex-row items-center gap-3">
                  <LinearGradient colors={["rgba(6,182,212,0.2)", "rgba(124,58,237,0.2)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-9 h-9 rounded-xl items-center justify-center">
                    <Ionicons name="cloud-download" size={18} color="#06b6d4" />
                  </LinearGradient>
                  <View>
                    <Text className="text-base font-bold text-[#f0f0ff]">Offline Cache</Text>
                    <Text className="text-xs text-[#8888aa]">{cacheInfo.files} files · {formatBytes(cacheInfo.bytes)}</Text>
                  </View>
                </View>
              </View>
              {showCacheConfirm ? (
                <View className="px-4 py-4 items-center">
                  <Text className="text-sm text-[#f0f0ff] mb-3">Clear all downloaded tracks?</Text>
                  <View className="flex-row gap-3">
                    <Pressable onPress={handleClearCache} className="bg-[#e94560] px-6 py-2.5 rounded-xl">
                      <Text className="text-sm font-bold text-white">Clear</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowCacheConfirm(false)} className="bg-[#1a1a3e] px-6 py-2.5 rounded-xl border border-[#2a2a4e]">
                      <Text className="text-sm font-bold text-[#8888aa]">Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable onPress={() => setShowCacheConfirm(true)} className="px-4 py-3 flex-row items-center justify-between active:opacity-70">
                  <Text className="text-sm text-[#8888aa]">Used for offline playback</Text>
                  <LinearGradient colors={["rgba(233,69,96,0.2)", "rgba(233,69,96,0.1)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="px-3 py-1.5 rounded-xl">
                    <Text className="text-xs font-bold text-[#e94560]">Clear All</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>

            <View className="rounded-2xl border border-[#2a2a4e]/50 bg-[#12122a] overflow-hidden">
              <View className="px-4 py-3 border-b border-[#2a2a4e]/30">
                <View className="flex-row items-center gap-3">
                  <LinearGradient colors={["rgba(233,69,96,0.2)", "rgba(245,158,11,0.2)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-9 h-9 rounded-xl items-center justify-center">
                    <Ionicons name="information-circle" size={18} color="#e94560" />
                  </LinearGradient>
                  <View>
                    <Text className="text-base font-bold text-[#f0f0ff]">About</Text>
                    <Text className="text-xs text-[#8888aa]">Panda Music Streamer</Text>
                  </View>
                </View>
              </View>
              <View className="px-4 py-3 gap-3">
                <View className="flex-row justify-between"><Text className="text-sm text-[#8888aa]">Version</Text><Text className="text-sm font-semibold text-[#f0f0ff]">1.0.0</Text></View>
                <View className="flex-row justify-between"><Text className="text-sm text-[#8888aa]">Framework</Text><Text className="text-sm font-semibold text-[#f0f0ff]">Expo SDK 57</Text></View>
                <View className="flex-row justify-between"><Text className="text-sm text-[#8888aa]">Audio Engine</Text><Text className="text-sm font-semibold text-[#f0f0ff]">expo-audio</Text></View>
                <View className="flex-row justify-between"><Text className="text-sm text-[#8888aa]">Storage</Text><Text className="text-sm font-semibold text-[#f0f0ff]">OneDrive</Text></View>
                <View className="flex-row justify-between"><Text className="text-sm text-[#8888aa]">Artwork Source</Text><Text className="text-sm font-semibold text-[#f0f0ff]">iTunes API</Text></View>
              </View>
            </View>

            <View className="h-20" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
