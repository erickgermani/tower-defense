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
        cost: 30,
        range: 140,
        fireRate: 1.2,
        damage: 20,
        projectileSpeed: 320,
        color: '#3d7a6a',
        name: 'Mago',
        fov: Math.PI * 1.5 // 270° field of view
    },
    [TowerType.SNIPER]: {
        type: TowerType.SNIPER,
        cost: 45,
        range: 220,
        fireRate: 0.6,
        damage: 50,
        projectileSpeed: 480,
        color: '#5a4d8a',
        name: 'Patrulheiro',
        fov: Math.PI * 0.6 // ~108° narrow FOV
    },
    [TowerType.CANNON]: {
        type: TowerType.CANNON,
        cost: 150,
        range: 120,
        fireRate: 0.8,
        damage: 80,
        projectileSpeed: 240,
        color: '#8a5d3d',
        name: 'Bruxo',
        fov: Math.PI * 1.2 // ~216°
    },
    [TowerType.SLOW]: {
        type: TowerType.SLOW,
        cost: 35,
        range: 130,
        fireRate: 0.9,
        damage: 20,
        projectileSpeed: 260,
        color: '#7ad1f5',
        name: 'Gelo',
        fov: Math.PI * 1.5
    }
};

// Enemy configurations
export const enemyConfigs: Record<EnemyType, EnemyConfig> = {
    [EnemyType.BASIC]: {
        type: EnemyType.BASIC,
        baseHp: 20,
        hpGrowth: 4,
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
        hpGrowth: 6,
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
        hpGrowth: 28,
        baseSpeed: 12,
        speedGrowth: 1, // reduced growth
        baseReward: 3, // a bit more for tank but still low
        rewardGrowth: 1,
        radius: 15,
        color: '#00ff40',
        name: 'Orc'
    }
};
