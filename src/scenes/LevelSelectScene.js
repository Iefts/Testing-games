import Phaser from 'phaser';
import { LEVELS } from '../config/Levels.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(240, 30, 'SELECT LEVEL', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Level card for "Plains"
    const plains = LEVELS.plains;
    const cardX = 240;
    const cardY = 130;

    // Card background
    const card = this.add.rectangle(cardX, cardY, 140, 140, 0x222244, 0.9)
      .setStrokeStyle(2, 0x6666aa)
      .setInteractive({ useHandCursor: true });

    // Preview (green square representing grass)
    this.add.rectangle(cardX, cardY - 25, 80, 50, 0x4a8c3f)
      .setStrokeStyle(1, 0x3d7a33);

    // Little trees on the preview
    this.add.rectangle(cardX - 20, cardY - 30, 6, 8, 0x2d6b1e);
    this.add.rectangle(cardX + 15, cardY - 20, 6, 8, 0x2d6b1e);

    // Name
    this.add.text(cardX, cardY + 18, plains.name, {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Info
    this.add.text(cardX, cardY + 35, `Enemies: Green Slime`, {
      fontSize: '7px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(cardX, cardY + 46, `Duration: 20 min`, {
      fontSize: '7px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Hover
    card.on('pointerover', () => {
      card.setStrokeStyle(2, 0xaaaaff);
    });
    card.on('pointerout', () => {
      card.setStrokeStyle(2, 0x6666aa);
    });

    // Select
    card.on('pointerdown', () => {
      this.registry.set('level', 'plains');
      this.scene.start('Game');
    });

    // Hint
    this.add.text(240, 240, 'Click to select', {
      fontSize: '8px',
      color: '#666688',
    }).setOrigin(0.5);
  }
}
