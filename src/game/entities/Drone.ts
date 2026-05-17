import Phaser from 'phaser';
import { GAME_HEIGHT, type DroneTypeConfig, type KillMethod, type Point } from '../types';

export interface DroneUpdateResult {
  impactDamage?: number;
  crashed?: boolean;
}

let nextDroneId = 1;

export class Drone {
  readonly id = nextDroneId;
  readonly type: DroneTypeConfig;
  readonly sprite: Phaser.GameObjects.Container;

  private readonly body: Phaser.GameObjects.Graphics;
  private readonly wobbleSeed: number;
  private health: number;
  private jammed = false;
  private crashTimerMs = 0;
  private inactive = false;
  private lastKillMethod: KillMethod | null = null;

  constructor(scene: Phaser.Scene, type: DroneTypeConfig, spawn: Point) {
    nextDroneId += 1;
    this.type = type;
    this.health = type.maxHealth;
    this.wobbleSeed = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.body = scene.add.graphics();
    this.sprite = scene.add.container(spawn.x, spawn.y, [this.body]);
    this.draw();
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  get active(): boolean {
    return !this.inactive;
  }

  get killMethod(): KillMethod | null {
    return this.lastKillMethod;
  }

  update(timeMs: number, deltaMs: number, base: Point): DroneUpdateResult {
    if (this.inactive) {
      return {};
    }

    const dt = deltaMs / 1000;

    if (this.jammed) {
      this.crashTimerMs -= deltaMs;
      this.sprite.rotation += dt * 7;
      this.sprite.x += Math.sin(timeMs * 0.012 + this.wobbleSeed) * 60 * dt;
      this.sprite.y += this.type.speed * 1.65 * dt;

      if (this.crashTimerMs <= 0 && this.sprite.y > GAME_HEIGHT + 36) {
        this.destroy();
        return { crashed: true };
      }

      return {};
    }

    const dx = base.x - this.sprite.x;
    const dy = base.y - this.sprite.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const nx = dx / distance;
    const ny = dy / distance;
    const wave = Math.sin(timeMs * 0.001 * this.type.wobble + this.wobbleSeed);
    const speedBoost = this.type.key === 'loitering' && this.sprite.y > GAME_HEIGHT * 0.48 ? this.type.aggression : 1;

    this.sprite.x += (nx * this.type.speed * speedBoost + -ny * wave * 24) * dt;
    this.sprite.y += (ny * this.type.speed * speedBoost + nx * wave * 24) * dt;
    this.sprite.rotation = Math.atan2(ny, nx) + Math.PI / 2;

    if (distance <= this.type.size + 26) {
      const damage = this.type.damage;
      this.destroy();
      return { impactDamage: damage };
    }

    return {};
  }

  takeDamage(amount: number): boolean {
    if (this.inactive || this.jammed) {
      return false;
    }

    this.health -= amount;
    this.flash();

    if (this.health <= 0) {
      this.lastKillMethod = 'destroyed';
      this.destroy();
      return true;
    }

    return false;
  }

  applyJam(): boolean {
    if (this.inactive || this.jammed || !this.type.rfVulnerable) {
      return false;
    }

    this.jammed = true;
    this.lastKillMethod = 'jammed';
    this.crashTimerMs = Phaser.Math.Between(650, 1150);
    this.body.setAlpha(0.68);
    return true;
  }

  distanceTo(point: Point): number {
    return Math.hypot(this.sprite.x - point.x, this.sprite.y - point.y);
  }

  destroy(): void {
    if (this.inactive) {
      return;
    }

    this.inactive = true;
    this.sprite.destroy();
  }

  private flash(): void {
    this.sprite.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.35,
      yoyo: true,
      duration: 55,
      repeat: 1,
    });
  }

  private draw(): void {
    const size = this.type.size;
    this.body.clear();
    this.body.lineStyle(2, this.type.accent, 0.9);
    this.body.fillStyle(this.type.color, 0.95);

    if (this.type.key === 'fixedWing') {
      this.body.fillTriangle(0, -size, -size * 1.2, size * 0.65, size * 1.2, size * 0.65);
      this.body.strokeTriangle(0, -size, -size * 1.2, size * 0.65, size * 1.2, size * 0.65);
      return;
    }

    if (this.type.key === 'loitering') {
      this.body.fillRect(-size * 0.65, -size, size * 1.3, size * 2);
      this.body.strokeRect(-size * 0.65, -size, size * 1.3, size * 2);
      this.body.lineBetween(-size, 0, size, 0);
      return;
    }

    this.body.fillRect(-size * 0.55, -size * 0.55, size * 1.1, size * 1.1);
    this.body.strokeRect(-size * 0.55, -size * 0.55, size * 1.1, size * 1.1);

    if (this.type.key === 'quadcopter') {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          this.body.strokeCircle(sx * size, sy * size, size * 0.35);
        }
      }
      return;
    }

    this.body.fillCircle(0, 0, size * 0.72);
    this.body.strokeCircle(0, 0, size * 0.72);
  }
}
