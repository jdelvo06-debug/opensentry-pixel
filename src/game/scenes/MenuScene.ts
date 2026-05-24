import Phaser from 'phaser';
import { DEFAULT_DIFFICULTY, DIFFICULTIES } from '../config';
import { GAME_HEIGHT, GAME_WIDTH, type DifficultyKey } from '../types';

const DIFFICULTY_ORDER: DifficultyKey[] = ['cadet', 'operator', 'nightmare'];

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty: DifficultyKey = DEFAULT_DIFFICULTY;
  private difficultyButtons: Partial<Record<DifficultyKey, Phaser.GameObjects.Text>> = {};

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
        296,
        [
          'DEFEND THE BASE FROM FIVE WAVES OF DRONES',
          '',
          'MOUSE AIM  |  CLICK / SPACE FIRE',
          'MOUSE WHEEL / Z-X SWITCH WEAPONS',
          'Q-E / HUD BUTTONS ALSO WORK',
          '',
          'SELECT DIFFICULTY, THEN START ARCADE',
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

    this.renderDifficultyButtons();

    const startButton = this.add
      .text(GAME_WIDTH / 2, 454, '[ START ARCADE ]', {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#2effa1',
        align: 'center',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => this.startArcade());
    startButton.on('pointerover', () => startButton.setColor('#ffffff'));
    startButton.on('pointerout', () => startButton.setColor('#2effa1'));

    const tutorialButton = this.add
      .text(GAME_WIDTH / 2, 494, '[ SLOW TUTORIAL ]', {
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

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => this.handleKey(event));
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.code === 'Enter') {
      this.startArcade();
      return;
    }

    if (event.code === 'KeyT') {
      this.scene.start('TutorialScene');
      return;
    }

    if (event.code === 'Digit1' || event.code === 'Numpad1') {
      this.selectDifficulty('cadet');
      return;
    }

    if (event.code === 'Digit2' || event.code === 'Numpad2') {
      this.selectDifficulty('operator');
      return;
    }

    if (event.code === 'Digit3' || event.code === 'Numpad3') {
      this.selectDifficulty('nightmare');
    }
  }

  private renderDifficultyButtons(): void {
    this.difficultyButtons = {};
    const startX = GAME_WIDTH / 2 - 245;
    for (const [index, key] of DIFFICULTY_ORDER.entries()) {
      const difficulty = DIFFICULTIES[key];
      const button = this.add
        .text(startX + index * 245, 388, this.formatDifficultyLabel(key), {
          fontFamily: '"Courier New", monospace',
          fontSize: '16px',
          color: '#86e9ff',
          align: 'center',
          lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      button.on('pointerdown', () => this.selectDifficulty(key));
      button.on('pointerover', () => button.setColor('#ffffff'));
      button.on('pointerout', () => this.refreshDifficultyButtons());
      this.difficultyButtons[key] = button;

      this.add
        .text(startX + index * 245, 418, difficulty.description.toUpperCase(), {
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          color: '#aaffc9',
          align: 'center',
        })
        .setOrigin(0.5);
    }

    this.refreshDifficultyButtons();
  }

  private selectDifficulty(difficulty: DifficultyKey): void {
    this.selectedDifficulty = difficulty;
    this.refreshDifficultyButtons();
  }

  private refreshDifficultyButtons(): void {
    for (const key of DIFFICULTY_ORDER) {
      const button = this.difficultyButtons[key];
      if (!button) {
        continue;
      }

      button.setText(this.formatDifficultyLabel(key));
      button.setColor(key === this.selectedDifficulty ? '#ffd36b' : '#86e9ff');
      button.setShadow(0, 0, key === this.selectedDifficulty ? '#ffd36b' : '#86e9ff', key === this.selectedDifficulty ? 8 : 3);
    }
  }

  private formatDifficultyLabel(key: DifficultyKey): string {
    const difficulty = DIFFICULTIES[key];
    const prefix = key === this.selectedDifficulty ? '>' : ' ';
    const suffix = key === this.selectedDifficulty ? '<' : ' ';
    return `${prefix} ${DIFFICULTY_ORDER.indexOf(key) + 1} ${difficulty.label} ${suffix}`;
  }

  private startArcade(): void {
    this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
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
