// Projectile class

import { TowerType } from '../types.js';
import { norm } from '../utils.js';
import { Enemy } from './Enemy.js';

export class Projectile {
    public x: number;
    public y: number;
    public vx: number = 0;
    public vy: number = 0;
    public damage: number;
    public radius: number = 4;
    public alive: boolean = true;
    public color: string;
    public sourceType: TowerType;
    public speed: number;
    public target: Enemy | null;

    constructor(
        x: number,
        y: number,
        target: Enemy | null,
        damage: number,
        speed: number,
        sourceType: TowerType
    ) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.sourceType = sourceType;
        this.speed = speed;
        this.target = target;

        // Set color based on tower type
        switch (sourceType) {
            case TowerType.BASIC:
                this.color = '#f5d17a';
                break;
            case TowerType.SNIPER:
                this.color = '#b8a5f5';
                break;
            case TowerType.CANNON:
                this.color = '#f5a57a';
                break;
            case TowerType.SLOW:
                this.color = '#7ad1f5';
                break;
            default:
                this.color = '#ffffff';
        }

        // initial velocity towards current target position (if exists)
        if (this.target) {
            const direction = norm(this.target.x - x, this.target.y - y);
            this.vx = direction.x * this.speed;
            this.vy = direction.y * this.speed;
        }
    }

    public update(dt: number): void {
        if (this.target) {
            // home toward target's current position so hit is reliable
            const direction = norm(this.target.x - this.x, this.target.y - this.y);
            this.vx = direction.x * this.speed;
            this.vy = direction.y * this.speed;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    public isOffScreen(width: number, height: number): boolean {
        return this.x < -20 || this.x > width + 20 ||
               this.y < -20 || this.y > height + 20;
    }
}
