// Game configuration

import { Point, TowerType, EnemyType, TowerConfig, EnemyConfig } from './types.js';

// Path waypoints that enemies follow
export const path: Point[] = [
    { x: 60, y: 270 },
    { x: 220, y: 270 },
    { x: 220, y: 120 },
    { x: 520, y: 120 },
    { x: 520, y: 420 },
    { x: 840, y: 420 },
];

// Tower configurations
export const towerConfigs: Record<TowerType, TowerConfig> = {
    [TowerType.BASIC]: {
        type: TowerType.BASIC,
        cost: 25,
        range: 140,
        fireRate: 1.2,
        damage: 14,
        projectileSpeed: 360,
        color: '#3d7a6a',
        name: 'Torre Básica'
    },
    [TowerType.SNIPER]: {
        type: TowerType.SNIPER,
        cost: 40,
        range: 220,
        fireRate: 0.6,
        damage: 35,
        projectileSpeed: 500,
        color: '#5a4d8a',
        name: 'Torre Sniper'
    },
    [TowerType.CANNON]: {
        type: TowerType.CANNON,
        cost: 35,
        range: 120,
        fireRate: 0.8,
        damage: 25,
        projectileSpeed: 280,
        color: '#8a5d3d',
        name: 'Torre Canhão'
    }
};

// Enemy configurations
export const enemyConfigs: Record<EnemyType, EnemyConfig> = {
    [EnemyType.BASIC]: {
        type: EnemyType.BASIC,
        baseHp: 40,
        hpGrowth: 10,
        baseSpeed: 60,
        speedGrowth: 3,
        baseReward: 8,
        rewardGrowth: 0.5,
        radius: 12,
        color: '#b85c5c',
        name: 'Inimigo Básico'
    },
    [EnemyType.FAST]: {
        type: EnemyType.FAST,
        baseHp: 25,
        hpGrowth: 6,
        baseSpeed: 100,
        speedGrowth: 5,
        baseReward: 12,
        rewardGrowth: 0.8,
        radius: 10,
        color: '#5cb8b8',
        name: 'Inimigo Rápido'
    },
    [EnemyType.TANK]: {
        type: EnemyType.TANK,
        baseHp: 80,
        hpGrowth: 20,
        baseSpeed: 40,
        speedGrowth: 2,
        baseReward: 15,
        rewardGrowth: 1,
        radius: 15,
        color: '#8a5c8a',
        name: 'Inimigo Tanque'
    }
};
