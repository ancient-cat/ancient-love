declare namespace Cam11 {
  export interface Camera {
    x: number;
    y: number;
    zoom: number;
    angle: number;
    vp: [number, number, number | false, number | false, number, number];
    xf: any; // Placeholder for the Love2D Transform object
    dirty: boolean;
    matdirty: boolean;
    invmatdirty: boolean;
    scissor: [number | false, number | false, number | false, number | false];
    mat: [number, number, number, number, number, number];
    invmat: [number, number, number, number, number, number];

    setDirty(dirty: boolean): void;
    attach(clip?: boolean): void;
    detach(): void;
    setPos(x: number, y: number): void;
    setZoom(zoom: number): void;
    setAngle(angle: number): void;
    setViewport(x: number, y: number, w: number | false, h: number | false, cx: number, cy: number): void;
    toScreen(x: number, y: number): [number, number];
    toWorld(x: number, y: number): [number, number];
    getTransform(): any; // Placeholder for the Love2D Transform object
    getPos(): [number, number];
    getX(): number;
    getY(): number;
    getZoom(): number;
    getAngle(): number;
    getViewport(): [number, number, number | false, number | false, number, number];
    getVPTopLeft(): [number, number];
    getVPBottomRight(): [number, number];
    getVPFocusPoint(): [number, number];
  }

  export type CameraFactory = (
    this: void,
    x?: number,
    y?: number,
    zoom?: number,
    angle?: number,
    vpx?: number,
    vpy?: number,
    vpw?: number | false,
    vph?: number | false,
    cx?: number,
    cy?: number
  ) => Cam11.Camera;
}

declare module "cam11" {
  export type Camera = Cam11.Camera;

  export const create_camera: Cam11.CameraFactory;
}
