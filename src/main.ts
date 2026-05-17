import Phaser from 'phaser';
import './style.css';
import { gameConfig } from './game/config';
import { EndScene } from './game/scenes/EndScene';
import { GameScene } from './game/scenes/GameScene';
import { MenuScene } from './game/scenes/MenuScene';
import { TutorialScene } from './game/scenes/TutorialScene';

new Phaser.Game({
  ...gameConfig,
  scene: [MenuScene, TutorialScene, GameScene, EndScene],
});
