import type { ColouredText, Text } from "love.graphics";
import type { Button, Element, Flex, Grid, Label, Span, Styles } from "./types";
import console from "../console";

export const text_content = (element: Label | Button) => {
  return typeof element.text === "string" ? element.text : element.text.reduce<string>((p, t) => p + t.text, "");
};

export const to_coloured_text = (input: Span[]): ColouredText => {
  return input.map((t) => [t.color.rgb, t.text]).flat();
};

export const measure_text = (
  element: Label | Button,
  config: Styles
): readonly [width: number, height: number, drawable: Text] => {
  const text: Text = love.graphics.newText(config.btn.font);

  const content = text_content(element);

  if (element.limit) {
    text.setf(content, element.limit, element.align);
  } else {
    text.set(content);
  }

  const [width, height] = text.getDimensions();

  return [width, height, text];
};

export const is_label = (el: Omit<Element, "children">): el is Label => {
  return el.type === "label";
};

export const is_button = (el: Element): el is Button => {
  return el.type === "button";
};

export const is_flex = (el: Element): el is Flex => {
  return el.type === "flex";
};

export const is_grid = (el: Element): el is Grid => {
  return el.type === "grid";
};
