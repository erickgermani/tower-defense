// Wave management

import { State } from './state.js';
import { EnemyType, WavePlan, WaveEnemySpec } from './types.js';
import { clamp } from './utils.js';

export function getWavePlanForWave(wave: number): WavePlan {
    // simple presets; each entry defines type and count; no bosses by default
    const spec = (t: EnemyType, c: number, boss = false): WaveEnemySpec => ({ type: t, count: c, boss });

    if (wave == 1) return { interval: clamp(0.75 - wave * 0.02, 0.45, 0.75), mode: 'interleave', enemies: [spec(EnemyType.BASIC, 6)] };
    if (wave == 2) return { interval: clamp(0.75 - wave * 0.02, 0.45, 0.75), mode: 'interleave', enemies: [spec(EnemyType.BASIC, 6), spec(EnemyType.FAST, 4)] };
    if (wave == 3) return { interval: clamp(0.74 - wave * 0.02, 0.45, 0.75), mode: 'sequential', enemies: [spec(EnemyType.BASIC, 6), spec(EnemyType.TANK, 4)] };
    if (wave == 4) return { interval: clamp(0.73 - wave * 0.02, 0.45, 0.75), mode: 'interleave', enemies: [spec(EnemyType.BASIC, 6), spec(EnemyType.FLYER, 8)] };
    if (wave == 5) return { interval: clamp(0.72 - wave * 0.02, 0.45, 0.75), mode: 'sequential', enemies: [spec(EnemyType.FAST, 6), spec(EnemyType.TANK, 4)] };

    // generic progression: increase counts slowly
    const base = 6 + Math.floor(wave / 2);
    if (wave % 3 == 0) return { interval: clamp(0.75 - wave * 0.02, 0.45, 0.75), mode: 'interleave', enemies: [spec(EnemyType.FAST, base), spec(EnemyType.TANK, Math.max(2, Math.floor(base / 2)))] };
    if (wave % 2 == 0) return { interval: clamp(0.75 - wave * 0.02, 0.45, 0.75), mode: 'interleave', enemies: [spec(EnemyType.FAST, base), spec(EnemyType.BASIC, base)] };

    return { interval: clamp(0.75 - wave * 0.02, 0.45, 0.75), mode: 'interleave', enemies: [spec(EnemyType.BASIC, base), spec(EnemyType.TANK, Math.max(1, Math.floor(base / 2)))] };
}

export class WaveManager {
    private state: State;

    constructor() {
        this.state = State.getInstance();
    }

    public startNextWave(): void {
        if (this.state.game.gameOver || this.state.game.inWave) {
            return;
        }

        // start the current wave number (wave starts at 1 in state)
        this.state.game.inWave = true;

        // Create wave plan using new format
        const plan = getWavePlanForWave(this.state.game.wave);

        // build spawn queues according to mode, separating bosses
        const spawnQueue: EnemyType[] = [];
        const bossQueue: EnemyType[] = [];

        // total non-boss count
        let total = 0;

        if (plan.mode === 'interleave') {
            // push items round-robin until counts exhausted
            const counts = plan.enemies.map(e => ({ type: e.type, remaining: e.count, boss: !!e.boss }));
            let added = true;
            while (added) {
                added = false;
                for (const c of counts) {
                    if (c.remaining <= 0) continue;
                    if (c.boss) {
                        // accumulate bosses separately
                        bossQueue.push(c.type);
                        c.remaining--;
                        added = true;
                        continue;
                    }
                    spawnQueue.push(c.type);
                    c.remaining--;
                    added = true;
                }
            }
        } else {
            // sequential: push each type fully in order
            for (const e of plan.enemies) {
                if (e.boss) {
                    for (let i = 0; i < e.count; i++) bossQueue.push(e.type);
                } else {
                    for (let i = 0; i < e.count; i++) spawnQueue.push(e.type);
                    total += e.count;
                }
            }
        }

        // If there are no non-boss enemies, allow bosses to spawn normally
        if (spawnQueue.length === 0 && bossQueue.length > 0) {
            // move bosses into spawn queue
            while (bossQueue.length > 0) spawnQueue.push(bossQueue.shift()!);
        }

        this.state.game.wavePlan = plan;
        this.state.game.spawnQueue = spawnQueue;
        this.state.game.bossQueue = bossQueue;

        // slower progression: compute waveRemaining as total items initially in queues
        const nonBossCount = spawnQueue.length;
        const bossCount = bossQueue.length;
        this.state.game.waveRemaining = nonBossCount + bossCount;

        this.state.game.waveSpawnTimer = 0;

        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        if (nextWaveBtn) {
            nextWaveBtn.disabled = true;
        }
    }

    public endWave(): void {
        this.state.game.inWave = false;
        this.state.game.wavePlan = null;
        this.state.game.spawnQueue = [];
        this.state.game.bossQueue = [];

        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        if (nextWaveBtn) {
            nextWaveBtn.disabled = false;
        }
        
        // Bonus for completing wave (reduced to slow progression)
        this.state.game.money += 4;
        // Advance to next wave so the button will start the subsequent wave
        this.state.game.wave++;
    }
}
