// Type definitions

export interface Point {
    x: number;
    y: number;
}

export interface Vector {
    x: number;
    y: number;
}

export enum TowerType {
    BASIC = 'basic',
    SNIPER = 'sniper',
    CANNON = 'cannon'
}

export enum EnemyType {
    BASIC = 'basic',
    FAST = 'fast',
    TANK = 'tank'
}

export interface TowerConfig {
    type: TowerType;
    cost: number;
    range: number;
    fireRate: number;
    damage: number;
    projectileSpeed: number;
    color: string;
    name: string;
}

export interface EnemyConfig {
    type: EnemyType;
    baseHp: number;
    hpGrowth: number;
    baseSpeed: number;
    speedGrowth: number;
    baseReward: number;
    rewardGrowth: number;
    radius: number;
    color: string;
    name: string;
}

export interface GameState {
    money: number;
    lives: number;
    wave: number;
    inWave: boolean;
    wavePlan: WavePlan | null;
    waveSpawnTimer: number;
    waveRemaining: number;
    gameOver: boolean;
}

export interface WavePlan {
    interval: number;
    enemyTypes: EnemyType[];
}
