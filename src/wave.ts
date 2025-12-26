// Wave management

import { State } from './state.js';
import { EnemyType, WavePlan } from './types.js';
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
        
        this.state.game.waveRemaining = 8 + this.state.game.wave * 2;
        this.state.game.waveSpawnTimer = 0;
        this.state.game.wavePlan = {
            interval: clamp(0.75 - this.state.game.wave * 0.03, 0.35, 0.75),
            enemyTypes
        };

        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        if (nextWaveBtn) {
            nextWaveBtn.disabled = true;
        }
    }

    private getEnemyTypesForWave(wave: number): EnemyType[] {
        const types: EnemyType[] = [EnemyType.BASIC];
        
        // Introduce fast enemies from wave 2
        if (wave >= 2) {
            types.push(EnemyType.FAST);
        }
        
        // Introduce tank enemies from wave 4
        if (wave >= 4) {
            types.push(EnemyType.TANK);
        }
        
        return types;
    }

    public endWave(): void {
        this.state.game.inWave = false;
        this.state.game.wavePlan = null;
        
        const nextWaveBtn = document.getElementById("nextWave") as HTMLButtonElement;
        if (nextWaveBtn) {
            nextWaveBtn.disabled = false;
        }
        
        // Bonus for completing wave
        this.state.game.money += 10;
    }
}
