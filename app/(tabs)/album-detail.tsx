import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useOneDrive } from "../../src/hooks/useOneDrive";
import { usePlayerContext } from "../../src/hooks/PlayerContext";
import TrackItem from "../../src/components/TrackItem";
import { Album, Track } from "../../src/types";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = width * 0.65;

export default function AlbumDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { loadAlbumTracks } = useOneDrive();
  const { playAll, currentTrack, play } = usePlayerContext();

  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const albumData = JSON.parse(
        typeof params.albumData === "string" ? params.albumData : ""
      );
      setAlbum(albumData);

      if (albumData.artist && albumData.title) {
        loadAlbumTracks(albumData.artistName || albumData.artist, albumData.title)
          .then(setTracks)
          .finally(() => setIsLoading(false));
      } else if (albumData.tracks?.length > 0) {
        setTracks(albumData.tracks);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  }, [params.albumData]);

  const handlePlayAll = useCallback(() => {
    if (tracks.length > 0) {
      playAll(tracks, 0);
    }
  }, [tracks, playAll]);

  const handleTrackPress = useCallback(
    (track: Track) => {
      playAll(tracks, tracks.indexOf(track));
    },
    [tracks, playAll]
  );

  if (!album) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a14] items-center justify-center">
        <Text className="text-[#8888aa]">Album not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={["#12122a", "#0a0a14", "#0a0a14"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-2 pb-2 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <LinearGradient
              colors={["rgba(124,58,237,0.2)", "rgba(233,69,96,0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-9 h-9 rounded-xl items-center justify-center"
            >
              <Ionicons name="chevron-back" size={22} color="#f0f0ff" />
            </LinearGradient>
          </Pressable>
          <Text className="text-lg font-bold text-[#f0f0ff] flex-1 text-center mr-9">
            Album
          </Text>
        </View>

        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View className="items-center px-5 pt-2 pb-6">
              <LinearGradient
                colors={["rgba(124,58,237,0.15)", "rgba(233,69,96,0.15)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-3xl overflow-hidden mb-5"
                style={{
                  width: HEADER_HEIGHT * 0.85,
                  height: HEADER_HEIGHT * 0.85,
                  shadowColor: "#7c3aed",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(124,58,237,0.2)",
                }}
              >
                {album.coverUrl ? (
                  <Image
                    source={{ uri: album.coverUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center bg-[#1a1a3e]">
                    <Ionicons name="disc" size={60} color="#4a4a6a" />
                  </View>
                )}
              </LinearGradient>

              <Text className="text-2xl font-bold text-[#f0f0ff] text-center" numberOfLines={2}>
                {album.title}
              </Text>
              <Text className="text-base text-[#8888aa] mt-1 text-center">
                {album.artist}
              </Text>
              <Text className="text-sm text-[#4a4a6a] mt-0.5 text-center">
                {album.trackCount} tracks
              </Text>

              {tracks.length > 0 && (
                <Pressable
                  onPress={handlePlayAll}
                  className="w-full mt-6 active:opacity-80"
                >
                  <LinearGradient
                    colors={["#7c3aed", "#e94560"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-center py-3.5 rounded-2xl"
                    style={{
                      shadowColor: "#7c3aed",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.4,
                      shadowRadius: 16,
                    }}
                  >
                    <Ionicons name="play" size={20} color="#fff" />
                    <Text className="text-base font-bold text-white ml-2">
                      Play All
                    </Text>
                  </LinearGradient>
                </Pressable>
              )}

              <View className="w-full h-px bg-[#2a2a4e]/50 mt-6" />
            </View>
          }
          renderItem={({ item, index }) => (
            <TrackItem
              track={item}
              trackNumber={index + 1}
              isPlaying={currentTrack?.id === item.id}
              showOffline
              onPress={handleTrackPress}
            />
          )}
          ListEmptyComponent={
            isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#7c3aed" />
              </View>
            ) : (
              <View className="items-center py-8 px-8">
                <Text className="text-[#8888aa] text-center">
                  No tracks loaded for this album
                </Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
