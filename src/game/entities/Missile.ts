import Phaser from 'phaser';
import { type Point } from '../types';
import { Drone } from './Drone';

export class Missile {
  readonly radius = 58;
  readonly damage = 88;

  private readonly scene: Phaser.Scene;
  private readonly marker: Phaser.GameObjects.Graphics;
  private readonly target: Drone | null;
  private destination: Point;
  private inactive = false;
  private smokeTimerMs = 0;

  constructor(scene: Phaser.Scene, start: Point, destination: Point, target: Drone | null) {
    this.scene = scene;
    this.destination = { ...destination };
    this.target = target;
    this.marker = scene.add.graphics({ x: start.x, y: start.y });
    this.draw();
  }

  get active(): boolean {
    return !this.inactive;
  }

  get x(): number {
    return this.marker.x;
  }

  get y(): number {
    return this.marker.y;
  }

  update(deltaMs: number): boolean {
    if (this.inactive) {
      return false;
    }

    if (this.target?.active) {
      this.destination = { x: this.target.x, y: this.target.y };
    }

    const dt = deltaMs / 1000;
    const dx = this.destination.x - this.marker.x;
    const dy = this.destination.y - this.marker.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const step = 360 * dt;

    this.marker.x += (dx / distance) * Math.min(step, distance);
    this.marker.y += (dy / distance) * Math.min(step, distance);
    this.marker.rotation = Math.atan2(dy, dx) + Math.PI / 2;

    this.smokeTimerMs -= deltaMs;
    if (this.smokeTimerMs <= 0) {
      this.smokeTimerMs = 55;
      this.leaveSmoke();
    }

    if (distance <= 12) {
      this.destroy();
      return true;
    }

    return false;
  }

  destroy(): void {
    if (this.inactive) {
      return;
    }

    this.inactive = true;
    this.marker.destroy();
  }

  private draw(): void {
    this.marker.clear();
    this.marker.fillStyle(0xffffff, 1);
    this.marker.fillTriangle(0, -10, -5, 7, 5, 7);
    this.marker.lineStyle(2, 0xffd36b, 1);
    this.marker.strokeTriangle(0, -10, -5, 7, 5, 7);
  }

  private leaveSmoke(): void {
    const smoke = this.scene.add.circle(this.marker.x, this.marker.y, 4, 0xa8b2aa, 0.45);
    this.scene.tweens.add({
      targets: smoke,
      alpha: 0,
      scale: 2.2,
      duration: 420,
      onComplete: () => smoke.destroy(),
    });
  }
}
