// Main game initialization and loop

import { State } from './state.js';
import { Tower } from './entities/Tower.js';
import { TowerType } from './types.js';
import { towerConfigs } from './config.js';
import { WaveManager } from './wave.js';
import { GameUpdater } from './update.js';
import { Renderer } from './render.js';
import { clamp, pointToSegmentDistance, dist } from './utils.js';
import { path } from './config.js';

class Game {
    private canvas: HTMLCanvasElement;
    private state: State;
    private waveManager: WaveManager;
    private updater: GameUpdater;
    private renderer: Renderer;
    // selection for tower placement. null means 'none'
    private selectedTowerType: TowerType | null = TowerType.BASIC;

    constructor() {
        this.canvas = document.getElementById("c") as HTMLCanvasElement;
        this.state = State.getInstance();
        this.waveManager = new WaveManager();
        this.updater = new GameUpdater(this.waveManager);
        
        const statsEl = document.getElementById("stats") as HTMLElement;
        this.renderer = new Renderer(this.canvas, statsEl);

        this.setupEventListeners();
        // sync initial placement selection to state
        State.getInstance().placementType = this.selectedTowerType;
        this.createTowerSelector();
        this.start();
    }

    private setupEventListeners(): void {
        // Canvas click to build tower
        this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
        // track mouse for placement preview
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        // Clear selection with Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.selectedTowerType = null;
                State.getInstance().placementType = null;
                this.updateTowerButtons();
            }
        });

        // Next wave button
        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        nextWaveBtn.addEventListener("click", () => {
            this.waveManager.startNextWave();
        });
    }

    private handleMouseMove(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        this.state.placementX = x;
        this.state.placementY = y;
    }

    private handleCanvasClick(e: MouseEvent): void {
        if (this.state.game.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        // Only place if a tower type is selected
        if (this.selectedTowerType == null) return;

        // Validate placement: not on path and not on other towers
        // Check path segments
        const pathClear = (() => {
            for (let i = 0; i < path.length - 1; i++) {
                const p1 = path[i];
                const p2 = path[i + 1];
                if (pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y) < 22) {
                    return false;
                }
            }
            return true;
        })();
        if (!pathClear) {
            this.showToastAt(e.clientX, e.clientY, 'Local inválido: caminho.');
            return;
        }

        // Check other towers
        for (const t of this.state.towers) {
            if (dist(x, y, t.x, t.y) < 24) {
                this.showToastAt(e.clientX, e.clientY, 'Local inválido: torre existente.');
                return;
            }
        }

        const cost = towerConfigs[this.selectedTowerType].cost;
        if (this.state.game.money < cost) {
            this.showToastAt(e.clientX, e.clientY, `Dinheiro insuficiente! Precisa de ${cost}`);
            return;
        }

        this.state.game.money -= cost;
        const tower = new Tower(x, y, this.selectedTowerType);
        this.state.addTower(tower);
    }

    private createTowerSelector(): void {
        const hud = document.querySelector('.hud') as HTMLElement;
        const selectorDiv = document.createElement('div');
        selectorDiv.style.cssText = 'display: flex; gap: 8px;';

        // Clicking the same tower button again will deselect (toggle)
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
                if (this.selectedTowerType === type) {
                    // toggle off
                    this.selectedTowerType = null;
                    State.getInstance().placementType = null;
                } else {
                    this.selectedTowerType = type;
                    State.getInstance().placementType = type;
                }
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
        // sync placement type in state
        State.getInstance().placementType = this.selectedTowerType;
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

    private showToastAt(clientX: number, clientY: number, text: string, ms = 1600) {
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = text;
        // position in viewport
        el.style.left = `${clientX}px`;
        el.style.top = `${clientY}px`;
        document.body.appendChild(el);

        // hide and remove after timeout
        setTimeout(() => el.classList.add('hide'), ms - 200);
        setTimeout(() => { try { el.remove(); } catch {} }, ms);
    }
}

// Initialize game when DOM is ready
new Game();
