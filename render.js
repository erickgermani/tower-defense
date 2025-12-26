// Rendering functions

import { state } from './state.js';
import { path } from './config.js';
import { clamp } from './utils.js';

export function draw() {
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // caminho
    ctx.lineWidth = 18;
    ctx.strokeStyle = "#26304a";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();

    // waypoints (debug visual)
    for (const p of path) {
        ctx.fillStyle = "#3a4460";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // torres
    for (const t of state.towers) {
        // base
        ctx.fillStyle = "#3d7a6a";
        ctx.beginPath();
        ctx.arc(t.x, t.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // cano
        ctx.strokeStyle = "#b9f2e2";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x + 14, t.y);
        ctx.stroke();
    }

    // inimigos
    for (const en of state.enemies) {
        // corpo
        ctx.fillStyle = "#b85c5c";
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();

        // barra de vida
        const w = 28, h = 5;
        const x = en.x - w / 2, y = en.y - en.radius - 12;
        ctx.fillStyle = "#1a1f2e";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#79d18b";
        ctx.fillRect(x, y, w * clamp(en.hp / en.maxHp, 0, 1), h);
        ctx.strokeStyle = "#2a3142";
        ctx.strokeRect(x, y, w, h);
    }

    // projéteis
    ctx.fillStyle = "#f5d17a";
    for (const p of state.projectiles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // overlay game over
    if (state.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px system-ui, Arial";
        ctx.fillText("GAME OVER", 320, 260);
        ctx.font = "16px system-ui, Arial";
        ctx.fillText("Recarregue a página para recomeçar.", 335, 295);
    }
}

export function updateHud() {
    const statsEl = document.getElementById("stats");
    statsEl.textContent =
        `Dinheiro: ${state.money} | Vidas: ${state.lives} | Wave: ${state.wave} | Inimigos: ${state.enemyAliveCount}`;
}
