import { useRef, useCallback } from "react";
import { View, PanResponder, LayoutChangeEvent, GestureResponderEvent, PanResponderGestureState } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface EQSliderProps {
  value: number;
  index: number;
  onChange: (index: number, value: number) => void;
}

const TRACK_HEIGHT = 140;
const THUMB_SIZE = 20;
const MIN_VAL = -6;
const MAX_VAL = 6;

export default function EQSlider({ value, index, onChange }: EQSliderProps) {
  const trackY = useRef(0);
  const currentValue = useRef(value);

  const updateValue = useCallback(
    (y: number) => {
      const relativeY = y - trackY.current;
      const fraction = 1 - Math.max(0, Math.min(1, relativeY / TRACK_HEIGHT));
      const newVal = Math.round((MIN_VAL + fraction * (MAX_VAL - MIN_VAL)) * 2) / 2;
      if (newVal !== currentValue.current) {
        currentValue.current = newVal;
        onChange(index, newVal);
      }
    },
    [index, onChange]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        updateValue(e.nativeEvent.pageY);
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        updateValue(e.nativeEvent.pageY);
      },
    })
  ).current;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    e.target.measureInWindow((x, y) => {
      trackY.current = y;
    });
  }, []);

  const fraction = (value - MIN_VAL) / (MAX_VAL - MIN_VAL);

  return (
    <View className="items-center flex-1">
      <View
        ref={(ref) => ref?.measureInWindow?.((x, y) => { trackY.current = y; })}
        onLayout={onLayout}
        className="w-full rounded-full overflow-hidden relative"
        style={{ height: TRACK_HEIGHT }}
        {...panResponder.panHandlers}
      >
        <View className="absolute inset-0 bg-[#1a1a3e] rounded-full" />

        <LinearGradient
          colors={
            index < 3
              ? ["rgba(6,182,212,0.3)", "rgba(124,58,237,0.3)"]
              : index < 7
              ? ["rgba(124,58,237,0.3)", "rgba(233,69,96,0.3)"]
              : ["rgba(233,69,96,0.3)", "rgba(245,158,11,0.3)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute left-0 right-0 rounded-full"
          style={{
            bottom: `${fraction * 100}%`,
            top: 0,
          }}
        />

        <View
          className="absolute left-1/2 rounded-full border-2 items-center justify-center"
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            marginLeft: -THUMB_SIZE / 2,
            top: `${(1 - fraction) * 100}%`,
            marginTop: -THUMB_SIZE / 2,
            borderColor: value > 2 ? "#e94560" : value < -2 ? "#06b6d4" : "#7c3aed",
            backgroundColor: "#0a0a14",
          }}
        >
          <View
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: value > 2 ? "#e94560" : value < -2 ? "#06b6d4" : "#7c3aed",
            }}
          />
        </View>
      </View>
    </View>
  );
}
