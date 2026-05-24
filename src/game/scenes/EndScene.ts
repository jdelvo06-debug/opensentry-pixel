import Phaser from 'phaser';
import { DEFAULT_DIFFICULTY, DIFFICULTIES } from '../config';
import { GAME_HEIGHT, GAME_WIDTH, type DifficultyKey } from '../types';

interface EndSceneData {
  victory: boolean;
  score: number;
  highScore: number;
  difficulty?: DifficultyKey;
}

export class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  create(data: EndSceneData): void {
    const difficulty = DIFFICULTIES[data.difficulty ?? DEFAULT_DIFFICULTY];
    const title = data.victory ? 'SURVIVAL COMPLETE' : 'BASE OVERRUN';
    const titleColor = data.victory ? '#aaffc9' : '#ff7070';

    this.cameras.main.setBackgroundColor('#030605');
    this.drawSignal(data.victory);

    this.add
      .text(GAME_WIDTH / 2, 170, title, {
        fontFamily: '"Courier New", monospace',
        fontSize: '40px',
        color: titleColor,
        align: 'center',
      })
      .setOrigin(0.5)
      .setShadow(0, 0, data.victory ? '#2effa1' : '#ff4040', 12);

    this.add
      .text(
        GAME_WIDTH / 2,
        292,
        [
          `SCORE ${data.score.toString().padStart(6, '0')}`,
          `HIGH  ${data.highScore.toString().padStart(6, '0')}`,
          `MODE  ${difficulty.label}`,
          '',
          data.victory ? 'AIRSPACE SECURED' : 'RADAR PICTURE LOST',
          '',
          'PRESS R OR CLICK TO RESTART',
        ],
        {
          fontFamily: '"Courier New", monospace',
          fontSize: '22px',
          color: '#86e9ff',
          align: 'center',
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('GameScene', { difficulty: difficulty.key }));
    this.input.keyboard?.once('keydown-R', () => this.scene.start('GameScene', { difficulty: difficulty.key }));
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
