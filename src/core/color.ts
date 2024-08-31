import { Byte, Degree, NormalizedInt, NormalizedNumber, Percentage } from "./common";

export type HSLData = [h: Degree, s: Percentage, l: Percentage, a?: NormalizedInt];
export type HSLAData = [h: Degree, s: Percentage, l: Percentage, a: NormalizedInt];

/**
 * Represents color via red, blue, green and alpha values between 0—255
 */
export type RGBData = [r: Byte, g: Byte, b: Byte, a?: number];
export type RGBAData = [r: Byte, g: Byte, b: Byte, a: number];
export type LoveRGB = [r: Percentage, g: Percentage, b: Percentage, a: Percentage];

/**
 * A color data type that is serializable, tween-able, and usable with `love.graphics`
 *
 * @example
 * ```ts
 * const my_color: ColorType = create(100, 0, 0);
 * love.graphics.setColor(...my_color.rgb);
 * ```
 */
export interface IColorType {
  h: Degree;
  s: NormalizedInt;
  l: NormalizedInt;
  a: NormalizedInt;
  get rgb(): LoveRGB;
  get hsl(): HSLData;
  get copy(): ColorType;
  get data(): HSLAData;
}

export interface IColorAdjustment {
  lighten(amount: NormalizedInt): ColorType;
  darken(amount: NormalizedInt): ColorType;
  rotate(amount: Degree): ColorType;
  saturate(amount: NormalizedInt): ColorType;
}

export class ColorType implements IColorType, IColorAdjustment {
  constructor(
    public h: Degree = 0,
    public s: NormalizedInt = 0,
    public l: NormalizedInt = 0,
    public a: NormalizedInt = 100
  ) {}
  get data(): HSLAData {
    return <HSLAData>[this.h, this.s, this.l, this.a ?? 100];
  }

  get rgb(): LoveRGB {
    return hslaToLove(this.hsl);
  }
  get hsl(): HSLData {
    return <HSLData>[this.h, this.s, this.l, this.a];
  }
  get copy(): ColorType {
    return new ColorType(this.h, this.s, this.l, this.a);
  }

  lighten(amount: NormalizedInt): ColorType {
    this.l += amount;
    return this;
  }
  darken(amount: NormalizedInt): ColorType {
    this.l -= amount;
    return this;
  }
  rotate(amount: Degree): ColorType {
    this.h += amount;
    return this;
  }

  saturate(amount: NormalizedInt) {
    this.s += amount;
    return this;
  }
}
export const random = (): ColorType => {
  const h = randomHue();
  const s = randomSaturation();
  const l = randomLuminosity();
  return new ColorType();
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

export const hslaToRgb = (input: HSLData): RGBData => {
  let [h, s, l, a = 1] = input;
  h /= 360;
  s /= 100;
  l /= 100;
  a /= 100;

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

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
};

export const hslaToLove = (input: HSLData): LoveRGB => {
  let [h, s, l, a = 1] = input;
  h /= 360;
  s /= 100;
  l /= 100;
  a /= 100;

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

  return [r, g, b, a];
};
