import { Byte, Degree, NormalizedNumber, Percentage } from "./common";

export type HSLData = [h: Degree, s: NormalizedNumber, l: NormalizedNumber, a?: NormalizedNumber];

/**
 * Represents color via red, blue, green and alpha values between 0—255
 */
export type RGBData = [r: Byte, g: Byte, b: Byte, a?: Byte];
export type ColorData = {
  r: NormalizedNumber;
  g: NormalizedNumber;
  b: NormalizedNumber;
};

export const ColorData = {
  create: (): ColorData => {
    return {};
  },
};

export const HSL = {
  create: (h: number, s: number, l: number, a?: number = 1): HSLData => {
    return [h, s, l, a ?? 1];
  },

  from: (...values: RGBData): HSLData => {
    return hslaToRgb(values);
  },
};

export const randomSaturation = (floor: number = 0, ceiling = 100): Percentage => {
  return math.random(ceiling, floor);
};
export const randomLuminosity = (floor: number = 0, ceiling = 100): Percentage => {
  return math.random(ceiling, floor);
};
export const randomHue = (floor: number = 0, ceiling = 360): Degree => {
  return math.random(ceiling, floor);
};

/**
 * This calculates an HSL's relative luminance within linear RGB color space
 */
export const calculateRelativeLuminance = (color: HSL): NormalizedNumber => {
  const [r, g, b] = hslaToRgb(color.toData());

  const RED_COEFFICIENT = 0.2126;
  const GREEN_COEFFICIENT = 0.7152;
  const BLUE_COEFFICIENT = 0.0722;

  const relativeLuminance = RED_COEFFICIENT * (r / 255) + GREEN_COEFFICIENT * (g / 255) + BLUE_COEFFICIENT * (b / 255);

  return relativeLuminance;
};

/**
 * Calculates and returns the contrast ratio between two colors' relative luminance
 * @param relativeLuminanceA The relative luminance of a color
 * @param relativeLuminanceB The relative luminance of a second color
 * @returns
 */
export const calculateContrastRatio = (colorA: HSL, colorB: HSL): number => {
  const relativeLuminanceA: NormalizedNumber = calculateRelativeLuminance(colorA);
  const relativeLuminanceB: NormalizedNumber = calculateRelativeLuminance(colorB);

  const minimumContrast = 0.05; // Constant for avoiding division by zero

  const contrastRatio =
    (Math.max(relativeLuminanceA, relativeLuminanceB) + minimumContrast) /
    (Math.min(relativeLuminanceA, relativeLuminanceB) + minimumContrast);

  return contrastRatio;
};

export const hslaToRgb = (input: HSLData): RGBData => {
  let [h, s, l] = input;
  h /= 360;
  s /= 100;
  l /= 100;

  let r: Byte;
  let g: Byte;
  let b: Byte;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
