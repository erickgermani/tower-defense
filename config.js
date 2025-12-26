// Game configuration

// Path waypoints that enemies follow
export const path = [
    { x: 60, y: 270 },
    { x: 220, y: 270 },
    { x: 220, y: 120 },
    { x: 520, y: 120 },
    { x: 520, y: 420 },
    { x: 840, y: 420 },
];

// Tower cost and configuration
export const TowerCost = 25;
export const towerConfig = {
    range: 140,
    fireRate: 1.2,      // tiros por segundo
    damage: 14,
    projectileSpeed: 360
};

// Enemy configuration based on wave number
export function enemyConfigForWave(wave) {
    const baseHp = 40 + wave * 10;
    const baseSpeed = 60 + wave * 3;
    const reward = 8 + Math.floor(wave / 2);
    return { hp: baseHp, speed: baseSpeed, reward };
}
