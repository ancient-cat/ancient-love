import type { AlignMode, ColouredText, Font, Text } from "love.graphics";

import { Box, point_intersection } from "../aabb";
import console from "../console";
import { create_signal, Signal } from "../signal";
import { GameTime } from "../systems/gametime";
import { ColorType, HSLAData } from "../color";
import { is_button, is_flex, is_grid, is_label, measure_text, text_content, to_coloured_text } from "./utils";
import type {
  OffsetBox,
  Button,
  ButtonOptions,
  Element,
  Label,
  LabelOptions,
  ProjectionData,
  Span,
  Styles,
  Theme,
  Vector2,
  Vector2Data,
  Vector3Data,
} from "./types";

export const create_ui = (container: OffsetBox) => {
  const DEBUG = false;
  let unit: number = 4;

  let theme: Theme = {
    panel: {
      color: new ColorType(90, 5, 40, 100),
      background: new ColorType(90, 5, 10, 100),
    },
    btn: {
      inactive: {
        color: new ColorType(90, 5, 50, 100),
        background: new ColorType(90, 5, 18, 100),
      },
      active: {
        color: new ColorType(90, 5, 30, 100),
        background: new ColorType(90, 5, 18, 100),
      },
      hover: {
        color: new ColorType(90, 5, 70, 100),
        background: new ColorType(90, 5, 30, 100),
      },
    },
  };
  let configuration: Styles = {
    unit,
    font: love.graphics.newFont(unit * 4, "normal", 2),
    root: {
      padding: {
        top: unit * 2,
        left: unit * 2,
        bottom: unit * 2,
        right: unit * 2,
      },
    },
    btn: {
      font: love.graphics.newFont(unit * 4, "normal", 2),
      padding: {
        top: unit * 2,
        left: unit * 4,
        bottom: unit * 2,
        right: unit * 4,
      },
      margin: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },
    },
  };

  type ElementMeasurement = readonly [width: number, height: number];

  let elements: Element[] = [];
  let buttons: Button[] = [];
  let scale: number = 1;

  let projection: Map<Button, Box> = new Map();

  const configure = (configuration: Styles) => {
    if (configuration.unit !== undefined) {
      unit = configuration.unit;
    }
  };

  const set_theme = (_theme: Theme) => {
    theme = _theme;
  };

  let transform_stack: (readonly [number, number])[] = [[0, 0]];

  const with_transform = ([x, y, scale]: readonly [x: number, y: number, scale?: number], fn: () => void) => {
    love.graphics.push();
    if (scale) {
      love.graphics.scale(scale, scale);
    }
    love.graphics.translate(x, y);
    transform_stack.push([x, y]);
    fn();
    love.graphics.pop();
    transform_stack.pop();
  };

  const draw = () => {
    transform_stack = [[0, 0]];
    love.graphics.setColor(0, 0, 0);
    let vertical: number = 0;
    let line_height: number = configuration.unit * 4;
    with_transform([configuration.root.padding.left ?? 0, configuration.root.padding.top ?? 0, scale], () => {
      elements.forEach((el, i) => {
        with_transform([0, 0], () => {
          if (is_button(el)) {
            const [w, h] = measure_button(el);
            const rhythm_align = unit - (vertical % configuration.unit);

            with_transform([0, vertical], () => {
              draw_button(el);
            });
            vertical += h + rhythm_align + i * line_height;
          } else if (is_label(el)) {
            draw_label(el);
          } else if (is_flex(el)) {
            console.log("TODO");
          } else if (is_grid(el)) {
            console.log("TODO");
          }
        });
      });
    });

    // use this to diagnose projections not aligning to their buttons
    if (DEBUG) {
      Array.from(projection.values()).forEach((data) => {
        love.graphics.setColor(100, 0, 0);
        love.graphics.rectangle("line", data.x, data.y, data.w, data.h);
      });
    }
  };

  const measure_button = (element: Button): readonly [number, number, Text] => {
    let [width, height] = [0, 0];
    const [text_w, text_h, text] = measure_text(element, configuration);
    width = text_w + (element.padding?.left ?? 0) + (element.padding?.right ?? 0);
    height = text_h + (element.padding?.top ?? 0) + (element.padding?.bottom ?? 0);

    return [width, height, text];
  };

  const record_projection = (el: Button, width: number, height: number) => {
    // add all the transform x and y's together into the final result
    const [x, y] = transform_stack.reduce<Vector2Data>(([px, py], [cx, cy]) => [px + cx, py + cy], [0, 0]);

    projection.set(el, { x: x * scale, y: y * scale, w: width * scale, h: height * scale });
  };

  const draw_button = (el: Button) => {
    const [btn_width, btn_height, text] = measure_button(el);
    record_projection(el, btn_width, btn_height);

    if (el.active) {
      love.graphics.setColor(...theme.btn.active.background.rgb);
    } else if (el.hover) {
      love.graphics.setColor(...theme.btn.hover.background.rgb);
    } else {
      love.graphics.setColor(...theme.btn.inactive.background.rgb);
    }

    love.graphics.rectangle("fill", el.position.x, el.position.y, btn_width, btn_height);

    if (theme.btn.inactive.border) {
      love.graphics.setColor(...theme.btn.inactive.border.rgb);
      love.graphics.rectangle("line", el.position.x, el.position.y, btn_width, btn_height);
    }

    if (el.active) {
      love.graphics.setColor(...theme.btn.active.color.rgb);
    } else if (el.hover) {
      love.graphics.setColor(...theme.btn.hover.color.rgb);
    } else {
      love.graphics.setColor(...theme.btn.inactive.color.rgb);
    }

    let content: string | ColouredText;
    if (typeof el.text === "string") {
      content = el.text;
    } else {
      content = to_coloured_text(el.text);
    }

    if (el.limit) {
      love.graphics.printf(
        content,
        el.position.x + (el.padding?.left ?? 0),
        el.position.y + (el.padding?.top ?? 0),
        el.limit,
        el.align
      );
    } else {
      love.graphics.print(content, el.position.x + (el.padding?.left ?? 0), el.position.y + (el.padding?.top ?? 0));
    }

    if (DEBUG) {
      // use this to debug the text dimensions of the text
      love.graphics.setColor(0, 255, 100);
      const [text_w, text_h] = measure_text(el, configuration);
      love.graphics.rectangle(
        "line",
        el.position.x + (el.padding?.left ?? 0) + (el.margin?.left ?? 0),
        el.position.y + (el.padding?.top ?? 0) + (el.margin?.top ?? 0),
        text_w,
        text_h
      );
    }
  };

  const draw_label = (el: Label) => {
    let [width, height] = [0, 0];
    const [text_w, text_h, text] = measure_text(el, configuration);
    width = text_w + (el.padding?.left ?? 0) + (el.padding?.right ?? 0);
    height = text_h + (el.padding?.top ?? 0) + (el.padding?.bottom ?? 0);

    if (typeof el.text === "string") {
      love.graphics.setColor(el.color?.rgb ?? theme.panel.color.rgb);
    }

    let content: string | ColouredText;
    if (typeof el.text === "string") {
      content = el.text;
    } else {
      content = to_coloured_text(el.text);
    }
    if (el.limit) {
      love.graphics.printf(
        content,
        el.position.x + (el.padding?.left ?? 0),
        el.position.y + (el.padding?.top ?? 0),
        el.limit,
        el.align
      );
    } else {
      love.graphics.print(content, el.position.x + (el.padding?.left ?? 0), el.position.y + (el.padding?.top ?? 0));
    }
  };

  const create_button = (options: ButtonOptions): Button => {
    const signal = create_signal("click");

    const default_options: Omit<Required<ButtonOptions>, "text" | "limit" | "id"> = {
      width: 0,
      height: 0,
      align: "center",
      position: {
        x: 0,
        y: 0,
      },
      padding: { ...configuration.btn.padding },
      margin: { ...configuration.btn.margin },
    };

    const btn: Button = {
      ...signal,
      ...default_options,
      ...options,
      disabled: false,
      type: "button",
      active: false,
      hover: false,
      text: options.text ?? "",
    };

    return btn;
  };

  const create_label = (options: LabelOptions): Label => {
    const default_options: Omit<Label, "text" | "limit"> = {
      type: "label",
      color: theme.panel.color,
      align: "left",
      position: {
        x: 0,
        y: 0,
      },
      padding: { ...configuration.btn.padding },
      margin: { ...configuration.btn.margin },
    };

    const [width, height] = measure_text(
      {
        text: options.text,
        limit: options.limit,
        position: options.position ?? default_options.position,
      } as Label,
      configuration
    );

    const label: Label = {
      ...default_options,
      ...options,
      text: options.text ?? "",
      type: "label",
      limit: options.limit,
    };

    return label;
  };

  const on_intersecting = (
    btn: Button,
    check: Vector2,
    intersecting: () => any | Promise<any>,
    not_intersecting?: CallableFunction
  ) => {
    if (btn.width !== undefined && btn.height !== undefined) {
      const projected_box = projection.get(btn);
      if (projected_box) {
        const is_intersecting = point_intersection(check, projected_box);

        if (is_intersecting) {
          intersecting();
        } else if (not_intersecting !== undefined) {
          not_intersecting();
        }
      }
    }
  };

  return {
    draw,
    configure,
    set_theme,
    create_button,
    create_label,
    scale: (new_scale: number) => {
      scale = new_scale;
    },
    add: (...elms: Element[]) => {
      elements.push(...elms);
      buttons = elements.filter((el): el is Button => is_button(el) && !el.disabled);
    },
    update(dt: number) {},

    mousereleased: (...click_params: Parameters<NonNullable<typeof love.mousereleased>>) => {
      console.log("click");
      const [x, y, button, is_touch, presses] = click_params;

      if (button !== 1) {
        return;
      }

      const mouse = { x, y };

      buttons.forEach((btn) => {
        on_intersecting(btn, mouse, async () => {
          btn.emit("click");
          btn.active = true;
          await GameTime.wait(50);
          btn.active = false;
        });
      });
    },

    mousepressed: (...click_params: Parameters<NonNullable<typeof love.mousepressed>>) => {
      const [x, y, button, is_touch, presses] = click_params;

      if (button !== 1) {
        return;
      }

      const mouse = { x, y };
      buttons.forEach(async (btn) => {
        on_intersecting(btn, mouse, () => {
          btn.active = true;
        });
      });
    },

    mousemoved: (...move_params: Parameters<NonNullable<typeof love.mousemoved>>) => {
      const [x, y, dx, dy, is_touch] = move_params;
      const mouse = { x, y };
      buttons.forEach(async (btn) => {
        on_intersecting(
          btn,
          mouse,
          () => (btn.hover = true),
          () => (btn.hover = false)
        );
      });
    },
  };
};
