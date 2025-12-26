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
        name: 'Mago'
    },
    [TowerType.SNIPER]: {
        type: TowerType.SNIPER,
        cost: 40,
        range: 220,
        fireRate: 0.6,
        damage: 35,
        projectileSpeed: 500,
        color: '#5a4d8a',
        name: 'Patrulheiro'
    },
    [TowerType.CANNON]: {
        type: TowerType.CANNON,
        cost: 35,
        range: 120,
        fireRate: 0.8,
        damage: 25,
        projectileSpeed: 280,
        color: '#8a5d3d',
        name: 'Bruxo'
    }
};

// Enemy configurations
export const enemyConfigs: Record<EnemyType, EnemyConfig> = {
    [EnemyType.BASIC]: {
        type: EnemyType.BASIC,
        baseHp: 14,
        hpGrowth: 2,
        baseSpeed: 40,
        speedGrowth: 4,
        baseReward: 4,
        rewardGrowth: 1,
        radius: 12,
        color: '#e39595',
        name: 'Humano'
    },
    [EnemyType.FAST]: {
        type: EnemyType.FAST,
        baseHp: 12,
        hpGrowth: 4,
        baseSpeed: 70,
        speedGrowth: 8,
        baseReward: 4,
        rewardGrowth: 1,
        radius: 10,
        color: '#3c5151',
        name: 'Elfo Escuro'
    },
    [EnemyType.TANK]: {
        type: EnemyType.TANK,
        baseHp: 30,
        hpGrowth: 20,
        baseSpeed: 25,
        speedGrowth: 2,
        baseReward: 5,
        rewardGrowth: 1.2,
        radius: 15,
        color: '#00ff40',
        name: 'Orc'
    }
};
