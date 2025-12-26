// Rendering functions

import { State } from './state.js';
import { path, towerConfigs } from './config.js';
import { clamp, pointToSegmentDistance, dist } from './utils.js';

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
            // Base
            this.ctx.fillStyle = tower.color;
            this.ctx.beginPath();
            this.ctx.arc(tower.x, tower.y, 12, 0, Math.PI * 2);
            this.ctx.fill();

            // Barrel
            this.ctx.strokeStyle = this.lightenColor(tower.color);
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(tower.x, tower.y);
            this.ctx.lineTo(tower.x + 14, tower.y);
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
        this.ctx.fillText("Recarregue a página para recomeçar.", 335, 295);
    }

    public updateHud(): void {
        this.statsEl.textContent =
            `Dinheiro: ${this.state.game.money} | ` +
            `Vida: ${this.state.game.lives} | ` +
            `Wave: ${this.state.game.wave} | ` +
            `Inimigos: ${this.state.getEnemyCount()}`;
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

        // Determine if the placement point is valid: not on path and not overlapping other towers
        let valid = true;
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            if (pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y) < 22) {
                valid = false;
                break;
            }
        }
        if (valid) {
            for (const t of this.state.towers) {
                if (dist(x, y, t.x, t.y) < 24) {
                    valid = false;
                    break;
                }
            }
        }

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
