import { View, Pressable, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RepeatMode } from "../types";

interface PlayerControlsProps {
  isPlaying: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onRepeat: () => void;
  onShuffle: () => void;
}

export default function PlayerControls({
  isPlaying,
  repeatMode,
  isShuffled,
  onPlayPause,
  onNext,
  onPrevious,
  onRepeat,
  onShuffle,
}: PlayerControlsProps) {
  return (
    <View className="flex-row items-center justify-center gap-6 py-4">
      <Pressable onPress={onShuffle} className="p-2">
        <LinearGradient
          colors={isShuffled ? ["#7c3aed", "#e94560"] : ["transparent", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-10 h-10 rounded-xl items-center justify-center"
        >
          <Ionicons
            name="shuffle"
            size={20}
            color={isShuffled ? "#fff" : "#4a4a6a"}
          />
        </LinearGradient>
      </Pressable>

      <Pressable onPress={onPrevious} className="p-2">
        <LinearGradient
          colors={["rgba(124,58,237,0.15)", "rgba(233,69,96,0.15)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-12 h-12 rounded-2xl items-center justify-center"
        >
          <Ionicons name="play-skip-back" size={24} color="#f0f0ff" />
        </LinearGradient>
      </Pressable>

      <Pressable onPress={onPlayPause} className="active:opacity-80">
        <LinearGradient
          colors={["#7c3aed", "#e94560"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{
            shadowColor: "#7c3aed",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 24,
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={36}
            color="#fff"
            style={{ marginLeft: isPlaying ? 0 : 3 }}
          />
        </LinearGradient>
      </Pressable>

      <Pressable onPress={onNext} className="p-2">
        <LinearGradient
          colors={["rgba(124,58,237,0.15)", "rgba(233,69,96,0.15)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-12 h-12 rounded-2xl items-center justify-center"
        >
          <Ionicons name="play-skip-forward" size={24} color="#f0f0ff" />
        </LinearGradient>
      </Pressable>

      <Pressable onPress={onRepeat} className="p-2 relative">
        <LinearGradient
          colors={repeatMode !== "off" ? ["#7c3aed", "#e94560"] : ["transparent", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-10 h-10 rounded-xl items-center justify-center"
        >
          <Ionicons
            name="repeat"
            size={20}
            color={repeatMode !== "off" ? "#fff" : "#4a4a6a"}
          />
        </LinearGradient>
        {repeatMode === "one" && (
          <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#e94560] items-center justify-center">
            <Text className="text-[9px] font-bold text-white">1</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
