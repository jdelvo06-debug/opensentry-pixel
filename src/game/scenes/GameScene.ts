import Phaser from 'phaser';
import { DRONE_TYPES, HIGH_SCORE_KEY } from '../config';
import { Drone } from '../entities/Drone';
import { Hud } from '../systems/Hud';
import { WaveManager } from '../systems/WaveManager';
import { WeaponSystem, type WeaponResult } from '../systems/WeaponSystem';
import { GAME_HEIGHT, GAME_WIDTH, type DroneKey, type Point, type WeaponKey } from '../types';

const WEAPON_ORDER: WeaponKey[] = ['laser', 'missile', 'jammer', 'hpm'];

export class GameScene extends Phaser.Scene {
  private readonly base: Point = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 48 };
  private readonly cursor: Point = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
  private drones: Drone[] = [];
  private hud!: Hud;
  private waveManager!: WaveManager;
  private weaponSystem!: WeaponSystem;
  private crosshair!: Phaser.GameObjects.Graphics;
  private score = 0;
  private highScore = 0;
  private baseHealth = 100;
  private message = 'RADAR CONTACT';
  private paused = false;
  private ended = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.drones = [];
    this.score = 0;
    this.baseHealth = 100;
    this.message = 'RADAR CONTACT';
    this.paused = false;
    this.ended = false;
    this.highScore = this.readHighScore();
    this.hud = new Hud();
    this.waveManager = new WaveManager();
    this.weaponSystem = new WeaponSystem(this.base);

    this.cameras.main.setBackgroundColor('#020706');
    this.drawPlayfield();
    this.drawBase();
    this.crosshair = this.add.graphics();
    this.waveManager.start();

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.cursor.x = Phaser.Math.Clamp(pointer.x, 0, GAME_WIDTH);
      this.cursor.y = Phaser.Math.Clamp(pointer.y, 82, GAME_HEIGHT);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
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
    this.updateHud();
  }

  update(timeMs: number, deltaMs: number): void {
    if (this.ended) {
      return;
    }

    this.drawCrosshair();

    if (this.paused) {
      this.updateHud();
      return;
    }

    const delta = Math.min(deltaMs, 50);
    this.waveManager.update(delta, (drone) => this.spawnDrone(drone));
    this.applyWeaponResult(this.weaponSystem.update(this, delta, this.drones));

    for (const drone of this.drones) {
      const result = drone.update(timeMs, delta, this.base);
      if (result.impactDamage) {
        this.baseHealth = Math.max(0, this.baseHealth - result.impactDamage);
        this.message = 'BASE IMPACT';
        this.baseImpactEffect();
      } else if (result.crashed) {
        this.message = 'RF KILL CONFIRMED';
      }
    }

    this.drones = this.drones.filter((drone) => drone.active);

    if (this.baseHealth <= 0) {
      this.finish(false);
      return;
    }

    const waveResult = this.waveManager.tryAdvance(this.drones.length === 0);
    if (waveResult.advanced) {
      this.score += waveResult.bonus;
      this.message = waveResult.complete ? 'AIRSPACE SECURED' : `WAVE BONUS ${waveResult.bonus}`;
    }

    if (waveResult.complete) {
      this.finish(true);
      return;
    }

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

    if (event.code === 'KeyQ' || event.code === 'BracketLeft') {
      this.cycleWeapon(-1);
      return;
    }

    if (event.code === 'KeyE' || event.code === 'BracketRight') {
      this.cycleWeapon(1);
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      this.fireSelectedWeapon();
      return;
    }

    if (event.code === 'KeyP') {
      this.paused = !this.paused;
      this.message = this.paused ? 'PAUSED' : 'RADAR ONLINE';
    }
  }

  private selectWeapon(weapon: WeaponKey): void {
    this.message = this.weaponSystem.select(weapon);
    this.updateHud();
  }

  private cycleWeapon(direction: -1 | 1): void {
    const currentIndex = WEAPON_ORDER.indexOf(this.weaponSystem.selected);
    const nextIndex = (currentIndex + direction + WEAPON_ORDER.length) % WEAPON_ORDER.length;
    this.selectWeapon(WEAPON_ORDER[nextIndex]);
  }

  private fireSelectedWeapon(): void {
    if (this.paused || this.ended) {
      return;
    }

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

    this.highScore = Math.max(this.highScore, this.score);
  }

  private spawnDrone(key: DroneKey): void {
    const spawn = this.pickSpawnPoint();
    const drone = new Drone(this, DRONE_TYPES[key], spawn);
    this.drones.push(drone);
    this.message = `${DRONE_TYPES[key].label} CONTACT`;
  }

  private pickSpawnPoint(): Point {
    const edge = Phaser.Math.Between(0, 4);
    if (edge === 0) {
      return { x: Phaser.Math.Between(20, GAME_WIDTH - 20), y: -28 };
    }

    if (edge <= 2) {
      return { x: -30, y: Phaser.Math.Between(88, 260) };
    }

    return { x: GAME_WIDTH + 30, y: Phaser.Math.Between(88, 260) };
  }

  private finish(victory: boolean): void {
    this.ended = true;
    this.highScore = Math.max(this.highScore, this.score);
    localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    this.scene.start('EndScene', {
      victory,
      score: this.score,
      highScore: this.highScore,
    });
  }

  private updateHud(): void {
    this.hud.update({
      score: this.score,
      highScore: this.highScore,
      wave: this.waveManager.currentWave,
      health: this.baseHealth,
      message: this.message,
      weapons: this.weaponSystem.getStatus(),
    });
  }

  private readHighScore(): number {
    const stored = Number(localStorage.getItem(HIGH_SCORE_KEY));
    return Number.isFinite(stored) ? stored : 0;
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
