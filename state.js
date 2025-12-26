// Game state management

export const state = {
    money: 100,
    lives: 20,
    wave: 0,
    inWave: false,
    enemies: [],
    towers: [],
    projectiles: [],
    // controle da wave atual
    wavePlan: null,
    waveSpawnTimer: 0,
    waveRemaining: 0,
    enemyAliveCount: 0,
    gameOver: false,
};
