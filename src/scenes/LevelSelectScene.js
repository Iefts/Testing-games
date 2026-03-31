import Phaser from 'phaser';
import { LEVELS } from '../config/Levels.js';
import { ENEMIES } from '../config/Enemies.js';

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

    this.levelKeys = Object.keys(LEVELS);
    this.selectedIndex = 0;
    this.cards = [];

    const spacing = 360;
    const startX = 480 - ((this.levelKeys.length - 1) * spacing) / 2;

    this.levelKeys.forEach((key, i) => {
      const level = LEVELS[key];
      const cardX = startX + i * spacing;
      const cardY = 260;

      const card = this.add.rectangle(cardX, cardY, 280, 280, 0x222244, 0.9)
        .setStrokeStyle(3, 0x6666aa)
        .setInteractive({ useHandCursor: true });

      // Preview background
      if (level.isDev) {
        this.add.rectangle(cardX, cardY - 50, 160, 100, 0x222222)
          .setStrokeStyle(2, 0xff8800);
        // Gear/wrench icon shapes
        this.add.rectangle(cardX - 10, cardY - 55, 20, 4, 0xff8800);
        this.add.rectangle(cardX, cardY - 65, 4, 20, 0xff8800);
        this.add.rectangle(cardX, cardY - 55, 10, 10, 0x222222)
          .setStrokeStyle(2, 0xff8800);
      } else {
        const previewColors = {
          grass: { bg: 0x4a8c3f, border: 0x3d7a33 },
          sand: { bg: 0xd4a843, border: 0xb08828 },
        };
        const colors = previewColors[level.tileKey] || previewColors.grass;
        this.add.rectangle(cardX, cardY - 50, 160, 100, colors.bg)
          .setStrokeStyle(2, colors.border);

        if (level.tileKey === 'grass') {
          this.add.rectangle(cardX - 40, cardY - 60, 12, 16, 0x2d6b1e);
          this.add.rectangle(cardX + 30, cardY - 40, 12, 16, 0x2d6b1e);
        } else if (level.tileKey === 'sand') {
          this.add.rectangle(cardX - 35, cardY - 55, 4, 14, 0x2d8b2e);
          this.add.rectangle(cardX - 39, cardY - 50, 4, 4, 0x2d8b2e);
          this.add.rectangle(cardX + 25, cardY - 45, 4, 14, 0x2d8b2e);
          this.add.rectangle(cardX + 29, cardY - 40, 4, 4, 0x2d8b2e);
        }
      }

      this.add.text(cardX, cardY + 36, level.name, {
        fontSize: '24px',
        color: level.isDev ? '#ff8800' : '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      if (level.isDev) {
        this.add.text(cardX, cardY + 70, 'TAB to open dev menu', {
          fontSize: '14px',
          color: '#aaaacc',
          align: 'center',
        }).setOrigin(0.5);

        this.add.text(cardX, cardY + 92, 'No time limit', {
          fontSize: '14px',
          color: '#aaaacc',
        }).setOrigin(0.5);
      } else {
        const enemyNames = level.enemyTypes
          .map(id => ENEMIES[id]?.name || id)
          .join(', ');

        this.add.text(cardX, cardY + 70, `Enemies: ${enemyNames}`, {
          fontSize: '14px',
          color: '#aaaacc',
          wordWrap: { width: 260 },
          align: 'center',
        }).setOrigin(0.5);

        this.add.text(cardX, cardY + 92, `Duration: ${Math.floor(level.duration / 60)} min`, {
          fontSize: '14px',
          color: '#aaaacc',
        }).setOrigin(0.5);
      }

      card.on('pointerover', () => {
        this.selectedIndex = i;
        this.updateSelection();
      });

      card.on('pointerdown', () => {
        this.selectedIndex = i;
        this.confirmSelection();
      });

      this.cards.push(card);
    });

    this.updateSelection();

    this.add.text(480, 480, 'ENTER/SPACE to select  |  ←→ to browse', {
      fontSize: '12px',
      color: '#555577',
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(40, 500, '← BACK', {
      fontSize: '16px',
      color: '#aa6666',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ff8888'));
    backBtn.on('pointerout', () => backBtn.setColor('#aa6666'));
    backBtn.on('pointerdown', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('CharacterSelect');
    });

    // Keyboard controls
    this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard.on('keydown-ESC', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('CharacterSelect');
    });
    this.input.keyboard.on('keydown-LEFT', () => {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelection();
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.selectedIndex = Math.min(this.levelKeys.length - 1, this.selectedIndex + 1);
      this.updateSelection();
    });
  }

  updateSelection() {
    this.cards.forEach((card, i) => {
      card.setStrokeStyle(3, i === this.selectedIndex ? 0xaaaaff : 0x6666aa);
    });
  }

  confirmSelection() {
    this.sound.play('sfx_buttonClick', { volume: 0.4 });
    this.registry.set('level', this.levelKeys[this.selectedIndex]);
    this.scene.start('Game');
  }
}
