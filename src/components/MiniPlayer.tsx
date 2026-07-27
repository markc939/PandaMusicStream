import { View, Pressable, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Track } from "../types";

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPress: () => void;
}

export default function MiniPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPress,
}: MiniPlayerProps) {
  if (!track) return null;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center mx-3 mb-1.5 rounded-2xl overflow-hidden active:opacity-80"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      }}
    >
      <LinearGradient
        colors={["#1e1e42", "#12122a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center flex-1 px-4 py-2.5"
        style={{
          borderTopWidth: 1,
          borderTopColor: "rgba(124,58,237,0.2)",
        }}
      >
        <LinearGradient
          colors={["#7c3aed", "#e94560"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-10 h-10 rounded-xl items-center justify-center mr-3 overflow-hidden"
        >
          {track.coverUrl ? (
            <Image
              source={{ uri: track.coverUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="musical-note" size={20} color="rgba(255,255,255,0.6)" />
          )}
        </LinearGradient>

        <View className="flex-1 mr-2">
          <Text className="text-sm font-bold text-[#f0f0ff]" numberOfLines={1}>
            {track.title}
          </Text>
          <Text className="text-xs text-[#8888aa]" numberOfLines={1}>
            {track.artist}
          </Text>
        </View>

        <Pressable onPress={onPlayPause} className="p-1.5 mr-1">
          <LinearGradient
            colors={["#7c3aed", "#e94560"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-9 h-9 rounded-xl items-center justify-center"
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color="#fff"
              style={{ marginLeft: isPlaying ? 0 : 1.5 }}
            />
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onNext} className="p-1.5">
          <Ionicons name="play-skip-forward" size={20} color="#f0f0ff" />
        </Pressable>
      </LinearGradient>
    </Pressable>
  );
}
