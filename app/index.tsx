import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuthContext } from "../src/hooks/AuthContext";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.replace(isAuthenticated ? "/(tabs)/library" : "/login");
      });
    }
  }, [isLoading, isAuthenticated]);

  return (
    <LinearGradient
      colors={["#0a0a14", "#12122a", "#1a1a3e"]}
      className="flex-1 items-center justify-center"
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        }}
        className="items-center"
      >
        <LinearGradient
          colors={["#7c3aed", "#e94560"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-28 h-28 rounded-3xl items-center justify-center shadow-lg"
          style={{ shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 24 }}
        >
          <Text className="text-5xl">🐼</Text>
        </LinearGradient>
        <Text className="text-3xl font-bold text-[#f0f0ff] mt-6 tracking-tight">
          Panda Music
        </Text>
        <Text className="text-lg font-semibold text-[#8888aa] mt-1 tracking-wide">
          Streamer
        </Text>
        <View className="flex-row mt-8 gap-1.5">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className="w-2 h-2 rounded-full bg-[#7c3aed]"
              style={{ opacity: 0.6 - i * 0.15 }}
            />
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}
