import { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import EQVisualizer from "./EQVisualizer";
import EQSlider from "./EQSlider";
import { FREQ_BANDS, EQSettings, PRESETS, PRESET_NAMES, FLAT_EQ } from "../services/eq";

interface EqualizerProps {
  isPlaying: boolean;
  magnitudes: number[];
  settings: EQSettings;
  onSettingsChange: (settings: EQSettings) => void;
}

export default function Equalizer({
  isPlaying,
  magnitudes,
  settings,
  onSettingsChange,
}: EqualizerProps) {
  const [expanded, setExpanded] = useState(false);

  const handleSliderChange = useCallback(
    (index: number, value: number) => {
      const newBands = [...settings.bands];
      newBands[index] = value;
      onSettingsChange({ ...settings, bands: newBands, presetName: "Custom" });
    },
    [settings, onSettingsChange]
  );

  const handlePresetSelect = useCallback(
    (key: string) => {
      const preset = PRESETS[key];
      onSettingsChange({ ...preset, bands: [...preset.bands] });
    },
    [onSettingsChange]
  );

  const handleReset = useCallback(() => {
    onSettingsChange({ ...FLAT_EQ, bands: [...FLAT_EQ.bands] });
  }, [onSettingsChange]);

  return (
    <View className="rounded-2xl overflow-hidden border border-[#2a2a4e]/50 bg-[#12122a]">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between px-4 py-3 active:opacity-80"
      >
        <LinearGradient
          colors={["#7c3aed", "#e94560"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="w-9 h-9 rounded-xl items-center justify-center"
        >
          <Ionicons name="options" size={18} color="#fff" />
        </LinearGradient>
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-[#f0f0ff]">Equalizer</Text>
          <Text className="text-xs text-[#8888aa]">{settings.presetName} · 12 Bands</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#8888aa"
        />
      </Pressable>

      {expanded && (
        <View className="px-4 pb-5">
          <View className="h-40 mb-4 rounded-xl overflow-hidden bg-[#0a0a14] p-2">
            <EQVisualizer
              magnitudes={magnitudes}
              eqCurve={settings.bands}
              isPlaying={isPlaying}
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider mb-2">
              Presets
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {PRESET_NAMES.slice(0, 6).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => handlePresetSelect(key)}
                  className={`px-3 py-1.5 rounded-xl ${
                    settings.presetName === PRESETS[key].presetName
                      ? "border border-[#7c3aed]"
                      : "border border-[#2a2a4e]"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      settings.presetName === PRESETS[key].presetName
                        ? "text-[#7c3aed]"
                        : "text-[#8888aa]"
                    }`}
                  >
                    {PRESETS[key].presetName}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <View className="flex-row justify-between mb-1 px-1">
              {FREQ_BANDS.map((band) => (
                <Text key={band.label} className="text-[9px] text-[#4a4a6a] font-medium text-center" style={{ width: 24 }}>
                  {band.label}
                </Text>
              ))}
            </View>
            <View className="flex-row items-end h-[160px] gap-[2px]">
              {settings.bands.map((val, i) => (
                <EQSlider
                  key={i}
                  index={i}
                  value={val}
                  onChange={handleSliderChange}
                />
              ))}
            </View>
            <View className="flex-row justify-between mt-2 px-1">
              <Text className="text-[10px] text-[#4a4a6a] font-bold">-6</Text>
              <Text className="text-[10px] text-[#4a4a6a] font-bold">+6</Text>
            </View>
          </View>

          <Pressable
            onPress={handleReset}
            className="self-center mt-4 active:opacity-70"
          >
            <LinearGradient
              colors={["rgba(124,58,237,0.15)", "rgba(233,69,96,0.15)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center px-4 py-2 rounded-xl"
            >
              <Ionicons name="refresh" size={14} color="#8888aa" />
              <Text className="text-sm font-semibold text-[#8888aa] ml-1.5">
                Reset to Flat
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </View>
  );
}
