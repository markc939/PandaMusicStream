import { View, Text, FlatList, SafeAreaView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { usePlayerContext } from "../../src/hooks/PlayerContext";
import TrackItem from "../../src/components/TrackItem";

export default function QueueScreen() {
  const {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    isShuffled,
    repeatMode,
    play,
    togglePlayPause,
    clearQueue,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerContext();

  const upcomingTracks = queue.slice(queueIndex + 1);
  const previousTracks = queue.slice(0, queueIndex);

  if (queue.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a14] items-center justify-center px-8">
        <LinearGradient
          colors={["rgba(124,58,237,0.15)", "rgba(233,69,96,0.15)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
        >
          <Ionicons name="list-outline" size={48} color="#4a4a6a" />
        </LinearGradient>
        <Text className="text-[#f0f0ff] text-xl font-bold">Queue is Empty</Text>
        <Text className="text-[#8888aa] text-sm mt-2 text-center">
          Add songs from your library to start queuing
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a14]">
      <LinearGradient colors={["#12122a", "#0a0a14"]} className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-[#f0f0ff] tracking-tight">Queue</Text>
            <Text className="text-sm text-[#8888aa] mt-1">{queue.length} tracks</Text>
          </View>
          <View className="flex-row gap-3">
            <Pressable onPress={toggleShuffle} className="p-2">
              <LinearGradient
                colors={isShuffled ? ["#7c3aed", "#e94560"] : ["#1a1a3e", "#1a1a3e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-9 h-9 rounded-xl items-center justify-center"
              >
                <Ionicons name="shuffle" size={18} color={isShuffled ? "#fff" : "#4a4a6a"} />
              </LinearGradient>
            </Pressable>
            <Pressable onPress={toggleRepeat} className="p-2">
              <LinearGradient
                colors={repeatMode !== "off" ? ["#7c3aed", "#e94560"] : ["#1a1a3e", "#1a1a3e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-9 h-9 rounded-xl items-center justify-center"
              >
                <Ionicons name="repeat" size={18} color={repeatMode !== "off" ? "#fff" : "#4a4a6a"} />
              </LinearGradient>
            </Pressable>
            <Pressable onPress={clearQueue} className="p-2">
              <LinearGradient colors={["#1a1a3e", "#1a1a3e"]} className="w-9 h-9 rounded-xl items-center justify-center">
                <Ionicons name="trash-outline" size={18} color="#4a4a6a" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {currentTrack && (
        <View className="px-5 mb-3">
          <Text className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-2 ml-1">
            Now Playing
          </Text>
          <LinearGradient
            colors={["rgba(124,58,237,0.1)", "rgba(233,69,96,0.1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl overflow-hidden border border-[#2a2a4e]/30"
          >
            <TrackItem track={currentTrack} isPlaying={isPlaying} onPress={togglePlayPause} />
          </LinearGradient>
        </View>
      )}

      {upcomingTracks.length > 0 && (
        <View className="flex-1">
          <Text className="text-xs font-bold text-[#8888aa] uppercase tracking-widest px-5 mb-2 ml-1">
            Up Next ({upcomingTracks.length})
          </Text>
          <FlatList
            data={upcomingTracks}
            keyExtractor={(item, index) => `upcoming-${item.id}-${index}`}
            renderItem={({ item }) => (
              <View className="px-5">
                <TrackItem
                  track={item}
                  onPress={(track) => play(track, queue, queueIndex + 1 + upcomingTracks.indexOf(item))}
                />
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 130 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
