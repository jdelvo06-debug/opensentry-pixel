export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

export type WeaponKey = 'laser' | 'missile' | 'jammer' | 'hpm';
export type DroneKey = 'quadcopter' | 'micro' | 'fixedWing' | 'loitering';
export type KillMethod = 'destroyed' | 'jammed';
export type DifficultyKey = 'cadet' | 'operator' | 'nightmare';

export interface Point {
  x: number;
  y: number;
}

export interface DroneTypeConfig {
  key: DroneKey;
  label: string;
  maxHealth: number;
  speed: number;
  damage: number;
  score: number;
  size: number;
  color: number;
  accent: number;
  rfVulnerable: boolean;
  wobble: number;
  aggression: number;
}

export interface WaveSpawn {
  drone: DroneKey;
  count: number;
  intervalMs: number;
  delayMs: number;
}

export interface WaveDefinition {
  wave: number;
  spawns: WaveSpawn[];
  bonus: number;
}

export interface DifficultyConfig {
  key: DifficultyKey;
  label: string;
  description: string;
  baseHealth: number;
  droneHealthMultiplier: number;
  droneSpeedMultiplier: number;
  droneDamageMultiplier: number;
  waveTimingMultiplier: number;
  scoreMultiplier: number;
}

export interface WeaponStatus {
  selected: WeaponKey;
  laserHeat: number;
  laserOverheated: boolean;
  missileAmmo: number;
  missileMaxAmmo: number;
  missileReloadProgress: number;
  jammerCooldownProgress: number;
  hpmCooldownProgress: number;
}

export interface HudState {
  score: number;
  highScore: number;
  wave: number;
  health: number;
  maxHealth: number;
  difficultyLabel: string;
  message: string;
  weapons: WeaponStatus;
}

export interface RunStats {
  waveReached: number;
  dronesDestroyed: number;
  dronesJammed: number;
  baseImpacts: number;
  finalBaseHealth: number;
  maxBaseHealth: number;
}
