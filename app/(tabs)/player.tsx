import { View, Text, Image, SafeAreaView, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState, useEffect } from "react";
import { usePlayerContext } from "../../src/hooks/PlayerContext";
import PlayerControls from "../../src/components/PlayerControls";
import ProgressBar from "../../src/components/ProgressBar";
import OfflineIndicator from "../../src/components/OfflineIndicator";
import { isTrackCached, downloadTrack } from "../../src/services/cache";

const { width } = Dimensions.get("window");
const ART_SIZE = width - 64;

export default function PlayerScreen() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    togglePlayPause,
    next,
    previous,
    seek,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerContext();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      isTrackCached(currentTrack.id).then(setIsCached);
    }
  }, [currentTrack]);

  const handleToggleOffline = async () => {
    if (isDownloading || !currentTrack) return;
    if (isCached) return;
    setIsDownloading(true);
    try {
      const result = await downloadTrack(currentTrack);
      if (result) setIsCached(true);
    } catch {}
    setIsDownloading(false);
  };

  if (!currentTrack) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a14] items-center justify-center px-8">
        <LinearGradient
          colors={["rgba(124,58,237,0.2)", "rgba(233,69,96,0.2)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-32 h-32 rounded-3xl items-center justify-center mb-6"
        >
          <Ionicons name="play-circle-outline" size={64} color="#4a4a6a" />
        </LinearGradient>
        <Text className="text-[#f0f0ff] text-2xl font-bold">No Track Playing</Text>
        <Text className="text-[#8888aa] text-base mt-2 text-center">
          Browse your library and tap a song
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={["#1a1a3e", "#12122a", "#0a0a14"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 justify-center">
          <View
            className="self-center mb-8"
            style={{
              width: ART_SIZE,
              height: ART_SIZE,
              shadowColor: "#7c3aed",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 32,
              elevation: 20,
            }}
          >
            <LinearGradient
              colors={currentTrack.coverUrl
                ? ["rgba(124,58,237,0.3)", "rgba(233,69,96,0.3)"]
                : ["#7c3aed", "#e94560"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full h-full rounded-3xl items-center justify-center overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              {currentTrack.coverUrl ? (
                <Image
                  source={{ uri: currentTrack.coverUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <>
                  <View className="absolute inset-0 opacity-30">
                    <LinearGradient
                      colors={["#7c3aed", "#e94560", "#06b6d4"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-full h-full"
                    />
                  </View>
                  <Ionicons name="disc" size={80} color="rgba(255,255,255,0.4)" />
                </>
              )}
            </LinearGradient>
          </View>

          <View className="mb-2">
            <Text
              className="text-2xl font-bold text-[#f0f0ff] text-center tracking-tight"
              numberOfLines={1}
            >
              {currentTrack.title}
            </Text>
            <Text
              className="text-base text-[#8888aa] text-center mt-1.5"
              numberOfLines={1}
            >
              {currentTrack.artist}
            </Text>
            <Text
              className="text-sm text-[#4a4a6a] text-center mt-0.5"
              numberOfLines={1}
            >
              {currentTrack.album}
            </Text>
            <View className="items-center mt-3">
              <OfflineIndicator
                isCached={isCached}
                onToggle={handleToggleOffline}
                isDownloading={isDownloading}
              />
            </View>
          </View>

          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
          />

          <PlayerControls
            isPlaying={isPlaying}
            repeatMode={repeatMode}
            isShuffled={isShuffled}
            onPlayPause={togglePlayPause}
            onNext={next}
            onPrevious={previous}
            onRepeat={toggleRepeat}
            onShuffle={toggleShuffle}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
