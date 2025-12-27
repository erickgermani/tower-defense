// Game update logic

import { State } from './state.js';
import { path } from './config.js';
import { Enemy } from './entities/Enemy.js';
import { Projectile } from './entities/Projectile.js';
import { dist, norm } from './utils.js';
import { WaveManager } from './wave.js';
import { TowerType } from './types.js';

export class GameUpdater {
    private state: State;
    private waveManager: WaveManager;
    // counter to cycle through wavePlan.enemyTypes when spawning
    private spawnCounter: number = 0;
    // remember last wave number so we can reset spawnCounter at wave start
    private lastWave: number = 0;

    constructor(waveManager: WaveManager) {
        this.state = State.getInstance();
        this.waveManager = waveManager;
    }

    public update(dt: number): void {
        if (this.state.game.gameOver) return;

        // reset spawn counter when a new wave starts
        if (this.state.game.inWave && this.state.game.wave !== this.lastWave) {
            this.spawnCounter = 0;
            this.lastWave = this.state.game.wave;
        }

        this.updateWaveSpawning(dt);
        this.updateEnemies(dt);
        this.updateTowers(dt);
        this.updateProjectiles(dt);
        this.checkWaveEnd();
    }

    private updateWaveSpawning(dt: number): void {
        if (!this.state.game.inWave || this.state.game.waveRemaining <= 0) {
            return;
        }

        this.state.game.waveSpawnTimer -= dt;
        if (this.state.game.waveSpawnTimer <= 0) {
            const spawned = this.spawnEnemy();
            if (spawned) {
                this.state.game.waveRemaining--;
                this.state.game.waveSpawnTimer += this.state.game.wavePlan!.interval;
            } else {
                // small extra delay before retrying spawn to avoid tight loops
                this.state.game.waveSpawnTimer += 0.25;
            }
        }
    }

    private spawnEnemy(): boolean {
        if (!this.state.game.wavePlan) return false;

        // Prefer spawnQueue (non-boss) first
        const spawnQ = this.state.game.spawnQueue ?? [];
        const bossQ = this.state.game.bossQueue ?? [];
        let type: any = null;

        if (spawnQ.length > 0) {
            type = spawnQ.shift();
        } else if (bossQ.length > 0) {
            // Only spawn boss if there are no other enemies alive
            if (this.state.getEnemyCount() === 0) {
                type = bossQ.shift();
            } else {
                return false; // wait until other enemies are dead
            }
        } else {
            return false;
        }

        // Before spawning, ensure there is enough space from the last spawned enemy to avoid overlapping
        // Compute minimum spacing based on radii
        const spawnPoint = path[0];
        // find nearest existing enemy to spawn point
        let nearest: Enemy | null = null;
        let bestDist = Infinity;
        for (const e of this.state.enemies) {
            const d = Math.hypot(e.x - spawnPoint.x, e.y - spawnPoint.y);
            if (d < bestDist) { bestDist = d; nearest = e; }
        }

        const cfgRadius = (() => {
            // if nearest exists use its radius otherwise assume small default
            if (nearest) return nearest.radius;
            return 12;
        })();

        // estimate radius of the new enemy from its config via Enemy constructor behavior (enemyConfigs used there)
        // but we don't import enemyConfigs here; we can roughly estimate based on type: common radii used in config.ts
        const newRadius = (() => {
            switch (type) {
                case 'basic': return 12;
                case 'fast': return 10;
                case 'tank': return 15;
                default: return 12;
            }
        })();

        const minSpacing = cfgRadius + newRadius + 24; // extra buffer
        if (nearest && bestDist < minSpacing) {
            // Too close to spawn; push the type back to front of its queue for retry
            if ((this.state.game.spawnQueue ?? []).length >= 0) {
                // If it was a boss (spawnQ was empty), put it back to bossQ front
                if (bossQ && bossQ.length >= 0 && type && bossQ.indexOf(type) === -1 && this.state.game.spawnQueue?.indexOf(type) === -1) {
                    // It's tricky to detect origin so prefer pushing back to spawnQueue if not boss condition
                    this.state.game.spawnQueue!.unshift(type);
                } else {
                    this.state.game.spawnQueue!.unshift(type);
                }
            }
            return false;
        }

        const enemy = new Enemy(path[0], type, this.state.game.wave);
        this.state.addEnemy(enemy);
        return true;
    }

    private updateEnemies(dt: number): void {
        const enemiesToRemove: Enemy[] = [];

        for (const enemy of this.state.enemies) {
            const wp = path[enemy.wp];
            const direction = norm(wp.x - enemy.x, wp.y - enemy.y);

            enemy.x += direction.x * enemy.getSpeed() * dt;
            enemy.y += direction.y * enemy.getSpeed() * dt;

            if (dist(enemy.x, enemy.y, wp.x, wp.y) < 8) {
                enemy.wp++;
                if (enemy.wp >= path.length) {
                    // Enemy reached the end
                    enemiesToRemove.push(enemy);
                    this.state.game.lives--;
                    if (this.state.game.lives <= 0) {
                        this.state.game.gameOver = true;
                    }
                }
            }
        }

        // Remove enemies that reached the end
        for (const enemy of enemiesToRemove) {
            this.state.removeEnemy(enemy);
        }
    }

    private updateTowers(dt: number): void {
        for (const tower of this.state.towers) {
            // select target based on remaining distance to base
            const target = tower.findTarget(this.state.enemies);
            tower.target = target;

            // update tower (rotation, cooldown)
            tower.update(dt);

            if (!tower.canFire()) continue;

            if (target) {
                const projectile = tower.fire(target);
                this.state.addProjectile(projectile);
            }
        }
    }

    private updateProjectiles(dt: number): void {
        const canvas = document.getElementById("c") as HTMLCanvasElement;
        const projectilesToRemove: Projectile[] = [];

        for (const projectile of this.state.projectiles) {
            // if the projectile had a target that's been removed, clear the target so it flies straight
            if ((projectile as any).target && this.state.enemies.indexOf((projectile as any).target) === -1) {
                (projectile as any).target = null;
            }
            projectile.update(dt);

            // Check if off screen
            if (projectile.isOffScreen(canvas.width, canvas.height)) {
                projectilesToRemove.push(projectile);
                continue;
            }

            // Check collision with enemies
            const hitEnemy = this.checkProjectileCollision(projectile);
            if (hitEnemy) {
                // Area-of-effect behavior for cannon ("bruxo") towers
                if (projectile.sourceType === TowerType.CANNON) {
                    const aoeRadius = 36; // pixels
                    // iterate over a copy because we may remove enemies while iterating
                    for (const enemy of this.state.enemies.slice()) {
                        if (dist(projectile.x, projectile.y, enemy.x, enemy.y) <= aoeRadius + enemy.radius) {
                            enemy.takeDamage(projectile.damage);
                            // Cannon currently doesn't apply slow; slow handled below for SLOW type
                            if (enemy.isDead()) {
                                this.state.game.money += enemy.reward;
                                this.state.removeEnemy(enemy);
                            }
                        }
                    }
                } else {
                    // single-target behavior
                    hitEnemy.takeDamage(projectile.damage);

                    // If projectile came from a slow tower, apply slow stack
                    if (projectile.sourceType === TowerType.SLOW) {
                        hitEnemy.applySlow();
                    }

                    if (hitEnemy.isDead()) {
                        this.state.game.money += hitEnemy.reward;
                        this.state.removeEnemy(hitEnemy);
                    }
                }

                projectilesToRemove.push(projectile);
            }
        }

        // Remove used projectiles
        for (const projectile of projectilesToRemove) {
            this.state.removeProjectile(projectile);
        }
    }

    private checkProjectileCollision(projectile: Projectile): Enemy | null {
        for (const enemy of this.state.enemies) {
            if (dist(projectile.x, projectile.y, enemy.x, enemy.y) <= projectile.radius + enemy.radius) {
                return enemy;
            }
        }
        return null;
    }

    private checkWaveEnd(): void {
        if (this.state.game.inWave && 
            this.state.game.waveRemaining === 0 && 
            this.state.getEnemyCount() === 0) {
            this.waveManager.endWave();
        }
    }
}
