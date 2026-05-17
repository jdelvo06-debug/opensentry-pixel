import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../types';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#020706');
    this.drawGrid();

    this.add
      .text(GAME_WIDTH / 2, 142, 'OPENSENTRY PIXEL', {
        fontFamily: '"Courier New", monospace',
        fontSize: '44px',
        color: '#aaffc9',
        align: 'center',
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#2effa1', 12);

    this.add
      .text(GAME_WIDTH / 2, 202, 'DETECT. TRACK. IDENTIFY. DELETE.', {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#ffd36b',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        330,
        [
          'DEFEND THE BASE FROM FIVE WAVES OF DRONES',
          '',
          'MOUSE AIM  |  CLICK / SPACE FIRE',
          'MOUSE WHEEL / Q-E SWITCH WEAPONS',
          'OR CLICK HUD WEAPON BUTTONS',
          '',
          'PRESS ENTER OR CLICK STARTS ARCADE',
          'PRESS T FOR SLOW TUTORIAL',
        ],
        {
          fontFamily: '"Courier New", monospace',
          fontSize: '18px',
          color: '#86e9ff',
          align: 'center',
          lineSpacing: 7,
        },
      )
      .setOrigin(0.5);

    const startButton = this.add
      .text(GAME_WIDTH / 2, 432, '[ START ARCADE ]', {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#2effa1',
        align: 'center',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => this.scene.start('GameScene'));
    startButton.on('pointerover', () => startButton.setColor('#ffffff'));
    startButton.on('pointerout', () => startButton.setColor('#2effa1'));

    const tutorialButton = this.add
      .text(GAME_WIDTH / 2, 472, '[ SLOW TUTORIAL ]', {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#ffd36b',
        align: 'center',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    tutorialButton.on('pointerdown', () => this.scene.start('TutorialScene'));
    tutorialButton.on('pointerover', () => tutorialButton.setColor('#ffffff'));
    tutorialButton.on('pointerout', () => tutorialButton.setColor('#ffd36b'));

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 52, 132, 28, 0x18352a).setStrokeStyle(2, 0x2effa1);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 52, 'BASE ONLINE', {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#d8ffe2',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
    this.input.keyboard?.once('keydown-T', () => this.scene.start('TutorialScene'));
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x17372f, 0.65);
    for (let x = 0; x <= GAME_WIDTH; x += 40) {
      graphics.lineBetween(x, 80, x, GAME_HEIGHT);
    }
    for (let y = 80; y <= GAME_HEIGHT; y += 40) {
      graphics.lineBetween(0, y, GAME_WIDTH, y);
    }
    graphics.lineStyle(2, 0x2effa1, 0.4);
    graphics.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT - 52, 170);
    graphics.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT - 52, 300);
  }
}
