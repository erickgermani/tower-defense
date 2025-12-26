// Tower class

import { TowerType, TowerConfig } from '../types.js';
import { towerConfigs } from '../config.js';
import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';
import { dist } from '../utils.js';

export class Tower {
    public x: number;
    public y: number;
    public type: TowerType;
    public range: number;
    public cooldown: number = 0;
    public fireInterval: number;
    public damage: number;
    public projectileSpeed: number;
    public color: string;
    public name: string;
    public cost: number;

    constructor(x: number, y: number, type: TowerType) {
        const config = towerConfigs[type];
        
        this.x = x;
        this.y = y;
        this.type = type;
        this.name = config.name;
        this.color = config.color;
        this.cost = config.cost;
        this.range = config.range;
        this.fireInterval = 1 / config.fireRate;
        this.damage = config.damage;
        this.projectileSpeed = config.projectileSpeed;
    }

    public update(dt: number): void {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
        }
    }

    public canFire(): boolean {
        return this.cooldown <= 0;
    }

    public findTarget(enemies: Enemy[]): Enemy | null {
        let best: Enemy | null = null;
        let bestD = Infinity;

        for (const enemy of enemies) {
            const d = dist(this.x, this.y, enemy.x, enemy.y);
            if (d <= this.range && d < bestD) {
                best = enemy;
                bestD = d;
            }
        }

        return best;
    }

    public fire(target: Enemy): Projectile {
        this.cooldown = this.fireInterval;
        return new Projectile(
            this.x,
            this.y,
            target.x,
            target.y,
            this.damage,
            this.projectileSpeed,
            this.type
        );
    }
}
