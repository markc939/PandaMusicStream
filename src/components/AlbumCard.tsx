import { Pressable, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface AlbumCardProps {
  title: string;
  artist: string;
  coverUrl?: string;
  trackCount: number;
  onPress: () => void;
}

export default function AlbumCard({
  title,
  artist,
  coverUrl,
  trackCount,
  onPress,
}: AlbumCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[48%] mb-5 active:opacity-80"
    >
      <View
        className="aspect-square rounded-2xl overflow-hidden mb-3"
        style={{
          shadowColor: "#7c3aed",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        }}
      >
        <LinearGradient
          colors={["#1a1a3e", "#12122a"]}
          className="w-full h-full"
        >
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <LinearGradient
                colors={["#7c3aed", "#e94560"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-16 h-16 rounded-2xl items-center justify-center opacity-60"
              >
                <Ionicons name="disc" size={32} color="#fff" />
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </View>
      <Text className="text-sm font-bold text-[#f0f0ff]" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-xs text-[#8888aa] mt-0.5" numberOfLines={1}>
        {artist} · {trackCount} track{trackCount !== 1 ? "s" : ""}
      </Text>
    </Pressable>
  );
}
