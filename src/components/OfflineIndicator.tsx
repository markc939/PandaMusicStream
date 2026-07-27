import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface OfflineIndicatorProps {
  isCached: boolean;
  onToggle: () => void;
  isDownloading?: boolean;
}

export default function OfflineIndicator({
  isCached,
  onToggle,
  isDownloading,
}: OfflineIndicatorProps) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={isDownloading}
      className="active:opacity-70"
    >
      <LinearGradient
        colors={
          isDownloading
            ? ["#7c3aed", "#06b6d4"]
            : isCached
            ? ["rgba(34,197,94,0.15)", "rgba(34,197,94,0.15)"]
            : ["rgba(74,74,106,0.15)", "rgba(74,74,106,0.15)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl"
      >
        {isDownloading ? (
          <>
            <Ionicons name="cloud-upload" size={13} color="#06b6d4" />
            <Text className="text-xs font-semibold text-[#06b6d4]">Saving...</Text>
          </>
        ) : isCached ? (
          <>
            <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
            <Text className="text-xs font-semibold text-[#22c55e]">Downloaded</Text>
          </>
        ) : (
          <>
            <Ionicons name="cloud-download-outline" size={13} color="#4a4a6a" />
            <Text className="text-xs font-semibold text-[#4a4a6a]">Save</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}
