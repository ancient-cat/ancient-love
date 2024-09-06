import { AlignMode, Font } from "love.graphics";
import { ColorType } from "../color";
import { Signal } from "../signal";

export type Vector2 = {
  x: number;
  y: number;
};

export type Vector2Data = [x: number, y: number];
export type Vector3Data = [x: number, y: number, z: number];
export type ProjectionData = [x: number, y: number, w: number, h: number];

export type OffsetBox = {
  top: number;
  bottom: number;
  right: number;
  left: number;
};

export type ElementType = "grid" | "button" | "flex" | "label" | "div";

export interface Element {
  type: ElementType;
  position: Vector2;
  padding?: OffsetBox;
  margin?: OffsetBox;
}

export type Grid = Element & {
  type: "grid";
  gap: number;
};

export type Flex = Element & {
  type: "flex";
  gap: number;
  wrap: boolean;
};

export type Span = {
  text: string;
  color: ColorType;
};

export type Label = Element & {
  type: "label";
  text: string | Span[];
  color?: ColorType;
  limit?: number;
  align: AlignMode;
};

export type Button = Element &
  Omit<Label, "type" | "color"> & {
    type: "button";
    id?: unknown;
    height?: number;
    width?: number;
    hover: boolean;
    active: boolean;
    disabled: boolean;
  } & Signal<"click">;

export type Elements = Grid | Button | Flex | Label;

export type ButtonOptions = Partial<
  Omit<Button, keyof Signal<"click"> | "type" | "active" | "hover" | "text" | "disabled">
> & {
  text: string | Span[];
};
export type LabelOptions = Partial<Omit<Label, "type" | "text">> & { text: string | Span[] };

export type ThemeComponent = {
  color: ColorType;
  border?: ColorType;
  background: ColorType;
};

export type Theme = {
  panel: ThemeComponent;
  btn: {
    inactive: ThemeComponent;
    active: ThemeComponent;
    hover: ThemeComponent;
  };
};

export type Styles = {
  unit: number;
  font: Font;
  root: {
    /** Helps create a visual "safe-area"  */
    padding: OffsetBox;
  };
  btn: {
    font: Font;
    padding: OffsetBox;
    margin: OffsetBox;
  };
};
