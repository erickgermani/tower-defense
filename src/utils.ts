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

/**
 * Distance from point (px,py) to segment (x1,y1)-(x2,y2)
 */
export function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const wx = px - x1;
    const wy = py - y1;
    const vv = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / vv));
    const projx = x1 + vx * t;
    const projy = y1 + vy * t;
    return dist(px, py, projx, projy);
}
