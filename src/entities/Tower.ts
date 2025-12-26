// Tower class

import { TowerType } from '../types.js';
import { towerConfigs } from '../config.js';
import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';
import { dist } from '../utils.js';

export class Tower {
    public x: number;
    public y: number;
    public type: TowerType;
    // angle in radians the barrel is pointing to (0 = right)
    public angle: number = 0;
    public level: number = 0;
    public upgradesSpent: number = 0;
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

    /**
     * Compute the upgrade cost for next level
     */
    public getUpgradeCost(): number {
        // simple scaling: base * 0.6 * (level+1)
        if (this.level >= 5) return Infinity;
        return Math.max(5, Math.round(this.cost * 0.6 * (this.level + 1)));
    }

    /**
     * Attempt to upgrade this tower: apply stat increases and record spent.
     * Returns true if upgraded.
     */
    public upgrade(): number {
        const c = this.getUpgradeCost();
        if (!isFinite(c)) return 0;
        // apply increases
        this.level += 1;
        this.upgradesSpent += c;
        // increase damage and range, speed up fire rate
        this.damage = Math.round(this.damage * 1.2);
        this.range = Math.round(this.range * 1.12);
        this.fireInterval = Math.max(0.05, this.fireInterval * 0.92);
        return c;
    }

    /** Sell returns how much money it gives when sold (75% of base cost + upgrades) */
    public getSellValue(): number {
        return Math.floor((this.cost + this.upgradesSpent) * 0.75);
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
        // point barrel toward target when firing
        this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        return new Projectile(
            this.x,
            this.y,
            target,
            this.damage,
            this.projectileSpeed,
            this.type
        );
    }
}
