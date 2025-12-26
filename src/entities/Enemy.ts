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
    public speed: number;
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
        this.speed = config.baseSpeed + wave * config.speedGrowth;
        this.reward = Math.floor(config.baseReward + wave * config.rewardGrowth);
    }

    public takeDamage(damage: number): void {
        this.hp -= damage;
    }

    public isDead(): boolean {
        return this.hp <= 0;
    }

    public getHealthPercentage(): number {
        return this.hp / this.maxHp;
    }
}
