import Phaser from 'phaser';
import { CHARACTERS } from '../config/Characters.js';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(480, 60, 'SELECT CHARACTER', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const human = CHARACTERS.human;
    const cardX = 480;
    const cardY = 260;

    const card = this.add.rectangle(cardX, cardY, 280, 280, 0x222244, 0.9)
      .setStrokeStyle(3, 0x6666aa)
      .setInteractive({ useHandCursor: true });

    this.add.sprite(cardX, cardY - 60, human.sprite).setScale(6);

    this.add.text(cardX, cardY + 30, human.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cardX, cardY + 65, `HP: ${human.hp}  SPD: ${human.speed}`, {
      fontSize: '16px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(cardX, cardY + 90, `Weapon: Revolver`, {
      fontSize: '14px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    card.on('pointerover', () => card.setStrokeStyle(3, 0xaaaaff));
    card.on('pointerout', () => card.setStrokeStyle(3, 0x6666aa));

    card.on('pointerdown', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.registry.set('character', 'human');
      this.scene.start('LevelSelect');
    });

    this.add.text(480, 480, 'Click to select', {
      fontSize: '16px',
      color: '#666688',
    }).setOrigin(0.5);
  }
}
