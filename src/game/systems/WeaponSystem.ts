import Phaser from 'phaser';
import { type Point, type WeaponKey, type WeaponStatus } from '../types';
import { Drone } from '../entities/Drone';
import { Missile } from '../entities/Missile';

export interface WeaponResult {
  message: string;
  destroyed: Drone[];
  jammed: Drone[];
}

const EMPTY_RESULT: WeaponResult = {
  message: '',
  destroyed: [],
  jammed: [],
};

export class WeaponSystem {
  selected: WeaponKey = 'laser';

  private readonly base: Point;
  private readonly missiles: Missile[] = [];
  private laserHeat = 0;
  private laserOverheatMs = 0;
  private missileAmmo = 3;
  private missileReloadMs = 0;
  private jammerCooldownMs = 0;
  private hpmCooldownMs = 0;

  constructor(base: Point) {
    this.base = base;
  }

  getStatus(): WeaponStatus {
    return {
      selected: this.selected,
      laserHeat: this.laserHeat,
      laserOverheated: this.laserOverheatMs > 0,
      missileAmmo: this.missileAmmo,
      missileMaxAmmo: 3,
      missileReloadProgress: this.missileAmmo > 0 ? 1 : 1 - this.missileReloadMs / 2600,
      jammerCooldownProgress: 1 - this.jammerCooldownMs / 5200,
      hpmCooldownProgress: 1 - this.hpmCooldownMs / 9800,
    };
  }

  select(weapon: WeaponKey): string {
    this.selected = weapon;
    return `SELECT ${weapon.toUpperCase()}`;
  }

  update(scene: Phaser.Scene, deltaMs: number, drones: Drone[]): WeaponResult {
    this.laserHeat = Math.max(0, this.laserHeat - deltaMs * 0.018);
    this.laserOverheatMs = Math.max(0, this.laserOverheatMs - deltaMs);
    this.jammerCooldownMs = Math.max(0, this.jammerCooldownMs - deltaMs);
    this.hpmCooldownMs = Math.max(0, this.hpmCooldownMs - deltaMs);

    if (this.missileAmmo <= 0) {
      this.missileReloadMs = Math.max(0, this.missileReloadMs - deltaMs);
      if (this.missileReloadMs <= 0) {
        this.missileAmmo = 3;
      }
    }

    const destroyed: Drone[] = [];
    for (const missile of this.missiles) {
      if (missile.update(deltaMs)) {
        this.explosion(scene, { x: missile.x, y: missile.y }, missile.radius, 0xffd36b);
        for (const drone of drones) {
          if (drone.active && drone.distanceTo(missile) <= missile.radius && drone.takeDamage(missile.damage)) {
            destroyed.push(drone);
          }
        }
      }
    }

    this.removeInactiveMissiles();

    return destroyed.length > 0
      ? { message: 'INTERCEPT CONFIRMED', destroyed, jammed: [] }
      : EMPTY_RESULT;
  }

  fire(scene: Phaser.Scene, cursor: Point, drones: Drone[]): WeaponResult {
    if (this.selected === 'laser') {
      return this.fireLaser(scene, cursor, drones);
    }

    if (this.selected === 'missile') {
      return this.fireMissile(scene, cursor, drones);
    }

    if (this.selected === 'jammer') {
      return this.fireJammer(scene, cursor, drones);
    }

    return this.fireHpm(scene, cursor, drones);
  }

  private fireLaser(scene: Phaser.Scene, cursor: Point, drones: Drone[]): WeaponResult {
    if (this.laserOverheatMs > 0) {
      return { message: 'LASER COOLING', destroyed: [], jammed: [] };
    }

    this.laserHeat += 24;
    if (this.laserHeat >= 100) {
      this.laserHeat = 100;
      this.laserOverheatMs = 1250;
    }

    const target = this.pickTarget(cursor, drones, 42) ?? this.pickLineTarget(cursor, drones);
    const endpoint = target ? { x: target.x, y: target.y } : cursor;
    this.beam(scene, this.base, endpoint, this.laserOverheatMs > 0 ? 0xff7070 : 0x86e9ff);

    if (!target) {
      return { message: 'LASER MISS', destroyed: [], jammed: [] };
    }

    const destroyed = target.takeDamage(36) ? [target] : [];
    return {
      message: destroyed.length > 0 ? 'TRACK DELETE' : 'LASER HIT',
      destroyed,
      jammed: [],
    };
  }

  private fireMissile(scene: Phaser.Scene, cursor: Point, drones: Drone[]): WeaponResult {
    if (this.missileAmmo <= 0) {
      return { message: 'INTERCEPTOR RELOADING', destroyed: [], jammed: [] };
    }

    this.missileAmmo -= 1;
    if (this.missileAmmo === 0) {
      this.missileReloadMs = 2600;
    }

    const target = this.pickTarget(cursor, drones, 115) ?? this.pickNearest(drones);
    const destination = target ? { x: target.x, y: target.y } : cursor;
    this.missiles.push(new Missile(scene, this.base, destination, target));

    return { message: 'INTERCEPTOR AWAY', destroyed: [], jammed: [] };
  }

  private fireJammer(scene: Phaser.Scene, cursor: Point, drones: Drone[]): WeaponResult {
    if (this.jammerCooldownMs > 0) {
      return { message: 'JAMMER CHARGING', destroyed: [], jammed: [] };
    }

    this.jammerCooldownMs = 5200;
    this.pulse(scene, cursor, 122, 0x49ffc4);

    const jammed = drones.filter((drone) => drone.active && drone.distanceTo(cursor) <= 122 && drone.applyJam());
    return {
      message: jammed.length > 0 ? 'RF LINK DISRUPTED' : 'NO RF EFFECT',
      destroyed: [],
      jammed,
    };
  }

  private fireHpm(scene: Phaser.Scene, cursor: Point, drones: Drone[]): WeaponResult {
    if (this.hpmCooldownMs > 0) {
      return { message: 'HPM CHARGING', destroyed: [], jammed: [] };
    }

    this.hpmCooldownMs = 9800;
    this.pulse(scene, cursor, 190, 0xffffff);
    this.explosion(scene, cursor, 190, 0x86e9ff);

    const destroyed: Drone[] = [];
    for (const drone of drones) {
      if (drone.active && drone.distanceTo(cursor) <= 190 && drone.takeDamage(95)) {
        destroyed.push(drone);
      }
    }

    return {
      message: destroyed.length > 0 ? 'HPM BURST EFFECTIVE' : 'HPM BURST CLEAR',
      destroyed,
      jammed: [],
    };
  }

  private pickTarget(cursor: Point, drones: Drone[], radius: number): Drone | null {
    return drones
      .filter((drone) => drone.active && drone.distanceTo(cursor) <= radius)
      .sort((a, b) => a.distanceTo(cursor) - b.distanceTo(cursor))[0] ?? null;
  }

  private pickNearest(drones: Drone[]): Drone | null {
    return drones
      .filter((drone) => drone.active)
      .sort((a, b) => a.distanceTo(this.base) - b.distanceTo(this.base))[0] ?? null;
  }

  private pickLineTarget(cursor: Point, drones: Drone[]): Drone | null {
    const candidates = drones.filter((drone) => drone.active);
    return candidates
      .map((drone) => ({
        drone,
        distance: this.distanceToSegment({ x: drone.x, y: drone.y }, this.base, cursor),
      }))
      .filter((candidate) => candidate.distance < 24)
      .sort((a, b) => a.distance - b.distance)[0]?.drone ?? null;
  }

  private distanceToSegment(point: Point, start: Point, end: Point): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq));
    const x = start.x + t * dx;
    const y = start.y + t * dy;
    return Math.hypot(point.x - x, point.y - y);
  }

  private beam(scene: Phaser.Scene, start: Point, end: Point, color: number): void {
    const line = scene.add.graphics();
    line.lineStyle(4, color, 0.95);
    line.lineBetween(start.x, start.y, end.x, end.y);
    line.lineStyle(1, 0xffffff, 0.85);
    line.lineBetween(start.x, start.y, end.x, end.y);
    scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 110,
      onComplete: () => line.destroy(),
    });
  }

  private pulse(scene: Phaser.Scene, center: Point, radius: number, color: number): void {
    const ring = scene.add.circle(center.x, center.y, 10);
    ring.setStrokeStyle(4, color, 0.9);
    scene.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration: 420,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private explosion(scene: Phaser.Scene, center: Point, radius: number, color: number): void {
    const flash = scene.add.circle(center.x, center.y, 8, color, 0.35);
    flash.setStrokeStyle(2, 0xffffff, 0.9);
    scene.tweens.add({
      targets: flash,
      radius,
      alpha: 0,
      duration: 260,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  private removeInactiveMissiles(): void {
    for (let index = this.missiles.length - 1; index >= 0; index -= 1) {
      if (!this.missiles[index].active) {
        this.missiles.splice(index, 1);
      }
    }
  }
}
