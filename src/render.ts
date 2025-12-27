// Rendering functions

import { State } from './state.js';
import { path, towerConfigs } from './config.js';
import { clamp, validatePlacement } from './utils.js';

export class Renderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: State;
    private statsEl: HTMLElement;

    constructor(canvas: HTMLCanvasElement, statsEl: HTMLElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.state = State.getInstance();
        this.statsEl = statsEl;
    }

    public draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawPath();
        this.drawWaypoints();
        // Draw placement preview range if a tower type is selected
        this.drawPlacementPreview();
        this.drawTowers();
        this.drawEnemies();
        this.drawProjectiles();
        this.drawGameOver();
    }

    private drawPath(): void {
        this.ctx.lineWidth = 18;
        this.ctx.strokeStyle = "#26304a";
        this.ctx.lineCap = "round";
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        this.ctx.stroke();
    }

    private drawWaypoints(): void {
        for (const p of path) {
            this.ctx.fillStyle = "#3a4460";
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    private drawTowers(): void {
        for (const tower of this.state.towers) {
            // highlight selected tower: draw its range as a translucent circle + selection ring
            if (this.state.selectedTower === tower) {
                // draw range (translucent)
                this.ctx.save();
                const rgb = hexToRgb(tower.color);

                // Always draw full circular range (fov removed)
                this.ctx.beginPath();
                this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${rgb}, 0.12)`;
                this.ctx.fill();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = `rgba(${rgb}, 0.28)`;
                this.ctx.stroke();

                this.ctx.restore();

                // small selection ring
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(tower.x, tower.y, 16, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(121,209,139,0.9)';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                this.ctx.restore();
            }
            // Base
            this.ctx.fillStyle = tower.color;
            this.ctx.beginPath();
            this.ctx.arc(tower.x, tower.y, 12, 0, Math.PI * 2);
            this.ctx.fill();

            // Barrel
            this.ctx.strokeStyle = this.lightenColor(tower.color);
            this.ctx.lineWidth = 3;
            // draw barrel according to tower.angle
            const bx = tower.x + Math.cos(tower.angle) * 14;
            const by = tower.y + Math.sin(tower.angle) * 14;
            this.ctx.beginPath();
            this.ctx.moveTo(tower.x, tower.y);
            this.ctx.lineTo(bx, by);
            this.ctx.stroke();
        }
    }

    private drawEnemies(): void {
        for (const enemy of this.state.enemies) {
            // Body
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Health bar
            const w = 28, h = 5;
            const x = enemy.x - w / 2, y = enemy.y - enemy.radius - 12;
            this.ctx.fillStyle = "#1a1f2e";
            this.ctx.fillRect(x, y, w, h);
            this.ctx.fillStyle = "#79d18b";
            this.ctx.fillRect(x, y, w * clamp(enemy.getHealthPercentage(), 0, 1), h);
            this.ctx.strokeStyle = "#2a3142";
            this.ctx.strokeRect(x, y, w, h);
        }
    }

    private drawProjectiles(): void {
        for (const projectile of this.state.projectiles) {
            this.ctx.fillStyle = projectile.color;
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    private drawGameOver(): void {
        if (!this.state.game.gameOver) return;

        this.ctx.fillStyle = "rgba(0,0,0,0.55)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 44px system-ui, Arial";
        this.ctx.fillText("GAME OVER", 320, 260);
        this.ctx.font = "16px system-ui, Arial";
        this.ctx.fillText("Pressione 'Reiniciar' para jogar novamente.", 335, 295);
    }

    public updateHud(): void {
        this.statsEl.textContent =
            `Dinheiro: ${this.state.game.money} | ` +
            `Vida: ${this.state.game.lives} | ` +
            `Wave: ${this.state.game.wave}`;
    }

    private lightenColor(color: string): string {
        // Simple color lightening
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 60);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 60);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 60);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    private drawPlacementPreview(): void {
        const type = this.state.placementType;
        if (type == null) return;
        const cfg = towerConfigs[type];
        const x = this.state.placementX;
        const y = this.state.placementY;

        const vp = validatePlacement(x, y, this.state.towers.map(t => ({ x: t.x, y: t.y })), path);
        const valid = vp.valid;
        const baseColor = valid ? cfg.color : '#c94a4a';

        // translucent fill
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, cfg.range, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${hexToRgb(baseColor)}, 0.12)`;
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = `rgba(${hexToRgb(baseColor)}, 0.28)`;
        this.ctx.stroke();
        this.ctx.restore();

        // Draw a translucent tower at the cursor (or an X if invalid)
        this.ctx.save();
        if (valid) {
            this.ctx.fillStyle = `rgba(${hexToRgb(cfg.color)}, 0.9)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.fill();

            // small barrel pointing to the right by default
            this.ctx.strokeStyle = this.lightenColor(cfg.color);
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + 14, y);
            this.ctx.stroke();
        } else {
            // draw X
            this.ctx.strokeStyle = '#ff6b6b';
            this.ctx.lineWidth = 3;
            const s = 12;
            this.ctx.beginPath();
            this.ctx.moveTo(x - s, y - s);
            this.ctx.lineTo(x + s, y + s);
            this.ctx.moveTo(x + s, y - s);
            this.ctx.lineTo(x - s, y + s);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
}

function hexToRgb(hex: string): string {
    const v = hex.replace('#', '');
    const num = parseInt(v, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `${r}, ${g}, ${b}`;
}
