import Phaser from 'phaser';
import { DRONE_TYPES } from '../config';
import { Drone } from '../entities/Drone';
import { Hud } from '../systems/Hud';
import { WeaponSystem, type WeaponResult } from '../systems/WeaponSystem';
import { GAME_HEIGHT, GAME_WIDTH, type DroneKey, type Point, type WeaponKey } from '../types';

interface TutorialStep {
  title: string;
  lines: string[];
  weapon?: WeaponKey;
  targetWeapon?: WeaponKey;
  drone?: DroneKey;
  spawn?: Point;
  completeMessage: string;
}

const STEPS: TutorialStep[] = [
  {
    title: 'STEP 1 / LASER',
    lines: ['Move the mouse to aim the crosshair.', 'Click or press SPACE to fire the laser.', 'Delete the quadcopter before it reaches base.'],
    weapon: 'laser',
    drone: 'quadcopter',
    spawn: { x: GAME_WIDTH / 2, y: 128 },
    completeMessage: 'Good kill. Laser is your precise direct-fire tool.',
  },
  {
    title: 'STEP 2 / SWITCH WEAPONS',
    lines: ['Cycle weapons with mouse wheel or Z / X.', 'Q / E and HUD weapon buttons still work too.', 'Select INTERCEPTOR to continue.'],
    targetWeapon: 'missile',
    completeMessage: 'Interceptor selected. Big splash, limited ammo.',
  },
  {
    title: 'STEP 3 / INTERCEPTOR',
    lines: ['Aim near the fixed-wing drone.', 'Fire an interceptor and let it track.', 'Useful when drones are moving fast or clustered.'],
    weapon: 'missile',
    drone: 'fixedWing',
    spawn: { x: GAME_WIDTH / 2 + 170, y: 122 },
    completeMessage: 'Interceptor away. That one had ambition. Briefly.',
  },
  {
    title: 'STEP 4 / JAMMER',
    lines: ['Select JAMMER.', 'Aim near the micro drone and fire.', 'RF-vulnerable drones tumble out instead of exploding.'],
    weapon: 'jammer',
    drone: 'micro',
    spawn: { x: GAME_WIDTH / 2 - 150, y: 126 },
    completeMessage: 'RF link disrupted. Elegant, quiet, rude.',
  },
  {
    title: 'STEP 5 / HPM BURST',
    lines: ['Select HPM.', 'Aim at the small swarm and fire.', 'Use it as an emergency clear, not a primary weapon.'],
    weapon: 'hpm',
    completeMessage: 'Swarm cleared. HPM is the panic button with better branding.',
  },
];

export class TutorialScene extends Phaser.Scene {
  private readonly base: Point = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 48 };
  private readonly cursor: Point = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
  private drones: Drone[] = [];
  private hud!: Hud;
  private weaponSystem!: WeaponSystem;
  private crosshair!: Phaser.GameObjects.Graphics;
  private overlay!: Phaser.GameObjects.Text;
  private stepIndex = 0;
  private stepComplete = false;
  private score = 0;
  private baseHealth = 100;
  private message = 'TRAINING RANGE ONLINE';

  constructor() {
    super('TutorialScene');
  }

  create(): void {
    this.drones = [];
    this.stepIndex = 0;
    this.stepComplete = false;
    this.score = 0;
    this.baseHealth = 100;
    this.message = 'TRAINING RANGE ONLINE';
    this.hud = new Hud();
    this.weaponSystem = new WeaponSystem(this.base);

    this.cameras.main.setBackgroundColor('#020706');
    this.drawPlayfield();
    this.drawBase();
    this.crosshair = this.add.graphics();

    this.overlay = this.add
      .text(GAME_WIDTH / 2, 124, '', {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#d8ffe2',
        align: 'center',
        lineSpacing: 6,
        backgroundColor: '#06100dcc',
        padding: { x: 18, y: 14 },
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setStroke('#2effa1', 1);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.cursor.x = Phaser.Math.Clamp(pointer.x, 0, GAME_WIDTH);
      this.cursor.y = Phaser.Math.Clamp(pointer.y, 82, GAME_HEIGHT);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.stepComplete) {
        this.advanceStep();
        return;
      }

      if (pointer.leftButtonDown()) {
        this.fireSelectedWeapon();
      }
    });

    const gameShell = document.getElementById('game-shell');
    if (gameShell) {
      gameShell.onwheel = (event) => {
        event.preventDefault();
        this.cycleWeapon(event.deltaY > 0 ? 1 : -1);
      };
    }

    document.querySelectorAll<HTMLElement>('[data-weapon]').forEach((element) => {
      element.onclick = () => this.selectWeapon(element.dataset.weapon as WeaponKey);
    });

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => this.handleKey(event));
    this.startStep(0);
  }

  update(timeMs: number, deltaMs: number): void {
    this.drawCrosshair();
    this.applyWeaponResult(this.weaponSystem.update(this, deltaMs, this.drones));

    for (const drone of this.drones) {
      const result = drone.update(timeMs, deltaMs * 0.35, this.base);
      if (result.impactDamage) {
        this.baseHealth = Math.max(0, this.baseHealth - Math.round(result.impactDamage * 0.5));
        this.message = 'TRAINING HIT — KEEP WORKING';
        this.baseImpactEffect();
      }
    }

    this.drones = this.drones.filter((drone) => drone.active);
    this.checkStepProgress();
    this.updateHud();
  }

  private handleKey(event: KeyboardEvent): void {
    const weaponMap: Record<string, WeaponKey> = {
      Digit1: 'laser',
      Numpad1: 'laser',
      Digit2: 'missile',
      Numpad2: 'missile',
      Digit3: 'jammer',
      Numpad3: 'jammer',
      Digit4: 'hpm',
      Numpad4: 'hpm',
    };

    if (event.code in weaponMap) {
      this.selectWeapon(weaponMap[event.code]);
      return;
    }

    if (event.code === 'KeyZ' || event.code === 'KeyQ' || event.code === 'BracketLeft') {
      this.cycleWeapon(-1);
      return;
    }

    if (event.code === 'KeyX' || event.code === 'KeyE' || event.code === 'BracketRight') {
      this.cycleWeapon(1);
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      if (this.stepComplete) {
        this.advanceStep();
      } else {
        this.fireSelectedWeapon();
      }
      return;
    }

    if (event.code === 'Enter' && this.stepComplete) {
      this.advanceStep();
    }
  }

  private startStep(index: number): void {
    this.drones.forEach((drone) => drone.destroy());
    this.drones = [];
    this.stepIndex = index;
    this.stepComplete = false;

    const step = STEPS[this.stepIndex];
    if (!step) {
      this.scene.start('GameScene');
      return;
    }

    if (step.weapon) {
      this.weaponSystem.select(step.weapon);
    }

    if (step.drone && step.spawn) {
      this.spawnDrone(step.drone, step.spawn);
    }

    if (step.title.includes('HPM')) {
      this.spawnDrone('quadcopter', { x: GAME_WIDTH / 2 - 90, y: 130 });
      this.spawnDrone('micro', { x: GAME_WIDTH / 2, y: 104 });
      this.spawnDrone('quadcopter', { x: GAME_WIDTH / 2 + 90, y: 130 });
    }

    this.message = step.title;
    this.renderOverlay();
    this.updateHud();
  }

  private advanceStep(): void {
    if (this.stepIndex >= STEPS.length - 1) {
      this.scene.start('GameScene');
      return;
    }

    this.startStep(this.stepIndex + 1);
  }

  private checkStepProgress(): void {
    if (this.stepComplete) {
      return;
    }

    const step = STEPS[this.stepIndex];
    if (step.targetWeapon && this.weaponSystem.selected === step.targetWeapon) {
      this.completeStep();
      return;
    }

    if (step.drone && this.drones.length === 0) {
      this.completeStep();
      return;
    }

    if (step.title.includes('HPM') && this.drones.length === 0) {
      this.completeStep();
    }
  }

  private completeStep(): void {
    this.stepComplete = true;
    this.message = 'TUTORIAL STEP COMPLETE';
    this.renderOverlay();
  }

  private renderOverlay(): void {
    const step = STEPS[this.stepIndex];
    const footer = this.stepComplete ? ['', step.completeMessage, '', 'PRESS ENTER / SPACE OR CLICK TO CONTINUE'] : ['', 'Take your time. No wave timer here.'];
    this.overlay.setText([step.title, '', ...step.lines, ...footer].join('\n'));
  }

  private selectWeapon(weapon: WeaponKey): void {
    this.message = this.weaponSystem.select(weapon);
    this.checkStepProgress();
    this.updateHud();
  }

  private cycleWeapon(direction: -1 | 1): void {
    const order: WeaponKey[] = ['laser', 'missile', 'jammer', 'hpm'];
    const currentIndex = order.indexOf(this.weaponSystem.selected);
    const nextIndex = (currentIndex + direction + order.length) % order.length;
    this.selectWeapon(order[nextIndex]);
  }

  private fireSelectedWeapon(): void {
    this.applyWeaponResult(this.weaponSystem.fire(this, this.cursor, this.drones));
    this.updateHud();
  }

  private applyWeaponResult(result: WeaponResult): void {
    if (result.message) {
      this.message = result.message;
    }

    for (const drone of result.destroyed) {
      this.score += drone.type.score;
      this.explosion({ x: drone.x, y: drone.y }, drone.type.color);
    }

    for (const drone of result.jammed) {
      this.score += Math.round(drone.type.score * 0.75);
    }
  }

  private spawnDrone(key: DroneKey, spawn: Point): void {
    this.drones.push(new Drone(this, DRONE_TYPES[key], spawn));
  }

  private updateHud(): void {
    this.hud.update({
      score: this.score,
      highScore: 0,
      wave: this.stepIndex + 1,
      health: this.baseHealth,
      maxHealth: 100,
      difficultyLabel: 'TRAINING',
      message: this.message,
      weapons: this.weaponSystem.getStatus(),
    });
  }

  private drawPlayfield(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x17372f, 0.48);
    for (let x = 0; x <= GAME_WIDTH; x += 40) {
      graphics.lineBetween(x, 82, x, GAME_HEIGHT);
    }
    for (let y = 82; y <= GAME_HEIGHT; y += 40) {
      graphics.lineBetween(0, y, GAME_WIDTH, y);
    }

    graphics.lineStyle(2, 0x2effa1, 0.28);
    graphics.strokeCircle(this.base.x, this.base.y, 150);
    graphics.strokeCircle(this.base.x, this.base.y, 275);
    graphics.strokeCircle(this.base.x, this.base.y, 410);
  }

  private drawBase(): void {
    const base = this.add.graphics();
    base.fillStyle(0x18352a, 1);
    base.fillRect(this.base.x - 64, this.base.y - 17, 128, 34);
    base.fillStyle(0x2effa1, 1);
    base.fillRect(this.base.x - 42, this.base.y - 31, 84, 14);
    base.lineStyle(2, 0xd8ffe2, 1);
    base.strokeRect(this.base.x - 64, this.base.y - 17, 128, 34);
    base.strokeRect(this.base.x - 42, this.base.y - 31, 84, 14);
    this.add.rectangle(this.base.x, GAME_HEIGHT - 12, GAME_WIDTH, 10, 0x101612, 1);
  }

  private drawCrosshair(): void {
    this.crosshair.clear();
    this.crosshair.lineStyle(1, 0xffffff, 0.72);
    this.crosshair.strokeCircle(this.cursor.x, this.cursor.y, 12);
    this.crosshair.lineBetween(this.cursor.x - 20, this.cursor.y, this.cursor.x - 8, this.cursor.y);
    this.crosshair.lineBetween(this.cursor.x + 8, this.cursor.y, this.cursor.x + 20, this.cursor.y);
    this.crosshair.lineBetween(this.cursor.x, this.cursor.y - 20, this.cursor.x, this.cursor.y - 8);
    this.crosshair.lineBetween(this.cursor.x, this.cursor.y + 8, this.cursor.x, this.cursor.y + 20);
  }

  private explosion(point: Point, color: number): void {
    const blast = this.add.circle(point.x, point.y, 8, color, 0.9);
    blast.setStrokeStyle(2, 0xffffff, 0.85);
    this.tweens.add({
      targets: blast,
      radius: 38,
      alpha: 0,
      duration: 220,
      ease: 'Cubic.easeOut',
      onComplete: () => blast.destroy(),
    });
  }

  private baseImpactEffect(): void {
    this.cameras.main.shake(120, 0.006);
    const flash = this.add.rectangle(this.base.x, this.base.y, 150, 42, 0xff7070, 0.24);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 180,
      onComplete: () => flash.destroy(),
    });
  }
}
