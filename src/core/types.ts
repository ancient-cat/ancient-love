export type LoveDrawn = {
  draw: () => void;
};
export type LoveTicked = {
  update: (dt: number) => void;
};
export type LoveLifecycle = LoveDrawn & LoveTicked;

export type Milliseconds = number;
export type Seconds = number;
export type Minutes = number;
export type Hours = number;
