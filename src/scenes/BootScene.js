import Phaser from 'phaser';
import { generateSprites } from '../utils/SpriteGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const text = this.add.text(480, 270, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  create() {
    generateSprites(this);
    this.scene.start('Menu');
  }
}
