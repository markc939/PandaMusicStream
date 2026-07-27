import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useOneDrive } from "../../src/hooks/useOneDrive";
import { usePlayerContext } from "../../src/hooks/PlayerContext";
import TrackItem from "../../src/components/TrackItem";
import { Artist, Album, Track } from "../../src/types";

export default function LibraryScreen() {
  const { artists, tracks, isLoading, error, scanProgress, loadArtists, loadAlbumTracks } = useOneDrive();
  const { playAll, currentTrack } = usePlayerContext();

  useEffect(() => {
    loadArtists();
  }, []);

  const handleTrackPress = useCallback(
    async (track: Track) => {
      await playAll([track]);
    },
    [playAll]
  );

  if (scanProgress) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a14] items-center justify-center px-8">
        <LinearGradient
          colors={["#7c3aed", "#e94560"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-20 h-20 rounded-3xl items-center justify-center mb-6"
        >
          <Ionicons name="disc" size={40} color="#fff" />
        </LinearGradient>
        <Text className="text-2xl font-bold text-[#f0f0ff] mb-2">Scanning Library</Text>
        <Text className="text-base text-[#8888aa] mb-6 text-center">
          Looking through your OneDrive for music files...
        </Text>
        <View className="w-48 h-1.5 bg-[#1a1a3e] rounded-full overflow-hidden mb-4">
          <LinearGradient
            colors={["#7c3aed", "#e94560"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-full rounded-full"
            style={{ width: `${Math.min(95, (scanProgress.foldersScanned / Math.max(1, scanProgress.foldersQueued)) * 100)}%` }}
          />
        </View>
        <Text className="text-sm text-[#4a4a6a]">
          {scanProgress.filesFound} files found · {scanProgress.foldersScanned} folders scanned
        </Text>
        <ActivityIndicator size="small" color="#7c3aed" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  if (isLoading && artists.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a14] items-center justify-center">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="text-[#8888aa] mt-4 text-base">Loading your library...</Text>
      </SafeAreaView>
    );
  }

  if (error && artists.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a14] items-center justify-center px-8">
        <LinearGradient
          colors={["#7c3aed", "#e94560"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-20 h-20 rounded-2xl items-center justify-center mb-6"
        >
          <Ionicons name="cloud-offline-outline" size={40} color="#fff" />
        </LinearGradient>
        <Text className="text-[#f0f0ff] text-xl font-bold text-center">Connection Issue</Text>
        <Text className="text-[#8888aa] text-sm mt-2 text-center mb-6">{error}</Text>
        <Pressable onPress={loadArtists}>
          <LinearGradient
            colors={["#7c3aed", "#e94560"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-8 py-3.5 rounded-2xl"
          >
            <Text className="text-white font-bold text-base">Retry</Text>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a14]">
      <LinearGradient colors={["#12122a", "#0a0a14"]} className="px-5 pt-4 pb-3">
        <Text className="text-3xl font-bold text-[#f0f0ff] tracking-tight">Library</Text>
        <Text className="text-sm text-[#8888aa] mt-1">
          {artists.length} artist{artists.length !== 1 ? "s" : ""}
        </Text>
      </LinearGradient>

      <FlatList
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable className="flex-row items-center px-5 py-4 active:opacity-70">
            <LinearGradient
              colors={["#7c3aed", "#e94560"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              style={{
                shadowColor: "#7c3aed",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="person" size={28} color="#fff" />
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-base font-bold text-[#f0f0ff]">{item.name}</Text>
              <Text className="text-sm text-[#8888aa] mt-0.5">
                {item.albumCount} album{item.albumCount !== 1 ? "s" : ""}
              </Text>
            </View>
            <LinearGradient
              colors={["rgba(124,58,237,0.2)", "rgba(233,69,96,0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-8 h-8 rounded-xl items-center justify-center"
            >
              <Ionicons name="chevron-forward" size={18} color="#8888aa" />
            </LinearGradient>
          </Pressable>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadArtists}
            tintColor="#7c3aed"
            colors={["#7c3aed", "#e94560"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </SafeAreaView>
  );
}
