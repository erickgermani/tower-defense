// Game state management

import { GameState } from './types.js';
import { Enemy } from './entities/Enemy.js';
import { Tower } from './entities/Tower.js';
import { Projectile } from './entities/Projectile.js';

export class State {
    private static instance: State;
    
    public game: GameState;
    public enemies: Enemy[] = [];
    public towers: Tower[] = [];
    public projectiles: Projectile[] = [];

    // Placement preview: current tower type selected for placement (null = none)
    public placementType: import('./types.js').TowerType | null = null;
    // Mouse position for placement preview (in canvas coordinates)
    public placementX: number = 0;
    public placementY: number = 0;
    // Selected placed tower for upgrade/sell actions
    public selectedTower: import('./entities/Tower.js').Tower | null = null;

    private constructor() {
        this.game = {
            money: 100,
            lives: 12,
            wave: 1,
            inWave: false,
            wavePlan: null,
            waveSpawnTimer: 0,
            waveRemaining: 0,
            gameOver: false,
            spawnQueue: [],
            bossQueue: []
        };
    }

    public static getInstance(): State {
        if (!State.instance) {
            State.instance = new State();
        }
        return State.instance;
    }

    public addEnemy(enemy: Enemy): void {
        this.enemies.push(enemy);
    }

    public removeEnemy(enemy: Enemy): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }

    public addTower(tower: Tower): void {
        this.towers.push(tower);
    }

    public addProjectile(projectile: Projectile): void {
        this.projectiles.push(projectile);
    }

    public removeProjectile(projectile: Projectile): void {
        const index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
    }

    public getEnemyCount(): number {
        return this.enemies.length;
    }

    public reset(): void {
        this.game = {
            money: 60,
            lives: 12,
            wave: 1,
            inWave: false,
            wavePlan: null,
            waveSpawnTimer: 0,
            waveRemaining: 0,
            gameOver: false,
            spawnQueue: [],
            bossQueue: []
        };
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
    }
}
