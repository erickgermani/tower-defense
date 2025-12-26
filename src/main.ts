// Main game initialization and loop

import { State } from './state.js';
import { Tower } from './entities/Tower.js';
import { TowerType } from './types.js';
import { towerConfigs } from './config.js';
import { WaveManager } from './wave.js';
import { GameUpdater } from './update.js';
import { Renderer } from './render.js';
import { clamp } from './utils.js';

class Game {
    private canvas: HTMLCanvasElement;
    private state: State;
    private waveManager: WaveManager;
    private updater: GameUpdater;
    private renderer: Renderer;
    private selectedTowerType: TowerType = TowerType.BASIC;

    constructor() {
        this.canvas = document.getElementById("c") as HTMLCanvasElement;
        this.state = State.getInstance();
        this.waveManager = new WaveManager();
        this.updater = new GameUpdater(this.waveManager);
        
        const statsEl = document.getElementById("stats") as HTMLElement;
        this.renderer = new Renderer(this.canvas, statsEl);

        this.setupEventListeners();
        this.createTowerSelector();
        this.start();
    }

    private setupEventListeners(): void {
        // Canvas click to build tower
        this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));

        // Next wave button
        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        nextWaveBtn.addEventListener("click", () => {
            this.waveManager.startNextWave();
        });
    }

    private handleCanvasClick(e: MouseEvent): void {
        if (this.state.game.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        const towerCost = towerConfigs[this.selectedTowerType].cost;

        if (this.state.game.money < towerCost) {
            console.log(`Dinheiro insuficiente! Precisa de ${towerCost}`);
            return;
        }

        this.state.game.money -= towerCost;
        const tower = new Tower(x, y, this.selectedTowerType);
        this.state.addTower(tower);
    }

    private createTowerSelector(): void {
        const hud = document.querySelector('.hud') as HTMLElement;
        const selectorDiv = document.createElement('div');
        selectorDiv.style.cssText = 'display: flex; gap: 8px;';

        Object.values(TowerType).forEach(type => {
            const config = towerConfigs[type];
            const btn = document.createElement('button');
            btn.textContent = `${config.name} ($${config.cost})`;
            btn.id = `tower-${type}`;
            btn.className = 'tower-btn';
            btn.style.cssText = this.selectedTowerType === type 
                ? 'border: 2px solid #79d18b;' 
                : '';
            
            btn.addEventListener('click', () => {
                this.selectedTowerType = type;
                this.updateTowerButtons();
            });

            selectorDiv.appendChild(btn);
        });

        const firstChild = hud.firstChild;
        hud.insertBefore(selectorDiv, firstChild);
    }

    private updateTowerButtons(): void {
        Object.values(TowerType).forEach(type => {
            const btn = document.getElementById(`tower-${type}`) as HTMLButtonElement;
            if (btn) {
                btn.style.cssText = this.selectedTowerType === type 
                    ? 'border: 2px solid #79d18b;' 
                    : '';
            }
        });
    }

    private start(): void {
        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        nextWaveBtn.disabled = false;

        let last = performance.now();
        const loop = (now: number) => {
            const dt = clamp((now - last) / 1000, 0, 0.05);
            last = now;

            this.updater.update(dt);
            this.renderer.draw();
            this.renderer.updateHud();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

// Initialize game when DOM is ready
new Game();
