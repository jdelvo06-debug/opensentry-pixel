import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, type DroneKey, type DroneTypeConfig } from './types';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#020706',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export const DRONE_TYPES: Record<DroneKey, DroneTypeConfig> = {
  quadcopter: {
    key: 'quadcopter',
    label: 'QUADCOPTER',
    maxHealth: 35,
    speed: 58,
    damage: 9,
    score: 100,
    size: 16,
    color: 0x70ff98,
    accent: 0xd8ffe2,
    rfVulnerable: true,
    wobble: 2.2,
    aggression: 1,
  },
  micro: {
    key: 'micro',
    label: 'MICRO DRONE',
    maxHealth: 22,
    speed: 108,
    damage: 5,
    score: 150,
    size: 10,
    color: 0x86e9ff,
    accent: 0xffffff,
    rfVulnerable: true,
    wobble: 6.4,
    aggression: 1.08,
  },
  fixedWing: {
    key: 'fixedWing',
    label: 'FIXED-WING',
    maxHealth: 62,
    speed: 88,
    damage: 14,
    score: 250,
    size: 19,
    color: 0xffd36b,
    accent: 0xffffff,
    rfVulnerable: false,
    wobble: 0.8,
    aggression: 1.08,
  },
  loitering: {
    key: 'loitering',
    label: 'LOITERING MUNITION',
    maxHealth: 115,
    speed: 68,
    damage: 28,
    score: 500,
    size: 23,
    color: 0xff5f6d,
    accent: 0xffd36b,
    rfVulnerable: false,
    wobble: 1.3,
    aggression: 1.48,
  },
};

export const HIGH_SCORE_KEY = 'opensentry-pixel-high-score';
