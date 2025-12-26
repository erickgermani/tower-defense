// Utility functions

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

export const norm = (x, y) => {
    const l = Math.hypot(x, y) || 1;
    return { x: x / l, y: y / l };
};
