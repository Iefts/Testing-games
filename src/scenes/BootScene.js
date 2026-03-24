import Phaser from 'phaser';
import { generateSprites } from '../utils/SpriteGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Show loading text
    const text = this.add.text(240, 135, 'Loading...', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  create() {
    // Generate all pixel art textures at runtime
    generateSprites(this);

    this.scene.start('Menu');
  }
}
