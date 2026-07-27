export const FREQ_BANDS = [
  { label: "32", freq: 32 },
  { label: "64", freq: 64 },
  { label: "125", freq: 125 },
  { label: "250", freq: 250 },
  { label: "500", freq: 500 },
  { label: "1k", freq: 1000 },
  { label: "2k", freq: 2000 },
  { label: "4k", freq: 4000 },
  { label: "8k", freq: 8000 },
  { label: "12k", freq: 12000 },
  { label: "16k", freq: 16000 },
  { label: "20k", freq: 20000 },
];

export const BAND_LABELS = FREQ_BANDS.map((b) => b.label);

export interface EQSettings {
  bands: number[];
  preamp: number;
  presetName: string;
}

export const FLAT_EQ: EQSettings = {
  bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  preamp: 0,
  presetName: "Flat",
};

export const PRESETS: Record<string, EQSettings> = {
  flat: {
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preamp: 0,
    presetName: "Flat",
  },
  rock: {
    bands: [4, 3, 2, 1, 0, -1, 0, 2, 3, 4, 3, 2],
    preamp: 0,
    presetName: "Rock",
  },
  pop: {
    bands: [-1, 0, 2, 3, 2, 0, -1, 0, 2, 3, 2, 1],
    preamp: 0,
    presetName: "Pop",
  },
  jazz: {
    bands: [3, 2, 1, 1, 2, 3, 2, 2, 3, 4, 4, 3],
    preamp: 0,
    presetName: "Jazz",
  },
  classical: {
    bands: [3, 3, 2, 1, 0, -1, -1, 0, 2, 4, 5, 5],
    preamp: 0,
    presetName: "Classical",
  },
  bass: {
    bands: [6, 6, 5, 3, 1, -1, -2, -2, -1, 0, 1, 2],
    preamp: 0,
    presetName: "Bass Boost",
  },
  acoustic: {
    bands: [2, 2, 3, 3, 2, 1, 1, 2, 3, 4, 4, 3],
    preamp: 0,
    presetName: "Acoustic",
  },
  vocal: {
    bands: [-1, -1, 0, 2, 4, 5, 4, 3, 1, 0, -1, -2],
    preamp: 0,
    presetName: "Vocal",
  },
  dance: {
    bands: [5, 5, 4, 2, 0, -1, 0, 2, 3, 4, 5, 5],
    preamp: 0,
    presetName: "Dance",
  },
  hiphop: {
    bands: [6, 6, 5, 3, 1, 0, -1, 0, 1, 2, 3, 4],
    preamp: 0,
    presetName: "Hip Hop",
  },
  loudness: {
    bands: [4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 4, 3],
    preamp: 2,
    presetName: "Loudness",
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);

export function getDefaultEQ(): EQSettings {
  return { ...FLAT_EQ, bands: [...FLAT_EQ.bands] };
}
