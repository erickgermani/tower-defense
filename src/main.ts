// Main game initialization and loop

import { State } from './state.js';
import { Tower } from './entities/Tower.js';
import { TowerType } from './types.js';
import { towerConfigs, enemyConfigs } from './config.js';
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
    private selectedTowerType: TowerType | null = null;
    // reference to tower panel
    private towerPanelDiv?: HTMLDivElement;
    // reference to reset button
    private resetBtn?: HTMLButtonElement;
    // ensure we only toggle game over UI once
    private gameOverDisplayed: boolean = false;
    // store original prices so we can restore them on reset
    private originalTowerPrices: Record<string, number> = {};

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

        // Apply tower colors and labels to selector buttons for clarity
        this.applyTowerButtonColors();
        this.updateTowerButtonLabels();

        // Ensure enemy cards reflect initial state
        this.updateEnemyCards();

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

        // Next wave button - increment tower prices when a new wave starts
        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        nextWaveBtn.addEventListener("click", () => {
            this.waveManager.startNextWave();
            // increment prices so new towers get more expensive each wave
            // this.incrementTowerPrices();
        });

        // Reset button (may be hidden in HTML)
        this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement | null ?? undefined;
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetGame());
        }
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
        // Deselect placement after placing a tower
        this.selectedTowerType = null;
        State.getInstance().placementType = null;
        this.updateTowerButtons();
    }

    private bindSelectors(): void {
        // Bind tower selector buttons from static HTML
        const basic = document.getElementById('tower-basic') as HTMLButtonElement | null;
        const sniper = document.getElementById('tower-sniper') as HTMLButtonElement | null;
        const cannon = document.getElementById('tower-cannon') as HTMLButtonElement | null;
        const slow = document.getElementById('tower-slow') as HTMLButtonElement | null;

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
        bindBtn(slow, TowerType.SLOW);

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
        // update selected class for visual clarity
        Object.values(TowerType).forEach(type => {
            const btn = document.getElementById(`tower-${type}`) as HTMLButtonElement | null;
            if (!btn) return;
            if (this.selectedTowerType === type) btn.classList.add('selected'); else btn.classList.remove('selected');
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
            // refresh enemy cards so they reflect current wave/plan
            this.updateEnemyCards();

             // If game over happened, show reset button and disable nextWave
             if (this.state.game.gameOver && !this.gameOverDisplayed) {
                 this.gameOverDisplayed = true;
                 // disable next wave
                 try { nextWaveBtn.disabled = true; } catch {}
                 // show reset control
                 if (this.resetBtn) {
                     this.resetBtn.style.display = '';
                 }
             }

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

    // Reset the game state to original values and restore UI
    private resetGame(): void {
        // Reset singleton state
        this.state.reset();
        // Recreate managers so timers/counters are fresh
        this.waveManager = new WaveManager();
        this.updater = new GameUpdater(this.waveManager);
        // Reset UI flags
        this.gameOverDisplayed = false;
        // Hide reset button
        if (this.resetBtn) this.resetBtn.style.display = 'none';
        // Re-enable next wave
        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        if (nextWaveBtn) nextWaveBtn.disabled = false;
        // Clear selected tower and tower panel
        this.selectedTowerType = null;
        State.getInstance().placementType = null;
        this.renderTowerPanel(null);

        // Restore original tower prices
        Object.entries(this.originalTowerPrices).forEach(([key, value]) => {
            const cfg = towerConfigs[key as TowerType];
            if (cfg) cfg.cost = value;
        });
        this.updateTowerButtonLabels();
    }

    private applyTowerButtonColors(): void {
        Object.values(TowerType).forEach(type => {
            const btn = document.getElementById(`tower-${type}`) as HTMLButtonElement | null;
            const cfg = towerConfigs[type as TowerType];
            if (btn && cfg) {
                btn.style.background = cfg.color;
                // set text color based on brightness
                const darkText = this.isColorLight(cfg.color);
                btn.style.color = darkText ? '#000' : '#fff';
            }
        });
    }

    private updateTowerButtonLabels(): void {
        Object.values(TowerType).forEach(type => {
            const btn = document.getElementById(`tower-${type}`) as HTMLButtonElement | null;
            const cfg = towerConfigs[type as TowerType];
            if (!btn || !cfg) return;
            btn.textContent = `${cfg.name} ($${cfg.cost})`;
        });
    }

    private incrementTowerPrices(): void {
        // Increase each tower cost by 10% (rounded) when a wave starts
        const factor = 1.10;
        Object.values(TowerType).forEach(type => {
            const cfg = towerConfigs[type as TowerType];
            if (!cfg) return;
            cfg.cost = Math.max(1, Math.round(cfg.cost * factor));
        });
        this.updateTowerButtonLabels();
    }

    private isColorLight(hex: string): boolean {
        const v = hex.replace('#','');
        const r = parseInt(v.substr(0,2),16);
        const g = parseInt(v.substr(2,2),16);
        const b = parseInt(v.substr(4,2),16);
        // luminance formula
        const lum = 0.2126*r + 0.7152*g + 0.0722*b;
        return lum > 160;
    }

    private updateEnemyCards(): void {
        const e1Name = document.getElementById('enemy1-name');
        const e1Hp = document.getElementById('enemy1-hp');
        const e1Sp = document.getElementById('enemy1-speed');
        const e1Rew = document.getElementById('enemy1-reward');
        const e1Dot = document.getElementById('enemy1-dot') as HTMLElement | null;

        const e2Name = document.getElementById('enemy2-name');
        const e2Hp = document.getElementById('enemy2-hp');
        const e2Sp = document.getElementById('enemy2-speed');
        const e2Rew = document.getElementById('enemy2-reward');
        const e2Dot = document.getElementById('enemy2-dot') as HTMLElement | null;

        const card1 = document.getElementById('enemy-card-1') as HTMLElement | null;
        const card2 = document.getElementById('enemy-card-2') as HTMLElement | null;

        // Decide which wave to show: if in-wave show current, otherwise show next wave
        const waveToShow = this.state.game.inWave ? this.state.game.wave : (this.state.game.wave + 1);
        const plan = this.state.game.wavePlan;
        const enemyTypes = plan?.enemyTypes ?? [];

        // If no plan, try to infer two enemy types based on waveToShow using WaveManager logic approximation
        let typesToShow: string[];
        if (enemyTypes.length >= 2) {
            typesToShow = enemyTypes as string[];
        } else {
            // fallback approximation mirroring wave.getEnemyTypesForWave rules
            if (waveToShow <= 2) typesToShow = ['basic','basic'];
            else if (waveToShow <= 4) typesToShow = ['basic','fast'];
            else if (waveToShow <= 6) typesToShow = ['fast','fast'];
            else if (waveToShow <= 8) typesToShow = ['fast','tank'];
            else typesToShow = ['tank','tank'];
        }

        const computeAttributes = (typeKey: string) => {
            const cfg = (enemyConfigs as any)[typeKey];
            if (!cfg) return null;
            const hp = cfg.baseHp + waveToShow * cfg.hpGrowth;
            const speed = cfg.baseSpeed + waveToShow * cfg.speedGrowth;
            const reward = Math.max(1, Math.floor(cfg.baseReward + Math.floor(waveToShow / 2) * cfg.rewardGrowth));
            return { name: cfg.name, hp, speed, reward };
        };

        const a1 = computeAttributes(typesToShow[0]);
        const a2 = computeAttributes(typesToShow[1]);

        // Show first card if available
        if (a1) {
            if (card1) card1.classList.remove('hidden');
            if (e1Name) e1Name.textContent = a1.name;
            if (e1Hp) e1Hp.textContent = `HP: ${a1.hp}`;
            if (e1Sp) e1Sp.textContent = `Velocidade: ${a1.speed}`;
            if (e1Rew) e1Rew.textContent = `Recompensa: ${a1.reward}`;
            if (e1Dot) e1Dot.style.background = (enemyConfigs as any)[typesToShow[0]]?.color ?? '#999';
        } else {
            if (card1) card1.classList.add('hidden');
        }

        // If the two types are identical, hide the second card (don't duplicate info)
        const sameType = typesToShow[1] == null || typesToShow[0] === typesToShow[1];
        if (sameType) {
            if (card2) card2.classList.add('hidden');
        } else {
            if (card2) card2.classList.remove('hidden');
            if (a2) {
                if (e2Name) e2Name.textContent = a2.name;
                if (e2Hp) e2Hp.textContent = `HP: ${a2.hp}`;
                if (e2Sp) e2Sp.textContent = `Velocidade: ${a2.speed}`;
                if (e2Rew) e2Rew.textContent = `Recompensa: ${a2.reward}`;
                if (e2Dot) e2Dot.style.background = (enemyConfigs as any)[typesToShow[1]]?.color ?? '#999';
            }
        }
    }
}

// Initialize game when DOM is ready
new Game();
