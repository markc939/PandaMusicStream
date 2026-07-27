import { View, Text, Pressable, Dimensions, KeyboardAvoidingView, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../src/hooks/AuthContext";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, signIn } = useAuthContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/library");
    }
  }, [isAuthenticated]);

  return (
    <LinearGradient
      colors={["#0a0a14", "#12122a", "#1a1a3e", "#0a0a14"]}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="items-center"
          >
            <LinearGradient
              colors={["#7c3aed", "#e94560"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-32 h-32 rounded-[32px] items-center justify-center mb-6"
              style={{
                shadowColor: "#7c3aed",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 30,
              }}
            >
              <Text className="text-5xl">🐼</Text>
            </LinearGradient>

            <Text className="text-4xl font-bold text-[#f0f0ff] text-center tracking-tight">
              Panda Music
            </Text>
            <Text className="text-xl font-semibold text-transparent bg-clip-text mt-0.5 mb-8">
              <LinearGradient
                colors={["#7c3aed", "#e94560"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-xl font-semibold text-[#e94560] tracking-wider">
                  Streamer
                </Text>
              </LinearGradient>
            </Text>

            <View className="bg-[#1a1a3e]/60 rounded-2xl p-6 mb-8 w-full border border-[#2a2a4e]/50"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              }}
            >
              <View className="flex-row items-center mb-4">
                <LinearGradient
                  colors={["#7c3aed", "#06b6d4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                >
                  <Ionicons name="musical-notes" size={22} color="#fff" />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#f0f0ff]">
                    OneDrive Integration
                  </Text>
                  <Text className="text-xs text-[#8888aa] mt-0.5">
                    Stream your personal music library
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mb-4">
                <LinearGradient
                  colors={["#e94560", "#f59e0b"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                >
                  <Ionicons name="headset" size={22} color="#fff" />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#f0f0ff]">
                    Background Playback
                  </Text>
                  <Text className="text-xs text-[#8888aa] mt-0.5">
                    Keep the music playing while you browse
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <LinearGradient
                  colors={["#06b6d4", "#7c3aed"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                >
                  <Ionicons name="cloud-download" size={22} color="#fff" />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#f0f0ff]">
                    Offline Cache
                  </Text>
                  <Text className="text-xs text-[#8888aa] mt-0.5">
                    Download tracks for offline listening
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={signIn}
              disabled={isLoading}
              className="w-full active:opacity-90 disabled:opacity-50"
            >
              <LinearGradient
                colors={["#7c3aed", "#e94560"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center px-8 py-4 rounded-2xl"
                style={{
                  shadowColor: "#7c3aed",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                }}
              >
                <Ionicons name="logo-microsoft" size={22} color="#fff" />
                <Text className="text-base font-bold text-white ml-3">
                  {isLoading ? "Connecting..." : "Continue with Microsoft"}
                </Text>
              </LinearGradient>
            </Pressable>

            <Text className="text-xs text-[#4a4a6a] text-center mt-6 leading-5 max-w-xs">
              Only your OneDrive music library is accessed.
              No data is shared with third parties.
            </Text>
          </Animated.View>
        </View>

        <Text className="text-xs text-[#4a4a6a] text-center pb-8">
          Panda Music Streamer v1.0.0
        </Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
