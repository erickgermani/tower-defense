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
    // reference to tower panel
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
        this.bindSelectors();
        // ensure panel reference
        this.towerPanelDiv = document.getElementById('tower-panel') as HTMLDivElement;
        this.renderTowerPanel(null);
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
        this.state.selectedTower = tower;
        this.renderTowerPanel(tower);
    }
 
    private hideTowerMenu(): void {
        this.state.selectedTower = null;
        this.renderTowerPanel(null);
    }

    private renderTowerPanel(tower: import('./entities/Tower.js').Tower | null) {
        const panel = document.getElementById('tower-panel');
        if (!panel) return;

        const infoEl = document.getElementById('panel-info') as HTMLElement;
        const sellBtn = document.getElementById('sell-btn') as HTMLButtonElement;
        const upgradeBtn = document.getElementById('upgrade-btn') as HTMLButtonElement;
        const dmgEl = document.getElementById('attr-dmg') as HTMLElement;
        const rangeEl = document.getElementById('attr-range') as HTMLElement;
        const frEl = document.getElementById('attr-fr') as HTMLElement;

        const locked = !tower;
        if (locked) panel.classList.add('locked'); else panel.classList.remove('locked');

        if (!tower) {
            infoEl.innerHTML = `<em>Nenhuma torre selecionada</em>`;
            sellBtn.textContent = `Vender ($0)`;
            sellBtn.disabled = true;
            // upgrade
            upgradeBtn.textContent = 'Up';
            upgradeBtn.disabled = true;
            dmgEl.textContent = `Dano: -`;
            rangeEl.textContent = `Alcance: -`;
            frEl.textContent = `FireRate: -`;
            // remove old listeners by cloning
            sellBtn.replaceWith(sellBtn.cloneNode(true));
            upgradeBtn.replaceWith(upgradeBtn.cloneNode(true));
            // re-query after replace
            // (no handlers needed when locked)
            return;
        }

        // Tower is present: populate values
        infoEl.innerHTML = `<strong>${tower.name}</strong> - Nível ${tower.level}`;
        sellBtn.textContent = `Vender ($${tower.getSellValue()})`;
        sellBtn.disabled = false;

        // wire sell action (replace to remove previous handlers)
        const newSell = sellBtn.cloneNode(true) as HTMLButtonElement;
        newSell.addEventListener('click', () => {
            const val = tower.getSellValue();
            this.state.game.money += val;
            const idx = this.state.towers.indexOf(tower);
            if (idx > -1) this.state.towers.splice(idx, 1);
            this.hideTowerMenu();
        });
        sellBtn.parentElement!.replaceChild(newSell, sellBtn);

        // upgrade
        const upCost = tower.getUpgradeCost();
        const newUpgrade = (upgradeBtn.cloneNode(true) as HTMLButtonElement);
        if (!isFinite(upCost)) {
            newUpgrade.textContent = 'Max';
            newUpgrade.disabled = true;
        } else {
            newUpgrade.textContent = `Up (${upCost})`;
            newUpgrade.disabled = false;
            newUpgrade.addEventListener('click', () => {
                if (this.state.game.money < upCost) {
                    this.showToastAt(window.innerWidth / 2, window.innerHeight / 2, `Dinheiro insuficiente! Precisa de ${upCost}`);
                    return;
                }
                this.state.game.money -= upCost;
                tower.upgrade();
                this.renderTowerPanel(tower);
            });
        }
        upgradeBtn.parentElement!.replaceChild(newUpgrade, upgradeBtn);

        const nextDmg = Math.round(tower.damage * 1.2);
        const nextRange = Math.round(tower.range * 1.12);
        const nextFireRate = +(1 / Math.max(0.05, tower.fireInterval * 0.92)).toFixed(2);
        const curFireRate = +(1 / Math.max(0.0001, tower.fireInterval)).toFixed(2);

        dmgEl.textContent = `Dano: ${tower.damage} > ${nextDmg}`;
        rangeEl.textContent = `Alcance: ${tower.range} > ${nextRange}`;
        frEl.textContent = `FireRate (shots/s): ${curFireRate} > ${nextFireRate}`;
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

    private bindSelectors(): void {
        // Bind tower selector buttons from static HTML
        const basic = document.getElementById('tower-basic') as HTMLButtonElement | null;
        const sniper = document.getElementById('tower-sniper') as HTMLButtonElement | null;
        const cannon = document.getElementById('tower-cannon') as HTMLButtonElement | null;

        const bindBtn = (btn: HTMLButtonElement | null, type: TowerType) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (this.selectedTowerType === type) {
                    this.selectedTowerType = null;
                    State.getInstance().placementType = null;
                } else {
                    this.selectedTowerType = type;
                    State.getInstance().placementType = type;
                }
                this.updateTowerButtons();
            });
        };

        bindBtn(basic, TowerType.BASIC);
        bindBtn(sniper, TowerType.SNIPER);
        bindBtn(cannon, TowerType.CANNON);

        // Next wave button already exists in HTML; stats element already fetched in constructor
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
