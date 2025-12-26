// Projectile class

import { TowerType } from '../types.js';
import { norm } from '../utils.js';

export class Projectile {
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public damage: number;
    public radius: number = 4;
    public alive: boolean = true;
    public color: string;
    public sourceType: TowerType;

    constructor(
        x: number,
        y: number,
        targetX: number,
        targetY: number,
        damage: number,
        speed: number,
        sourceType: TowerType
    ) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.sourceType = sourceType;

        // Calculate velocity based on direction to target
        const direction = norm(targetX - x, targetY - y);
        this.vx = direction.x * speed;
        this.vy = direction.y * speed;

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
        }
    }

    public update(dt: number): void {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    public isOffScreen(width: number, height: number): boolean {
        return this.x < -20 || this.x > width + 20 || 
               this.y < -20 || this.y > height + 20;
    }
}
