import { View, Pressable, Text, LayoutChangeEvent } from "react-native";
import { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { formatTime } from "../lib/format";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  const [barWidth, setBarWidth] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    setBarWidth(e.nativeEvent.layout.width);
  }

  function handlePress(e: any) {
    const x = e.nativeEvent.locationX;
    if (barWidth > 0 && duration > 0) {
      const fraction = Math.max(0, Math.min(1, x / barWidth));
      onSeek(fraction * duration);
    }
  }

  const fraction = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <View className="px-2 mb-2">
      <Pressable
        onLayout={onLayout}
        onPress={handlePress}
        className="h-8 justify-center"
      >
        <View className="h-1.5 rounded-full overflow-hidden bg-[#1a1a3e]">
          <LinearGradient
            colors={["#7c3aed", "#e94560"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-full rounded-full"
            style={{ width: `${fraction * 100}%` }}
          />
        </View>
        <View
          className="absolute w-3.5 h-3.5 rounded-full bg-white"
          style={{
            left: `${fraction * 100}%`,
            marginLeft: -7,
            top: 12,
            shadowColor: "#7c3aed",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
          }}
        />
      </Pressable>
      <View className="flex-row justify-between mt-0.5">
        <Text className="text-xs font-medium text-[#8888aa]">
          {formatTime(currentTime)}
        </Text>
        <Text className="text-xs font-medium text-[#4a4a6a]">
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}
