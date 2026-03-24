import Phaser from 'phaser';
import { CHARACTERS } from '../config/Characters.js';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(240, 30, 'SELECT CHARACTER', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Character card for "Human"
    const human = CHARACTERS.human;
    const cardX = 240;
    const cardY = 130;

    // Card background
    const card = this.add.rectangle(cardX, cardY, 140, 140, 0x222244, 0.9)
      .setStrokeStyle(2, 0x6666aa)
      .setInteractive({ useHandCursor: true });

    // Character sprite
    this.add.sprite(cardX, cardY - 30, human.sprite).setScale(3);

    // Name
    this.add.text(cardX, cardY + 15, human.name, {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    this.add.text(cardX, cardY + 35, `HP: ${human.hp}  SPD: ${human.speed}`, {
      fontSize: '8px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(cardX, cardY + 48, `Weapon: Revolver`, {
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
      this.registry.set('character', 'human');
      this.scene.start('LevelSelect');
    });

    // Hint
    this.add.text(240, 240, 'Click to select', {
      fontSize: '8px',
      color: '#666688',
    }).setOrigin(0.5);
  }
}
