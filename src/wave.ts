// Wave management

import { State } from './state.js';
import { EnemyType } from './types.js';
import { clamp } from './utils.js';

export function getEnemyTypesForWave(wave: number): EnemyType[] {
    if (wave == 1) return [EnemyType.BASIC, EnemyType.BASIC];
    if (wave == 2) return [EnemyType.BASIC, EnemyType.FAST];
    if (wave == 3) return [EnemyType.BASIC, EnemyType.TANK];
    if (wave == 4) return [EnemyType.FLYER, EnemyType.FLYER];
    if (wave == 5) return [EnemyType.FAST, EnemyType.TANK];
    if (wave == 6) return [EnemyType.FLYER, EnemyType.TANK];
    if (wave == 7) return [EnemyType.TANK, EnemyType.TANK];
    if (wave == 8) return [EnemyType.BASIC, EnemyType.BASIC];
    if (wave == 9) return [EnemyType.FAST, EnemyType.FLYER];

    if (wave % 3 == 0) {
        return [EnemyType.FAST, EnemyType.TANK];
    }

    if (wave % 2 == 0) {
        return [EnemyType.FAST, EnemyType.BASIC];
    }

    return [EnemyType.BASIC, EnemyType.BASIC];
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

        this.state.game.wave++;
        this.state.game.inWave = true;

        // Create wave plan with different enemy types
        const enemyTypes = getEnemyTypesForWave(this.state.game.wave);

        // Slower progression: fewer additional enemies per wave
        this.state.game.waveRemaining = 8 + this.state.game.wave; // slower increase

        if (this.state.game.wave % 2 == 0) {
            this.state.game.waveRemaining += 2; // small bonus every 2 waves
        }

        this.state.game.waveSpawnTimer = 0;
        this.state.game.wavePlan = {
            // spawn interval decays more slowly and has a higher lower bound
            interval: clamp(0.75 - this.state.game.wave * 0.02, 0.45, 0.75),
            enemyTypes
        };

        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        if (nextWaveBtn) {
            nextWaveBtn.disabled = true;
        }
    }

    public endWave(): void {
        this.state.game.inWave = false;
        this.state.game.wavePlan = null;
        
        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        if (nextWaveBtn) {
            nextWaveBtn.disabled = false;
        }
        
        // Bonus for completing wave (reduced to slow progression)
        this.state.game.money += 4;
    }
}
