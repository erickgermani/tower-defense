// Main game initialization and loop

import { State } from './state.js';
import { Tower } from './entities/Tower.js';
import { TowerType } from './types.js';
import { towerConfigs } from './config.js';
import { WaveManager } from './wave.js';
import { GameUpdater } from './update.js';
import { Renderer } from './render.js';
import { clamp, validatePlacement } from './utils.js';
import { path } from './config.js';

class Game {
    private canvas: HTMLCanvasElement;
    private state: State;
    private waveManager: WaveManager;
    private updater: GameUpdater;
    private renderer: Renderer;
    // selection for tower placement. null means 'none'
    private selectedTowerType: TowerType | null = TowerType.BASIC;
    // references to tower selector and panel
    private towerSelectorDiv?: HTMLDivElement;
    private towerPanelDiv?: HTMLDivElement;

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

    private showTowerMenu(tower: import('./entities/Tower.js').Tower) {
        // use fixed panel in HUD for tower actions
        this.state.selectedTower = tower;
        if (!this.towerPanelDiv) return;
        const panel = this.towerPanelDiv;
        panel.innerHTML = '';
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';
        panel.style.background = '#1b2230';
        panel.style.border = '1px solid #2a3142';
        panel.style.borderRadius = '6px';

        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.alignItems = 'center';

        const info = document.createElement('div');
        info.style.marginRight = '12px';
        info.innerHTML = `<strong>${tower.name}</strong> - Nível ${tower.level}`;

        const buttonsDiv = document.createElement('div');

        const sellBtn = document.createElement('button');
        sellBtn.textContent = `Vender ($${tower.getSellValue()})`;
        sellBtn.addEventListener('click', () => {
            const val = tower.getSellValue();
            this.state.game.money += val;
            const idx = this.state.towers.indexOf(tower);
            if (idx > -1) this.state.towers.splice(idx, 1);
            this.hideTowerMenu();
        });

        const upgradeBtn = document.createElement('button');
        const upCost = tower.getUpgradeCost();
        if (!isFinite(upCost)) {
            upgradeBtn.textContent = 'Max';
            upgradeBtn.disabled = true;
        } else {
            upgradeBtn.textContent = `Up (${upCost})`;
            upgradeBtn.addEventListener('click', () => {
                const cost = tower.getUpgradeCost();
                if (this.state.game.money < cost) {
                    this.showToastAt(window.innerWidth / 2, window.innerHeight / 2, `Dinheiro insuficiente! Precisa de ${cost}`);
                    return;
                }
                this.state.game.money -= cost;
                tower.upgrade();
                // refresh panel
                this.showTowerMenu(tower);
            });
        }

        buttonsDiv.appendChild(sellBtn);
        buttonsDiv.appendChild(upgradeBtn);

        topRow.appendChild(info);
        topRow.appendChild(buttonsDiv);

        const attrDiv = document.createElement('div');
        attrDiv.style.marginTop = '8px';
        attrDiv.style.display = 'flex';
        attrDiv.style.gap = '18px';

        // current and next stats
        const nextDmg = Math.round(tower.damage * 1.2);
        const nextRange = Math.round(tower.range * 1.12);
        const nextFireRate = +(1 / Math.max(0.05, tower.fireInterval * 0.92)).toFixed(2);
        const curFireRate = +(1 / Math.max(0.0001, tower.fireInterval)).toFixed(2);

        const dmgEl = document.createElement('div');
        dmgEl.textContent = `Dano: ${tower.damage} > ${nextDmg}`;
        const rangeEl = document.createElement('div');
        rangeEl.textContent = `Alcance: ${tower.range} > ${nextRange}`;
        const frEl = document.createElement('div');
        frEl.textContent = `FireRate (shots/s): ${curFireRate} > ${nextFireRate}`;

        attrDiv.appendChild(dmgEl);
        attrDiv.appendChild(rangeEl);
        attrDiv.appendChild(frEl);

        panel.appendChild(topRow);
        panel.appendChild(attrDiv);
    }

    private hideTowerMenu(): void {
        this.state.selectedTower = null;
        if (this.towerPanelDiv) {
            this.towerPanelDiv.style.display = 'none';
            this.towerPanelDiv.innerHTML = '';
        }
    }

    private handleCanvasClick(e: MouseEvent): void {
        if (this.state.game.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        // If no placement type selected, check if user clicked on an existing tower -> select it
        if (this.selectedTowerType == null) {
            // find tower under cursor
            for (const t of this.state.towers) {
                const dx = t.x - x, dy = t.y - y;
                if (Math.hypot(dx, dy) <= 14) {
                    // select
                    this.showTowerMenu(t);
                    return;
                }
            }
            // clicked empty space: hide menu/selection
            this.hideTowerMenu();
            return;
        }

        // Validate placement using shared helper
        const vp = validatePlacement(x, y, this.state.towers.map(t => ({ x: t.x, y: t.y })), path);
        if (!vp.valid) {
            if (vp.reason === 'path') this.showToastAt(e.clientX, e.clientY, 'Local inválido: caminho.');
            else if (vp.reason === 'tower') this.showToastAt(e.clientX, e.clientY, 'Local inválido: torre existente.');
            return;
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

        // create (or ensure) tower panel right after selector
        const panel = document.createElement('div');
        panel.id = 'tower-panel';
        panel.style.marginTop = '8px';
        panel.style.minHeight = '48px';
        panel.style.display = 'none';
        panel.style.alignItems = 'center';
        panel.style.gap = '8px';
        panel.style.padding = '6px';
        hud.insertBefore(panel, selectorDiv.nextSibling);
        this.towerPanelDiv = panel;
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
