// Game configuration

import { Point, TowerType, EnemyType, TowerConfig, EnemyConfig } from './types.js';

// Path waypoints that enemies follow
export const path: Point[] = [
    // Longer, more twisty path to increase difficulty
    { x: 40, y: 60 },
    { x: 40, y: 300 },
    { x: 180, y: 300 },
    { x: 180, y: 120 },
    { x: 360, y: 120 },
    { x: 360, y: 420 },
    { x: 540, y: 420 },
    { x: 540, y: 180 },
    { x: 720, y: 180 },
    { x: 720, y: 480 },
    { x: 860, y: 480 }
];

// Tower configurations
export const towerConfigs: Record<TowerType, TowerConfig> = {
    [TowerType.BASIC]: {
        type: TowerType.BASIC,
        cost: 30,
        range: 140,
        fireRate: 1.2,
        damage: 20,
        projectileSpeed: 320,
        color: '#3d7a6a',
        name: 'Mago'
    },
    [TowerType.SNIPER]: {
        type: TowerType.SNIPER,
        cost: 90,
        range: 220,
        fireRate: 0.6,
        damage: 70,
        projectileSpeed: 480,
        color: '#5a4d8a',
        name: 'Patrulheiro'
    },
    [TowerType.CANNON]: {
        type: TowerType.CANNON,
        cost: 150,
        range: 120,
        fireRate: 0.4,
        damage: 50,
        projectileSpeed: 200,
        color: '#8a5d3d',
        name: 'Bruxo'
    },
    [TowerType.SLOW]: {
        type: TowerType.SLOW,
        cost: 80,
        range: 130,
        fireRate: 0.9,
        damage: 20,
        projectileSpeed: 260,
        color: '#7ad1f5',
        name: 'Druida'
    }
};

// Enemy configurations
export const enemyConfigs: Record<EnemyType, EnemyConfig> = {
    [EnemyType.BASIC]: {
        type: EnemyType.BASIC,
        baseHp: 20,
        hpGrowth: 15,
        baseSpeed: 25,
        speedGrowth: 2, // reduced growth
        baseReward: 2, // lower base reward
        rewardGrowth: 0.5, // slower reward scaling
        radius: 12,
        color: '#e39595',
        name: 'Humano'
    },
    [EnemyType.FAST]: {
        type: EnemyType.FAST,
        baseHp: 20,
        hpGrowth: 18,
        baseSpeed: 40,
        speedGrowth: 3, // reduced growth
        baseReward: 2, // lower base reward
        rewardGrowth: 0.6, // slower reward scaling
        radius: 10,
        color: '#3c5151',
        name: 'Elfo Escuro'
    },
    [EnemyType.TANK]: {
        type: EnemyType.TANK,
        baseHp: 45,
        hpGrowth: 30,
        baseSpeed: 12,
        speedGrowth: 1, // reduced growth
        baseReward: 3, // a bit more for tank but still low
        rewardGrowth: 1,
        radius: 15,
        color: '#00ff40',
        name: 'Orc'
    },
    [EnemyType.FLYER]: {
        type: EnemyType.FLYER,
        baseHp: 30,
        hpGrowth: 20,
        baseSpeed: 30,
        speedGrowth: 2, // reduced growth
        baseReward: 2, // lower base reward
        rewardGrowth: 0.5, // slower reward scaling
        radius: 11,
        color: '#ffd700',
        name: 'Draconato'
    }
};
