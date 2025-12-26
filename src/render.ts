// Rendering functions

import { State } from './state.js';
import { path } from './config.js';
import { clamp } from './utils.js';

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
            `Vidas: ${this.state.game.lives} | ` +
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
}
