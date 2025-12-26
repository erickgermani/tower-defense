// Utility functions

import { Vector } from './types.js';

export function clamp(v: number, a: number, b: number): number {
    return Math.max(a, Math.min(b, v));
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
    return Math.hypot(ax - bx, ay - by);
}

export function norm(x: number, y: number): Vector {
    const l = Math.hypot(x, y) || 1;
    return { x: x / l, y: y / l };
}
