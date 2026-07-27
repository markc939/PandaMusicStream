import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  Pressable,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOneDrive } from "../../src/hooks/useOneDrive";
import { Album } from "../../src/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH * 0.55;
const ITEM_HEIGHT = ITEM_WIDTH;
const ITEM_SPACING = ITEM_WIDTH + 10;
const SIDE_ITEM_WIDTH = ITEM_WIDTH * 0.75;
const REFLECTION_HEIGHT = ITEM_HEIGHT * 0.35;

export default function CarouselScreen() {
  const router = useRouter();
  const { artists, isLoading, error, loadArtists } = useOneDrive();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allAlbums: (Album & { artistName: string })[] = [];

  useEffect(() => {
    loadArtists();
  }, []);

  if (artists.length > 0) {
    for (const artist of artists) {
      for (const album of artist.albums) {
        allAlbums.push({ ...album, artistName: artist.name });
      }
    }
  }

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const onMomentumScrollEnd = useCallback((e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_SPACING);
    setCurrentIndex(Math.max(0, Math.min(index, allAlbums.length - 1)));
  }, [allAlbums.length]);

  const handleAlbumPress = useCallback((album: Album & { artistName: string }) => {
    router.navigate({
      pathname: "/(tabs)/album-detail",
      params: { albumData: JSON.stringify(album) },
    } as any);
  }, [router]);

  const renderItem = useCallback(
    ({ item, index }: { item: Album & { artistName: string }; index: number }) => {
      const inputRange = [
        (index - 2) * ITEM_SPACING,
        (index - 1) * ITEM_SPACING,
        index * ITEM_SPACING,
        (index + 1) * ITEM_SPACING,
        (index + 2) * ITEM_SPACING,
      ];

      const rotateY = scrollX.interpolate({
        inputRange,
        outputRange: ["50deg", "25deg", "0deg", "-25deg", "-50deg"],
        extrapolate: "clamp",
      });

      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.65, 0.82, 1, 0.82, 0.65],
        extrapolate: "clamp",
      });

      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.3, 0.6, 1, 0.6, 0.3],
        extrapolate: "clamp",
      });

      const zIndex = scrollX.interpolate({
        inputRange,
        outputRange: [0, allAlbums.length - index, allAlbums.length - index + 1, allAlbums.length - index, 0],
        extrapolate: "clamp",
      });

      const isCenter = index === currentIndex;

      return (
        <Pressable
          onPress={() => handleAlbumPress(item)}
          className="active:opacity-90"
          style={{ width: ITEM_SPACING, alignItems: "center", paddingTop: 20 }}
        >
          <Animated.View
            style={{
              transform: [
                { perspective: 1200 },
                { rotateY },
                { scale },
              ],
              opacity,
              zIndex,
              width: ITEM_WIDTH,
              alignItems: "center",
            }}
          >
            <LinearGradient
              colors={["rgba(124,58,237,0.2)", "rgba(233,69,96,0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl overflow-hidden"
              style={{
                width: ITEM_WIDTH,
                height: ITEM_HEIGHT,
                shadowColor: isCenter ? "#7c3aed" : "transparent",
                shadowOffset: { width: 0, height: isCenter ? 12 : 4 },
                shadowOpacity: isCenter ? 0.5 : 0.2,
                shadowRadius: isCenter ? 28 : 12,
                borderWidth: 1,
                borderColor: isCenter ? "rgba(124,58,237,0.3)" : "rgba(42,42,78,0.3)",
              }}
            >
              {item.coverUrl ? (
                <Image
                  source={{ uri: item.coverUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center bg-[#1a1a3e]">
                  <LinearGradient
                    colors={["#7c3aed", "#e94560"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-14 h-14 rounded-2xl items-center justify-center opacity-50"
                  >
                    <Ionicons name="disc" size={28} color="#fff" />
                  </LinearGradient>
                </View>
              )}

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                className="absolute bottom-0 left-0 right-0 h-16"
              />
            </LinearGradient>

            <Animated.View
              className="overflow-hidden rounded-2xl mt-1"
              style={{
                width: ITEM_WIDTH,
                height: REFLECTION_HEIGHT,
                opacity: scrollX.interpolate({
                  inputRange,
                  outputRange: [0.08, 0.15, 0.2, 0.15, 0.08],
                  extrapolate: "clamp",
                }),
              }}
            >
              <View style={{ transform: [{ scaleY: -0.5 }], opacity: 0.5 }}>
                {item.coverUrl ? (
                  <Image
                    source={{ uri: item.coverUrl }}
                    style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, backgroundColor: "#1a1a3e" }} />
                )}
              </View>
              <LinearGradient
                colors={["transparent", "#0a0a14"]}
                className="absolute top-0 left-0 right-0 bottom-0"
              />
            </Animated.View>
          </Animated.View>

          <Animated.View
            className="mt-4 items-center"
            style={{
              opacity: scrollX.interpolate({
                inputRange,
                outputRange: [0, 0.4, 1, 0.4, 0],
                extrapolate: "clamp",
              }),
            }}
          >
            <Text className="text-sm font-bold text-[#f0f0ff] text-center" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs text-[#8888aa] mt-0.5 text-center" numberOfLines={1}>
              {item.artistName}
            </Text>
          </Animated.View>
        </Pressable>
      );
    },
    [scrollX, currentIndex, allAlbums.length, handleAlbumPress]
  );

  if (isLoading && allAlbums.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a14] items-center justify-center">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="text-[#8888aa] mt-4">Loading albums...</Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={["#12122a", "#0a0a14"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-[#f0f0ff] tracking-tight">
                Cover Flow
              </Text>
              <Text className="text-sm text-[#8888aa] mt-1">
                {allAlbums.length} albums
              </Text>
            </View>
          </View>
        </View>

        {allAlbums.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <LinearGradient
              colors={["rgba(124,58,237,0.15)", "rgba(233,69,96,0.15)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-28 h-28 rounded-3xl items-center justify-center mb-6"
            >
              <Ionicons name="images-outline" size={52} color="#4a4a6a" />
            </LinearGradient>
            <Text className="text-[#f0f0ff] text-xl font-bold text-center">
              No Albums Found
            </Text>
            <Text className="text-[#8888aa] text-sm mt-2 text-center">
              Organize your music as{"\n"}Music/Artist/Album/tracks
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center" style={{ marginBottom: 40 }}>
            <Animated.FlatList
              ref={flatListRef}
              data={allAlbums}
              keyExtractor={(item: any) => item.id}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_SPACING}
              decelerationRate={0.88}
              contentContainerStyle={{
                paddingHorizontal: (SCREEN_WIDTH - ITEM_SPACING) / 2,
                paddingVertical: 20,
              }}
              onScroll={onScroll}
              onMomentumScrollEnd={onMomentumScrollEnd}
              scrollEventThrottle={16}
            />

            <View className="flex-row items-center justify-center gap-1.5 mt-4">
              {allAlbums.slice(0, Math.min(allAlbums.length, 9)).map((_, i) => (
                <View
                  key={i}
                  className={`rounded-full ${i === currentIndex ? "w-5 h-1.5" : "w-1.5 h-1.5"}`}
                >
                  <LinearGradient
                    colors={
                      i === currentIndex
                        ? ["#7c3aed", "#e94560"]
                        : ["#2a2a4e", "#2a2a4e"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className={`rounded-full ${i === currentIndex ? "w-5 h-1.5" : "w-1.5 h-1.5"}`}
                  />
                </View>
              ))}
              {allAlbums.length > 9 && (
                <Text className="text-xs text-[#4a4a6a] ml-1">
                  +{allAlbums.length - 9}
                </Text>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
