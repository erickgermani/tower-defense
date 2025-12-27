// Wave management

import { State } from './state.js';
import { EnemyType } from './types.js';
import { clamp } from './utils.js';

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
        const enemyTypes = this.getEnemyTypesForWave(this.state.game.wave);
        
        // Slower progression: fewer additional enemies per wave
        this.state.game.waveRemaining = 8 + this.state.game.wave; // slower increase
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

    private getEnemyTypesForWave(wave: number): EnemyType[] {
        // Return a single enemy type per wave. Mapping:
        // waves 1-2 => BASIC, waves 3-4 => FAST, waves 5+ => TANK
        if (wave <= 2) return [EnemyType.BASIC];
        if (wave <= 4) return [EnemyType.FAST];
        return [EnemyType.TANK];
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
