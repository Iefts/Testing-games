import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { LevelUpScene } from './scenes/LevelUpScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { MultiplayerGameScene } from './scenes/MultiplayerGameScene.js';
import { DevMenuScene } from './scenes/DevMenuScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { PostGameScene } from './scenes/PostGameScene.js';

const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
  },
  scene: [
    BootScene,
    MenuScene,
    CharacterSelectScene,
    LevelSelectScene,
    GameScene,
    LevelUpScene,
    GameOverScene,
    PauseScene,
    LobbyScene,
    MultiplayerGameScene,
    DevMenuScene,
    ShopScene,
    PostGameScene,
  ],
};

new Phaser.Game(config);
