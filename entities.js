// Entity creation and management

import { state } from './state.js';
import { path } from './config.js';
import { enemyConfigForWave, towerConfig } from './config.js';
import { norm } from './utils.js';

export function spawnEnemy() {
    const cfg = enemyConfigForWave(state.wave);
    state.enemies.push({
        x: path[0].x,
        y: path[0].y,
        wp: 1,
        hp: cfg.hp,
        maxHp: cfg.hp,
        speed: cfg.speed,
        reward: cfg.reward,
        radius: 12
    });
    state.enemyAliveCount++;
}

export function addTower(x, y) {
    state.towers.push({
        x, y,
        range: towerConfig.range,
        cooldown: 0,
        fireInterval: 1 / towerConfig.fireRate,
        damage: towerConfig.damage
    });
}

export function fireProjectile(tower, target) {
    const d = norm(target.x - tower.x, target.y - tower.y);
    state.projectiles.push({
        x: tower.x,
        y: tower.y,
        vx: d.x * towerConfig.projectileSpeed,
        vy: d.y * towerConfig.projectileSpeed,
        damage: tower.damage,
        radius: 4,
        alive: true
    });
}
