// Wave management

import { state } from './state.js';
import { clamp } from './utils.js';

export function startNextWave() {
    if (state.gameOver) return;
    if (state.inWave) return;

    state.wave++;
    state.inWave = true;

    // plano simples: 8 + 2*wave inimigos, spawn a cada 0.65s
    state.waveRemaining = 8 + state.wave * 2;
    state.waveSpawnTimer = 0;
    state.wavePlan = { interval: clamp(0.75 - state.wave * 0.03, 0.35, 0.75) };

    const nextWaveBtn = document.getElementById("nextWave");
    nextWaveBtn.disabled = true;
}
