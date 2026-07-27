import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MiniPlayer from "../../src/components/MiniPlayer";
import { usePlayerContext } from "../../src/hooks/PlayerContext";

export default function TabLayout() {
  const router = useRouter();
  const { currentTrack, isPlaying, togglePlayPause, next } = usePlayerContext();

  return (
    <View className="flex-1 bg-[#0a0a14]">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "rgba(18, 18, 42, 0.92)",
            borderTopColor: "rgba(42, 42, 78, 0.4)",
            borderTopWidth: 1,
            height: currentTrack ? 115 : 65,
            paddingBottom: Platform.OS === "ios" ? 12 : 8,
            paddingTop: 8,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 0,
          },
          tabBarActiveTintColor: "#7c3aed",
          tabBarInactiveTintColor: "#4a4a6a",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.3,
            marginTop: 2,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
        }}
      >
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ focused }) => (
              <LinearGradient
                colors={focused ? ["#7c3aed", "#e94560"] : ["#4a4a6a", "#4a4a6a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-6 h-6 rounded-lg items-center justify-center"
              >
                <Ionicons name="musical-notes" size={focused ? 15 : 18} color={focused ? "#fff" : "#4a4a6a"} />
              </LinearGradient>
            ),
          }}
        />
        <Tabs.Screen
          name="carousel"
          options={{
            title: "Browse",
            tabBarIcon: ({ focused }) => (
              <LinearGradient
                colors={focused ? ["#06b6d4", "#7c3aed"] : ["#4a4a6a", "#4a4a6a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-6 h-6 rounded-lg items-center justify-center"
              >
                <Ionicons name="images" size={focused ? 15 : 18} color={focused ? "#fff" : "#4a4a6a"} />
              </LinearGradient>
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ focused }) => (
              <LinearGradient
                colors={focused ? ["#7c3aed", "#e94560"] : ["#4a4a6a", "#4a4a6a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-6 h-6 rounded-lg items-center justify-center"
              >
                <Ionicons name="search" size={focused ? 15 : 18} color={focused ? "#fff" : "#4a4a6a"} />
              </LinearGradient>
            ),
          }}
        />
        <Tabs.Screen
          name="player"
          options={{
            title: "Playing",
            tabBarIcon: ({ focused }) => (
              <LinearGradient
                colors={focused ? ["#e94560", "#7c3aed"] : ["#4a4a6a", "#4a4a6a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-6 h-6 rounded-lg items-center justify-center"
              >
                <Ionicons name={currentTrack ? "play-circle" : "play-circle-outline"} size={focused ? 15 : 18} color={focused ? "#fff" : "#4a4a6a"} />
              </LinearGradient>
            ),
          }}
        />
        <Tabs.Screen
          name="queue"
          options={{
            title: "Queue",
            tabBarIcon: ({ focused }) => (
              <LinearGradient
                colors={focused ? ["#7c3aed", "#e94560"] : ["#4a4a6a", "#4a4a6a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-6 h-6 rounded-lg items-center justify-center"
              >
                <Ionicons name="list" size={focused ? 15 : 18} color={focused ? "#fff" : "#4a4a6a"} />
              </LinearGradient>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused }) => (
              <LinearGradient
                colors={focused ? ["#f59e0b", "#e94560"] : ["#4a4a6a", "#4a4a6a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-6 h-6 rounded-lg items-center justify-center"
              >
                <Ionicons name="options" size={focused ? 15 : 18} color={focused ? "#fff" : "#4a4a6a"} />
              </LinearGradient>
            ),
          }}
        />
        <Tabs.Screen
          name="album-detail"
          options={{
            title: "Album",
            href: null,
          }}
        />
      </Tabs>

      {currentTrack && (
        <View
          style={{
            position: "absolute",
            bottom: 65,
            left: 0,
            right: 0,
          }}
        >
          <MiniPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onNext={next}
            onPress={() => router.navigate("/(tabs)/player")}
          />
        </View>
      )}
    </View>
  );
}
