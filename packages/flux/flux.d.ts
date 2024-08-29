export interface EasingFunction {
  (p: number): number;
}

export interface Easing {
  [key: string]: EasingFunction;
  linear: EasingFunction;
  quadin: EasingFunction;
  quadout: EasingFunction;
  quadinout: EasingFunction;
  cubicin: EasingFunction;
  cubicout: EasingFunction;
  cubicinout: EasingFunction;
  quartin: EasingFunction;
  quartout: EasingFunction;
  quartinout: EasingFunction;
  quintin: EasingFunction;
  quintout: EasingFunction;
  quintinout: EasingFunction;
  expoin: EasingFunction;
  expoout: EasingFunction;
  expoinout: EasingFunction;
  sinein: EasingFunction;
  sineout: EasingFunction;
  sineinout: EasingFunction;
  circin: EasingFunction;
  circout: EasingFunction;
  circinout: EasingFunction;
  backin: EasingFunction;
  backout: EasingFunction;
  backinout: EasingFunction;
  elasticin: EasingFunction;
  elasticout: EasingFunction;
  elasticinout: EasingFunction;
}

export interface Tween {
  obj: Record<string, any>;
  vars: Record<string, any>;
  rate: number;
  progress: number;
  _delay: number;
  _ease: string;
  _onstart?: () => void;
  _onupdate?: () => void;
  _oncomplete?: () => void;

  ease(this: Tween, ease: string): Tween;
  delay(this: Tween, delay: number): Tween;
  onstart(this: Tween, callback: () => void): Tween;
  onupdate(this: Tween, callback: () => void): Tween;
  oncomplete(this: Tween, callback: () => void): Tween;
  after(this: Tween, obj: any, time: number, vars: Record<string, any>): Tween;
  stop(this: Tween): void;
  init(this: Tween): void;
}

/** @noSelf */
export interface Flux {
  tweens: Tween[];
  easing: Easing;

  group(): Flux;
  to(this: void, obj: Record<string, any>, time: number, vars: Record<string, any>): Tween;
  update(ltatime: number): void;
  clear(obj: Record<string, any>, vars: Record<string, any>): void;
  add(tween: Tween): Tween;
  remove(x: number | Tween): Tween | undefined;
}
