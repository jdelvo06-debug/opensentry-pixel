import { type DroneKey, type WaveDefinition } from '../types';

interface QueuedSpawn {
  drone: DroneKey;
  remainingMs: number;
}

export class WaveManager {
  private readonly waves: WaveDefinition[] = [
    {
      wave: 1,
      bonus: 500,
      spawns: [{ drone: 'quadcopter', count: 5, intervalMs: 1100, delayMs: 1800 }],
    },
    {
      wave: 2,
      bonus: 1000,
      spawns: [
        { drone: 'quadcopter', count: 6, intervalMs: 900, delayMs: 900 },
        { drone: 'micro', count: 4, intervalMs: 780, delayMs: 2600 },
      ],
    },
    {
      wave: 3,
      bonus: 1500,
      spawns: [
        { drone: 'quadcopter', count: 3, intervalMs: 920, delayMs: 700 },
        { drone: 'fixedWing', count: 5, intervalMs: 1050, delayMs: 1900 },
      ],
    },
    {
      wave: 4,
      bonus: 2000,
      spawns: [
        { drone: 'quadcopter', count: 5, intervalMs: 760, delayMs: 700 },
        { drone: 'micro', count: 4, intervalMs: 660, delayMs: 2200 },
        { drone: 'fixedWing', count: 3, intervalMs: 1050, delayMs: 3500 },
        { drone: 'loitering', count: 1, intervalMs: 1, delayMs: 6500 },
      ],
    },
    {
      wave: 5,
      bonus: 2500,
      spawns: [
        { drone: 'quadcopter', count: 5, intervalMs: 650, delayMs: 500 },
        { drone: 'micro', count: 6, intervalMs: 520, delayMs: 1700 },
        { drone: 'fixedWing', count: 5, intervalMs: 820, delayMs: 3400 },
        { drone: 'loitering', count: 2, intervalMs: 1800, delayMs: 6200 },
      ],
    },
  ];

  private waveIndex = 0;
  private queue: QueuedSpawn[] = [];
  private active = false;
  private completed = false;

  get currentWave(): number {
    return this.waves[Math.min(this.waveIndex, this.waves.length - 1)].wave;
  }

  get allWavesComplete(): boolean {
    return this.completed;
  }

  start(): void {
    this.waveIndex = 0;
    this.completed = false;
    this.startCurrentWave();
  }

  update(deltaMs: number, spawn: (drone: DroneKey) => void): void {
    if (!this.active) {
      return;
    }

    for (const item of this.queue) {
      item.remainingMs -= deltaMs;
    }

    const ready = this.queue.filter((item) => item.remainingMs <= 0);
    this.queue = this.queue.filter((item) => item.remainingMs > 0);
    for (const item of ready) {
      spawn(item.drone);
    }

    if (this.queue.length === 0) {
      this.active = false;
    }
  }

  tryAdvance(noActiveDrones: boolean): { advanced: boolean; bonus: number; complete: boolean } {
    if (this.active || !noActiveDrones || this.completed) {
      return { advanced: false, bonus: 0, complete: false };
    }

    const bonus = this.waves[this.waveIndex].bonus;
    this.waveIndex += 1;

    if (this.waveIndex >= this.waves.length) {
      this.completed = true;
      return { advanced: true, bonus, complete: true };
    }

    this.startCurrentWave();
    return { advanced: true, bonus, complete: false };
  }

  private startCurrentWave(): void {
    const wave = this.waves[this.waveIndex];
    this.queue = wave.spawns.flatMap((spawn) =>
      Array.from({ length: spawn.count }, (_, index) => ({
        drone: spawn.drone,
        remainingMs: spawn.delayMs + spawn.intervalMs * index,
      })),
    );
    this.active = true;
  }
}
