// Game update logic

import { State } from './state.js';
import { path } from './config.js';
import { Enemy } from './entities/Enemy.js';
import { Projectile } from './entities/Projectile.js';
import { dist, norm } from './utils.js';
import { EnemyType } from './types.js';
import { WaveManager } from './wave.js';
import { TowerType } from './types.js';

export class GameUpdater {
    private state: State;
    private waveManager: WaveManager;

    constructor(waveManager: WaveManager) {
        this.state = State.getInstance();
        this.waveManager = waveManager;
    }

    public update(dt: number): void {
        if (this.state.game.gameOver) return;

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
            this.spawnEnemy();
            this.state.game.waveRemaining--;
            this.state.game.waveSpawnTimer += this.state.game.wavePlan!.interval;
        }
    }

    private spawnEnemy(): void {
        if (!this.state.game.wavePlan) return;

        // Select enemy type: only one type per wave, so pick the first type
        const types = this.state.game.wavePlan.enemyTypes;
        const type = types[0];

        const enemy = new Enemy(path[0], type, this.state.game.wave);
        this.state.addEnemy(enemy);
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
            tower.update(dt);

            if (!tower.canFire()) continue;

            const target = tower.findTarget(this.state.enemies);
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
                hitEnemy.takeDamage(projectile.damage);

                // If projectile came from a slow tower, apply slow stack
                if (projectile.sourceType === TowerType.SLOW) {
                    hitEnemy.applySlow();
                }

                projectilesToRemove.push(projectile);

                if (hitEnemy.isDead()) {
                    this.state.game.money += hitEnemy.reward;
                    this.state.removeEnemy(hitEnemy);
                }
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
