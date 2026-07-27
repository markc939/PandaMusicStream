import { useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Track } from "../types";
import { formatTime } from "../lib/format";
import OfflineIndicator from "./OfflineIndicator";
import { isTrackCached, downloadTrack } from "../services/cache";

interface TrackItemProps {
  track: Track;
  isPlaying?: boolean;
  showOffline?: boolean;
  onPress: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  trackNumber?: number;
}

export default function TrackItem({
  track,
  isPlaying,
  showOffline,
  onPress,
  onAddToQueue,
  trackNumber,
}: TrackItemProps) {
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (showOffline) {
      isTrackCached(track.id).then(setCached);
    }
  }, [showOffline, track.id]);

  const handleToggleOffline = async () => {
    if (downloading) return;
    if (cached) return;
    setDownloading(true);
    try {
      const result = await downloadTrack(track);
      if (result) setCached(true);
    } catch {}
    setDownloading(false);
  };

  return (
    <Pressable
      onPress={() => onPress(track)}
      className="flex-row items-center px-4 py-3.5 active:opacity-60"
    >
      {trackNumber != null && (
        <Text className="w-8 text-sm font-semibold text-[#4a4a6a] text-center">
          {trackNumber}
        </Text>
      )}
      <View className="w-10 h-10 rounded-xl overflow-hidden mr-3">
        <LinearGradient
          colors={isPlaying ? ["#7c3aed", "#e94560"] : ["#1a1a3e", "#1a1a3e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full items-center justify-center"
        >
          {isPlaying ? (
            <Ionicons name="play" size={16} color="#fff" />
          ) : (
            <Ionicons name="musical-note" size={16} color="#4a4a6a" />
          )}
        </LinearGradient>
      </View>
      <View className="flex-1 mr-2">
        <Text
          className={`text-base font-semibold ${isPlaying ? "text-[#7c3aed]" : "text-[#f0f0ff]"}`}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text className="text-sm text-[#8888aa] mt-0.5" numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {showOffline && (
          <OfflineIndicator
            isCached={cached}
            onToggle={handleToggleOffline}
            isDownloading={downloading}
          />
        )}
        <Text className="text-sm text-[#4a4a6a] w-12 text-right font-medium">
          {track.duration > 0 ? formatTime(track.duration) : "--:--"}
        </Text>
        {onAddToQueue && (
          <Pressable onPress={() => onAddToQueue(track)} className="p-1.5" hitSlop={8}>
            <LinearGradient
              colors={["rgba(124,58,237,0.2)", "rgba(233,69,96,0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-7 h-7 rounded-lg items-center justify-center"
            >
              <Ionicons name="add" size={16} color="#8888aa" />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
