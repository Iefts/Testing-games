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

    const charIds = Object.keys(CHARACTERS);
    const totalWidth = charIds.length * 280 + (charIds.length - 1) * 40;
    const startX = 480 - totalWidth / 2 + 140;

    charIds.forEach((id, index) => {
      const char = CHARACTERS[id];
      const cardX = startX + index * 320;
      const cardY = 260;

      const card = this.add.rectangle(cardX, cardY, 280, 280, 0x222244, 0.9)
        .setStrokeStyle(3, 0x6666aa)
        .setInteractive({ useHandCursor: true });

      this.add.sprite(cardX, cardY - 60, char.sprite).setScale(6);

      this.add.text(cardX, cardY + 30, char.name, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(cardX, cardY + 65, `HP: ${char.hp}  SPD: ${char.speed}`, {
        fontSize: '16px',
        color: '#aaaacc',
      }).setOrigin(0.5);

      const weaponName = char.startingWeapon.charAt(0).toUpperCase() + char.startingWeapon.slice(1);
      this.add.text(cardX, cardY + 90, `Weapon: ${weaponName}`, {
        fontSize: '14px',
        color: '#aaaacc',
      }).setOrigin(0.5);

      card.on('pointerover', () => card.setStrokeStyle(3, 0xaaaaff));
      card.on('pointerout', () => card.setStrokeStyle(3, 0x6666aa));

      card.on('pointerdown', () => {
        this.sound.play('sfx_buttonClick', { volume: 0.4 });
        this.registry.set('character', id);
        this.scene.start('LevelSelect');
      });
    });

    this.add.text(480, 480, 'Click to select', {
      fontSize: '16px',
      color: '#666688',
    }).setOrigin(0.5);
  }
}
