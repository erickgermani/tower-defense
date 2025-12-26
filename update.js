// Game update logic

import { state } from './state.js';
import { path } from './config.js';
import { spawnEnemy, fireProjectile } from './entities.js';
import { dist, norm } from './utils.js';

export function update(dt) {
    if (state.gameOver) return;

    // spawn de wave
    if (state.inWave && state.waveRemaining > 0) {
        state.waveSpawnTimer -= dt;
        if (state.waveSpawnTimer <= 0) {
            spawnEnemy();
            state.waveRemaining--;
            state.waveSpawnTimer += state.wavePlan.interval;
        }
    }

    // inimigos: seguir waypoints
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const en = state.enemies[i];
        const wp = path[en.wp];
        const d = norm(wp.x - en.x, wp.y - en.y);

        en.x += d.x * en.speed * dt;
        en.y += d.y * en.speed * dt;

        if (dist(en.x, en.y, wp.x, wp.y) < 8) {
            en.wp++;
            if (en.wp >= path.length) {
                // chegou ao fim
                state.enemies.splice(i, 1);
                state.enemyAliveCount--;
                state.lives--;
                if (state.lives <= 0) state.gameOver = true;
            }
        }
    }

    // torres: cooldown + adquirir alvo + atirar
    for (const t of state.towers) {
        t.cooldown -= dt;
        if (t.cooldown > 0) continue;

        // alvo: mais próximo dentro do alcance
        let best = null;
        let bestD = Infinity;

        for (const en of state.enemies) {
            const d = dist(t.x, t.y, en.x, en.y);
            if (d <= t.range && d < bestD) {
                best = en;
                bestD = d;
            }
        }

        if (best) {
            fireProjectile(t, best);
            t.cooldown = t.fireInterval;
        }
    }

    // projéteis: mover e colidir
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const p = state.projectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // fora da tela
        const canvas = document.getElementById("c");
        if (p.x < -20 || p.x > canvas.width + 20 || p.y < -20 || p.y > canvas.height + 20) {
            state.projectiles.splice(i, 1);
            continue;
        }

        // colisão simples com inimigos
        let hitIndex = -1;
        for (let j = 0; j < state.enemies.length; j++) {
            const en = state.enemies[j];
            if (dist(p.x, p.y, en.x, en.y) <= p.radius + en.radius) {
                hitIndex = j;
                break;
            }
        }

        if (hitIndex >= 0) {
            const en = state.enemies[hitIndex];
            en.hp -= p.damage;

            // remove projétil
            state.projectiles.splice(i, 1);

            if (en.hp <= 0) {
                state.money += en.reward;
                state.enemies.splice(hitIndex, 1);
                state.enemyAliveCount--;
            }
        }
    }

    // fim de wave: quando não há mais pra spawnar e não há inimigos vivos
    if (state.inWave && state.waveRemaining === 0 && state.enemyAliveCount === 0) {
        state.inWave = false;
        state.wavePlan = null;
        const nextWaveBtn = document.getElementById("nextWave");
        nextWaveBtn.disabled = false;
        // bônus simples por concluir wave
        state.money += 10;
    }
}
