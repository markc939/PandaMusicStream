import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  Pressable,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useOneDrive } from "../../src/hooks/useOneDrive";
import { usePlayerContext } from "../../src/hooks/PlayerContext";
import TrackItem from "../../src/components/TrackItem";
import { Track } from "../../src/types";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { tracks, isLoading, search } = useOneDrive();
  const { playAll, currentTrack } = usePlayerContext();

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.trim().length >= 2) {
        search(text);
      }
    },
    [search]
  );

  const handleTrackPress = useCallback(
    (track: Track) => {
      Keyboard.dismiss();
      playAll(tracks, tracks.indexOf(track));
    },
    [tracks, playAll]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a14]">
      <LinearGradient
        colors={["#12122a", "#0a0a14"]}
        className="px-5 pt-4 pb-5"
      >
        <Text className="text-3xl font-bold text-[#f0f0ff] tracking-tight mb-4">
          Search
        </Text>
        <View className="flex-row items-center bg-[#1a1a3e] rounded-2xl px-4 py-3.5 border border-[#2a2a4e]/50">
          <Ionicons name="search" size={20} color="#4a4a6a" />
          <TextInput
            className="flex-1 text-[#f0f0ff] text-base ml-3"
            placeholder="Songs, artists, albums..."
            placeholderTextColor="#4a4a6a"
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); Keyboard.dismiss(); }}>
              <Ionicons name="close-circle" size={20} color="#4a4a6a" />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {query.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <LinearGradient
            colors={["rgba(124,58,237,0.15)", "rgba(233,69,96,0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
          >
            <Ionicons name="search-outline" size={48} color="#4a4a6a" />
          </LinearGradient>
          <Text className="text-[#f0f0ff] text-lg font-semibold">Find Your Music</Text>
          <Text className="text-[#8888aa] text-sm mt-2 text-center">
            Search across your entire OneDrive library
          </Text>
        </View>
      )}

      {query.length > 0 && query.length < 2 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#4a4a6a]">Type at least 2 characters</Text>
        </View>
      )}

      {query.length >= 2 && (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrackItem
              track={item}
              isPlaying={currentTrack?.id === item.id}
              onPress={handleTrackPress}
            />
          )}
          ListHeaderComponent={
            tracks.length > 0 ? (
              <View className="px-5 pb-2 pt-4">
                <Text className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider">
                  {tracks.length} result{tracks.length !== 1 ? "s" : ""}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="items-center py-16 px-8">
                <Ionicons name="search-outline" size={48} color="#4a4a6a" />
                <Text className="text-[#f0f0ff] text-lg font-semibold mt-4">No Results</Text>
                <Text className="text-[#8888aa] text-sm mt-1 text-center">
                  Try a different search term
                </Text>
              </View>
            ) : (
              <View className="items-center py-16">
                <ActivityIndicator size="small" color="#7c3aed" />
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 130 }}
        />
      )}
    </SafeAreaView>
  );
}
