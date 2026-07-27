export function fftComplex(re: number[], im: number[]): void {
  const n = re.length;
  if (n <= 1) return;

  const half = n >> 1;
  const reEven: number[] = new Array(half);
  const imEven: number[] = new Array(half);
  const reOdd: number[] = new Array(half);
  const imOdd: number[] = new Array(half);

  for (let i = 0; i < half; i++) {
    reEven[i] = re[i * 2];
    imEven[i] = im[i * 2];
    reOdd[i] = re[i * 2 + 1];
    imOdd[i] = im[i * 2 + 1];
  }

  fftComplex(reEven, imEven);
  fftComplex(reOdd, imOdd);

  for (let k = 0; k < half; k++) {
    const angle = (-2 * Math.PI * k) / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tRe = cos * reOdd[k] - sin * imOdd[k];
    const tIm = cos * imOdd[k] + sin * reOdd[k];
    re[k] = reEven[k] + tRe;
    im[k] = imEven[k] + tIm;
    re[k + half] = reEven[k] - tRe;
    im[k + half] = imEven[k] - tIm;
  }
}

export function applyWindow(data: Float32Array, type: "hann" | "hamming" | "blackman" = "hann"): Float32Array {
  const n = data.length;
  const result = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    switch (type) {
      case "hann":
        result[i] = data[i] * 0.5 * (1 - Math.cos(2 * Math.PI * t));
        break;
      case "hamming":
        result[i] = data[i] * (0.54 - 0.46 * Math.cos(2 * Math.PI * t));
        break;
      case "blackman":
        result[i] = data[i] * (0.42 - 0.5 * Math.cos(2 * Math.PI * t) + 0.08 * Math.cos(4 * Math.PI * t));
        break;
    }
  }
  return result;
}

export function computeMagnitudes(
  re: number[],
  im: number[],
  bandCount: number = 12,
  sampleRate: number = 44100
): number[] {
  const n = re.length;
  const nyquist = sampleRate / 2;
  const magnitudes = new Array(n / 2);

  for (let i = 0; i < n / 2; i++) {
    magnitudes[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]) / (n / 2);
  }

  const freqEnds = [
    40, 80, 160, 320, 640, 1280, 2560, 5120, 10240, 15000, 18000, 22000,
  ];

  const bands: number[] = [];
  let prevBin = 1;

  for (let b = 0; b < bandCount; b++) {
    const targetFreq = freqEnds[b];
    const binEnd = Math.min(Math.floor((targetFreq / nyquist) * (n / 2)), n / 2 - 1);
    let sum = 0;
    let count = 0;
    for (let k = prevBin; k <= binEnd; k++) {
      sum += magnitudes[k];
      count++;
    }
    bands.push(count > 0 ? sum / count : 0);
    prevBin = binEnd + 1;
  }

  const maxVal = bands.reduce((a, b) => Math.max(a, b), 0.001);
  return bands.map((v) => Math.min(1, Math.max(0, Math.log10(1 + v * 50) / Math.log10(1 + maxVal * 50))));
}

export function analyzeSamples(
  samples: Float32Array,
  bandCount: number = 12
): number[] {
  const padded = nextPowerOf2(samples.length);
  const buffer = new Float32Array(padded);
  buffer.set(samples.slice(0, Math.min(samples.length, padded)));

  const windowed = applyWindow(buffer, "hann");

  const re: number[] = Array.from(windowed);
  const im: number[] = new Array(padded).fill(0);

  fftComplex(re, im);
  return computeMagnitudes(re, im, bandCount);
}

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return Math.max(1024, Math.min(p, 8192));
}
