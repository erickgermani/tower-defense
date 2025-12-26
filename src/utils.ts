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

/**
 * Validate tower placement at point (px,py).
 * Returns { valid, reason } where reason is 'path' | 'tower' | null.
 */
export function validatePlacement(px: number, py: number, towers: { x: number; y: number }[], path: { x: number; y: number }[], opts?: { pathThreshold?: number; towerThreshold?: number; }): { valid: boolean; reason: 'path' | 'tower' | null } {
    const pathThreshold = opts?.pathThreshold ?? 22;
    const towerThreshold = opts?.towerThreshold ?? 24;

    // check path
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        if (pointToSegmentDistance(px, py, p1.x, p1.y, p2.x, p2.y) < pathThreshold) {
            return { valid: false, reason: 'path' };
        }
    }

    // check towers
    for (const t of towers) {
        if (dist(px, py, t.x, t.y) < towerThreshold) {
            return { valid: false, reason: 'tower' };
        }
    }

    return { valid: true, reason: null };
}
