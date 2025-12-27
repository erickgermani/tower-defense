// Enemy class

import { Point } from '../types.js';
import { EnemyType, EnemyConfig } from '../types.js';
import { enemyConfigs } from '../config.js';

export class Enemy {
    public x: number;
    public y: number;
    public wp: number = 1;
    public hp: number;
    public maxHp: number;
    // base speed without slow modifiers
    public baseSpeed: number;
    // slow stacks applied by slow tower (each -10% up to 5)
    public slowStacks: number = 0;
    public reward: number;
    public radius: number;
    public color: string;
    public name: string;
    public type: EnemyType;

    constructor(
        startPoint: Point,
        type: EnemyType,
        wave: number
    ) {
        const config = enemyConfigs[type];
        
        this.x = startPoint.x;
        this.y = startPoint.y;
        this.type = type;
        this.name = config.name;
        this.color = config.color;
        this.radius = config.radius;
        
        // Calculate stats based on wave
        this.maxHp = config.baseHp + wave * config.hpGrowth;
        this.hp = this.maxHp;
        this.baseSpeed = config.baseSpeed + wave * config.speedGrowth;
        // Slower reward progression: base + floor(wave/2) * rewardGrowth, minimum 1
        this.reward = Math.max(1, Math.floor(config.baseReward + Math.floor(wave / 2) * config.rewardGrowth));
    }

    public takeDamage(damage: number): void {
        this.hp -= damage;
    }

    // apply one slow stack (each -10%) up to 5 stacks
    public applySlow(): void {
        this.slowStacks = Math.min(5, this.slowStacks + 1);
    }

    // effective speed considering slow stacks
    public getSpeed(): number {
        return this.baseSpeed * Math.max(0.05, 1 - 0.1 * this.slowStacks);
    }

    public isDead(): boolean {
        return this.hp <= 0;
    }

    public getHealthPercentage(): number {
        return this.hp / this.maxHp;
    }
}
