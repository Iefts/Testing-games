import Phaser from 'phaser';
import { LEVELS } from '../config/Levels.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(480, 60, 'SELECT LEVEL', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const plains = LEVELS.plains;
    const cardX = 480;
    const cardY = 260;

    const card = this.add.rectangle(cardX, cardY, 280, 280, 0x222244, 0.9)
      .setStrokeStyle(3, 0x6666aa)
      .setInteractive({ useHandCursor: true });

    // Preview
    this.add.rectangle(cardX, cardY - 50, 160, 100, 0x4a8c3f)
      .setStrokeStyle(2, 0x3d7a33);
    this.add.rectangle(cardX - 40, cardY - 60, 12, 16, 0x2d6b1e);
    this.add.rectangle(cardX + 30, cardY - 40, 12, 16, 0x2d6b1e);

    this.add.text(cardX, cardY + 36, plains.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cardX, cardY + 70, `Enemies: Green Slime`, {
      fontSize: '14px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(cardX, cardY + 92, `Duration: 20 min`, {
      fontSize: '14px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    card.on('pointerover', () => card.setStrokeStyle(3, 0xaaaaff));
    card.on('pointerout', () => card.setStrokeStyle(3, 0x6666aa));

    card.on('pointerdown', () => {
      this.registry.set('level', 'plains');
      this.scene.start('Game');
    });

    this.add.text(480, 480, 'Click to select', {
      fontSize: '16px',
      color: '#666688',
    }).setOrigin(0.5);
  }
}
