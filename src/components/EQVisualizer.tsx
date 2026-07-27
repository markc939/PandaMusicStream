import { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface EQVisualizerProps {
  magnitudes: number[];
  eqCurve: number[];
  isPlaying: boolean;
}

export default function EQVisualizer({ magnitudes, eqCurve, isPlaying }: EQVisualizerProps) {
  const barAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0.02))
  ).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) => {
      const target = isPlaying ? Math.max(0.02, Math.min(1, magnitudes[i] || 0.02)) : 0.04 + Math.random() * 0.04;
      return Animated.timing(anim, {
        toValue: target,
        duration: 80 + Math.random() * 40,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
    });
    Animated.parallel(animations).start();
  }, [magnitudes, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      barAnims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.03 + Math.random() * 0.04,
          duration: 300 + Math.random() * 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isPlaying]);

  return (
    <View className="flex-row items-end justify-between h-full px-1 gap-[3px]">
      {barAnims.map((anim, i) => {
        const eqBoost = (eqCurve[i] || 0) / 6;
        const boostFactor = 1 + eqBoost * 0.6;

        return (
          <Animated.View
            key={i}
            className="flex-1 rounded-t-sm overflow-hidden"
            style={{
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ["4%", "100%"],
              }),
              transform: [{ scaleY: boostFactor }],
            }}
          >
            <LinearGradient
              colors={
                i < 3
                  ? ["#06b6d4", "#7c3aed"]
                  : i < 7
                  ? ["#7c3aed", "#e94560"]
                  : ["#e94560", "#f59e0b"]
              }
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              className="absolute inset-0 rounded-t-sm"
              style={{ opacity: 0.7 + (eqCurve[i] || 0) * 0.05 }}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}
