export type Point = {
    x: number;
    y: number;
};

export type Box = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export type AABB = {
    x: number;
    y: number;
    dx: number;
    dy: number;
};

export const aabb = (box: Box): AABB => {
    return {
        x: box.x,
        y: box.y,
        dx: box.x + box.w,
        dy: box.y + box.h,
    };
};
export const single_axis_bounds = (
    start: number,
    size: number
): readonly [start: number, end: number] => {
    return [start, start + size];
};

export const point_intersection = (point: Point, box: Box) => {
    const [left, right] = single_axis_bounds(box.x, box.w);
    const x_outside = point.x < left || point.x > right;

    // short circuit
    if (x_outside) {
        return false;
    }

    const [top, bottom] = single_axis_bounds(box.y, box.h);
    const y_outside = point.y < top || point.y > bottom;

    return !x_outside && !y_outside;
};
export const point_outersection = (point: Point, box: Box) => {
    return !point_intersection(point, box);
};

export const box_outersection = (box1: Box, box2: Box) => {
    const [b1_left, b1_right] = single_axis_bounds(box1.x, box1.w);
    const [b2_left, b2_right] = single_axis_bounds(box2.x, box2.w);

    const x_outside = b1_right < b2_left || b1_left > b2_right;

    if (x_outside) {
        return true;
    }

    const [b1_top, b1_bottom] = single_axis_bounds(box1.y, box1.h);
    const [b2_top, b2_bottom] = single_axis_bounds(box2.y, box2.h);

    const y_outside = b1_bottom < b2_top || b2_bottom < b1_top;

    return y_outside || x_outside;
};

export const box_intersection = (box1: Box, box2: Box) => {
    return !box_outersection(box1, box2);
};
