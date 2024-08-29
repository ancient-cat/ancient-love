import console from "../console";
import { Scenes } from "../scene";
import { flux, Tween } from "flux";
import { create_camera, type Camera } from "cam11";

// Setting love handlers before initialize will make it a "global" handler
// Global handlers will be called in-addition-to the Scene handlers

export default Scenes.create(() => {
  let [w, h] = love.graphics.getDimensions();
  const camera: Camera = create_camera(0, 0, 1, 0, 0, 0, false, false, 0.25, 0.25);
  const [max_rows, max_cols, grid_size] = [10, 10, 40];

  const camera_pos = {
    x: 0,
    y: 0,
    zoom: 1,
  };

  let camera_movement: Tween | undefined = undefined;

  let first_draw: boolean = true;
  const map = {
    draw: () => {
      love.graphics.setColor(0.4, 0.2, 0.2, 0.5);
      love.graphics.print("Map", 2, -20);

      const max_w = grid_size * max_rows;
      const max_h = grid_size * max_cols;
      for (let row_index = 0; row_index <= max_rows; row_index++) {
        const y = row_index * grid_size;
        love.graphics.line(0, y, max_w, y); // Draw horizontal line
        if (first_draw) {
          console.log(`row ${row_index} => x: ${0} y: ${y} dx: ${max_w} dy: ${y}`);
        }
      }

      for (let col_index = 0; col_index <= max_cols; col_index++) {
        const x = col_index * grid_size;
        love.graphics.line(x, 0, x, max_h); // Draw vertical line
        if (first_draw) {
          console.log(`col ${col_index} => x: ${x} y: ${0} dx: ${x} dy: ${max_h}`);
        }
      }
      if (first_draw) {
        first_draw = false;
      }
    },
  };

  return {
    name: "camera_test",
    state: undefined,
    enter: () => {},
    update: (dt) => {},
    keypressed: (key) => {
      const pressed = {
        up: key === "up",
        down: key === "down",
        left: key === "left",
        right: key === "right",
        z: key === "z",
        x: key === "x",
        space: key === "space",
      };

      let change: typeof camera_pos = {
        x: camera_pos.x,
        y: camera_pos.y,
        zoom: camera_pos.zoom,
      };

      const amount = grid_size;

      if (pressed.space) {
        change.x = 0;
        change.y = 0;
        change.zoom = 1;
      } else {
        if (pressed.up) {
          change.y += amount;
        } else if (pressed.down) {
          change.y -= amount;
        }

        if (pressed.left) {
          change.x += amount;
        } else if (pressed.right) {
          change.x -= amount;
        }

        if (pressed.z) {
          change.zoom += 0.25;
        } else if (pressed.x) {
          change.zoom -= 0.25;
        }
      }

      if (pressed.space || camera_pos.y !== change.y || camera_pos.x !== change.x || camera_pos.zoom !== change.zoom) {
        if (camera_movement !== undefined) {
          camera_movement.stop();
        }
        camera_movement = flux.to(camera_pos, 0.25, change);
        camera_movement.onupdate(() => {
          console.log(`Moving camera to ${camera_pos.x}, ${camera_pos.y}`);
          camera.setPos(camera_pos.x, camera_pos.y);
          camera.setZoom(camera_pos.zoom);
        });
      }
    },
    draw: () => {
      love.graphics.setBackgroundColor(0.86, 0.86, 0.89);

      love.graphics.setColor(0.1, 0.15, 0.2, 1);
      love.graphics.print("Use arrow keys to move the map", 20, 10);
      love.graphics.print("Use Z to zoom in, X to zoom out", 20, 24);
      love.graphics.print("Use SPACE to reset", 20, 38);

      camera.attach(false);

      map.draw();
      camera.detach();
    },
  };
});
