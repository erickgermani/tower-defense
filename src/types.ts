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
    CANNON = 'cannon',
    SLOW = 'slow'
}

export enum EnemyType {
    BASIC = 'basic',
    FAST = 'fast',
    TANK = 'tank',
    FLYER = 'flyer',

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
    // field-of-view removed: towers always rotate to face targets
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
    // runtime spawn queues built by WaveManager
    spawnQueue?: EnemyType[];
    bossQueue?: EnemyType[];
}

export interface WaveEnemySpec {
    type: EnemyType;
    count: number;
    boss?: boolean;
}

export interface WavePlan {
    interval: number;
    enemies: WaveEnemySpec[];
    mode: 'interleave' | 'sequential';
}
