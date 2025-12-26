// Main game initialization and loop

import { state } from './state.js';
import { TowerCost } from './config.js';
import { addTower } from './entities.js';
import { startNextWave } from './wave.js';
import { update } from './update.js';
import { draw, updateHud } from './render.js';
import { clamp } from './utils.js';

// Inicializar o jogo
export function init() {
    const canvas = document.getElementById("c");
    const nextWaveBtn = document.getElementById("nextWave");

    // Input (build)
    canvas.addEventListener("click", (e) => {
        if (state.gameOver) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        if (state.money < TowerCost) return;

        // MVP: permite construir em qualquer lugar. Depois você bloqueia em cima do caminho.
        state.money -= TowerCost;
        addTower(x, y);
    });

    // Botão de próxima wave
    nextWaveBtn.addEventListener("click", startNextWave);

    // Game loop
    let last = performance.now();
    function loop(now) {
        const dt = clamp((now - last) / 1000, 0, 0.05);
        last = now;

        update(dt);
        draw();
        updateHud();

        requestAnimationFrame(loop);
    }

    // Start
    nextWaveBtn.disabled = false;
    requestAnimationFrame(loop);
}

// Iniciar quando o DOM estiver pronto
init();
