import Phaser from 'phaser';
import { DEFAULT_DIFFICULTY, DIFFICULTIES } from '../config';
import { GAME_HEIGHT, GAME_WIDTH, type DifficultyKey, type RunStats } from '../types';

interface EndSceneData {
  victory: boolean;
  score: number;
  highScore: number;
  difficulty?: DifficultyKey;
  stats?: RunStats;
}

export class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  create(data: EndSceneData): void {
    const difficulty = DIFFICULTIES[data.difficulty ?? DEFAULT_DIFFICULTY];
    const stats = data.stats ?? this.emptyStats(difficulty.baseHealth);
    const title = data.victory ? 'SURVIVAL COMPLETE' : 'BASE OVERRUN';
    const titleColor = data.victory ? '#aaffc9' : '#ff7070';

    this.cameras.main.setBackgroundColor('#030605');
    this.drawSignal(data.victory);

    this.add
      .text(GAME_WIDTH / 2, 140, title, {
        fontFamily: '"Courier New", monospace',
        fontSize: '38px',
        color: titleColor,
        align: 'center',
      })
      .setOrigin(0.5)
      .setShadow(0, 0, data.victory ? '#2effa1' : '#ff4040', 12);

    this.add
      .text(
        GAME_WIDTH / 2,
        356,
        [
          `SCORE ${data.score.toString().padStart(6, '0')}`,
          `HIGH  ${data.highScore.toString().padStart(6, '0')}`,
          `MODE  ${difficulty.label}`,
          '',
          data.victory ? 'AIRSPACE SECURED' : 'RADAR PICTURE LOST',
          '',
          `WAVE REACHED   ${stats.waveReached}`,
          `DRONES DELETED ${stats.dronesDestroyed}`,
          `RF DISRUPTS    ${stats.dronesJammed}`,
          `BASE IMPACTS   ${stats.baseImpacts}`,
          `BEST CHAIN     ${stats.bestStreak}`,
          `CLEAN WAVES    ${stats.cleanWaves}`,
          `FINAL BASE     ${stats.finalBaseHealth}/${stats.maxBaseHealth}`,
          '',
          'PRESS R OR CLICK TO RESTART',
        ],
        {
          fontFamily: '"Courier New", monospace',
          fontSize: '18px',
          color: '#86e9ff',
          align: 'center',
          lineSpacing: 5,
        },
      )
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('GameScene', { difficulty: difficulty.key }));
    this.input.keyboard?.once('keydown-R', () => this.scene.start('GameScene', { difficulty: difficulty.key }));
  }

  private emptyStats(maxBaseHealth: number): RunStats {
    return {
      waveReached: 1,
      dronesDestroyed: 0,
      dronesJammed: 0,
      baseImpacts: 0,
      bestStreak: 0,
      cleanWaves: 0,
      finalBaseHealth: maxBaseHealth,
      maxBaseHealth,
    };
  }

  private drawSignal(victory: boolean): void {
    const graphics = this.add.graphics();
    const color = victory ? 0x2effa1 : 0xff7070;
    graphics.lineStyle(2, color, 0.34);
    for (let radius = 80; radius <= 360; radius += 70) {
      graphics.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT - 60, radius);
    }
    graphics.lineStyle(1, 0x86e9ff, 0.24);
    for (let angle = -160; angle <= -20; angle += 20) {
      const radians = Phaser.Math.DegToRad(angle);
      graphics.lineBetween(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 60,
        GAME_WIDTH / 2 + Math.cos(radians) * 520,
        GAME_HEIGHT - 60 + Math.sin(radians) * 520,
      );
    }
  }
}
