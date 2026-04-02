import Phaser from 'phaser';
import { LEVELS } from '../config/Levels.js';
import { ENEMIES } from '../config/Enemies.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { PASS_REWARDS } from '../config/PassRewards.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(480, 30, 'SELECT LEVEL', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.levelKeys = Object.keys(LEVELS);
    this.selectedIndex = 0;
    this.cards = [];

    const count = this.levelKeys.length;
    const cardW = 160;
    const cardH = 240;
    const gap = 12;
    const totalW = count * cardW + (count - 1) * gap;
    const startX = 480 - totalW / 2 + cardW / 2;
    const cardY = 250;

    this.levelKeys.forEach((key, i) => {
      const level = LEVELS[key];
      const cardX = startX + i * (cardW + gap);
      const isUnlocked = level.isDev || SaveSystem.isLevelUnlocked(key);

      const bgColor = isUnlocked ? 0x222244 : 0x1a1a22;
      const strokeColor = isUnlocked ? 0x6666aa : 0x333344;

      const card = this.add.rectangle(cardX, cardY, cardW, cardH, bgColor, 0.9)
        .setStrokeStyle(2, strokeColor);

      if (isUnlocked) {
        card.setInteractive({ useHandCursor: true });

        // Preview background
        if (level.isDev) {
          this.add.rectangle(cardX, cardY - 50, 120, 70, 0x222222)
            .setStrokeStyle(2, 0xff8800);
          this.add.rectangle(cardX - 8, cardY - 52, 14, 3, 0xff8800);
          this.add.rectangle(cardX, cardY - 60, 3, 14, 0xff8800);
          this.add.rectangle(cardX, cardY - 52, 8, 8, 0x222222)
            .setStrokeStyle(2, 0xff8800);
        } else {
          const previewColors = {
            grass: { bg: 0x4a8c3f, border: 0x3d7a33 },
            sand: { bg: 0xd4a843, border: 0xb08828 },
            water: { bg: 0x1a5c8a, border: 0x144a70 },
            lunar: { bg: 0x555566, border: 0x444455 },
          };
          const colors = previewColors[level.tileKey] || previewColors.grass;
          this.add.rectangle(cardX, cardY - 50, 120, 70, colors.bg)
            .setStrokeStyle(2, colors.border);

          if (level.tileKey === 'grass') {
            this.add.rectangle(cardX - 30, cardY - 56, 8, 12, 0x2d6b1e);
            this.add.rectangle(cardX + 20, cardY - 42, 8, 12, 0x2d6b1e);
          } else if (level.tileKey === 'sand') {
            this.add.rectangle(cardX - 25, cardY - 52, 3, 10, 0x2d8b2e);
            this.add.rectangle(cardX - 28, cardY - 48, 3, 3, 0x2d8b2e);
            this.add.rectangle(cardX + 18, cardY - 44, 3, 10, 0x2d8b2e);
            this.add.rectangle(cardX + 21, cardY - 40, 3, 3, 0x2d8b2e);
          } else if (level.tileKey === 'water') {
            this.add.rectangle(cardX - 25, cardY - 52, 6, 9, 0xcc4466);
            this.add.rectangle(cardX - 23, cardY - 56, 3, 3, 0xee6688);
            this.add.rectangle(cardX + 20, cardY - 44, 6, 9, 0xcc4466);
            this.add.rectangle(cardX + 22, cardY - 48, 3, 3, 0xee6688);
          } else if (level.tileKey === 'lunar') {
            this.add.rectangle(cardX - 20, cardY - 48, 12, 6, 0x444455);
            this.add.rectangle(cardX - 20, cardY - 48, 8, 3, 0x333344);
            this.add.rectangle(cardX + 16, cardY - 56, 10, 5, 0x444455);
            this.add.rectangle(cardX + 16, cardY - 56, 6, 3, 0x333344);
          }
        }

        this.add.text(cardX, cardY + 20, level.name, {
          fontSize: '16px',
          color: level.isDev ? '#ff8800' : '#ffffff',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        if (level.isDev) {
          this.add.text(cardX, cardY + 48, 'TAB for\ndev menu', {
            fontSize: '10px',
            color: '#aaaacc',
            align: 'center',
            lineSpacing: 2,
          }).setOrigin(0.5);

          this.add.text(cardX, cardY + 78, 'No limit', {
            fontSize: '10px',
            color: '#aaaacc',
          }).setOrigin(0.5);
        } else {
          const enemyNames = level.enemyTypes
            .map(id => ENEMIES[id]?.name || id)
            .join(', ');

          this.add.text(cardX, cardY + 46, enemyNames, {
            fontSize: '9px',
            color: '#aaaacc',
            wordWrap: { width: cardW - 16 },
            align: 'center',
            lineSpacing: 2,
          }).setOrigin(0.5);

          this.add.text(cardX, cardY + 82, `${Math.floor(level.duration / 60)} min`, {
            fontSize: '11px',
            color: '#8888aa',
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
      } else {
        // Locked state
        this.add.sprite(cardX, cardY - 30, 'icon_lock').setScale(4);

        this.add.text(cardX, cardY + 20, level.name, {
          fontSize: '16px',
          color: '#555566',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        let unlockLevel = '?';
        for (const [lv, reward] of Object.entries(PASS_REWARDS)) {
          if (reward.type === 'level' && reward.levelId === key) {
            unlockLevel = lv;
            break;
          }
        }

        this.add.text(cardX, cardY + 48, `Unlocks at\nLv.${unlockLevel}`, {
          fontSize: '11px',
          color: '#666677',
          align: 'center',
          lineSpacing: 2,
        }).setOrigin(0.5);
      }

      this.cards.push(card);
    });

    this.updateSelection();

    this.add.text(480, 480, 'ENTER/SPACE to select  |  arrows to browse', {
      fontSize: '12px',
      color: '#555577',
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(40, 500, '< BACK', {
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
      const level = LEVELS[this.levelKeys[i]];
      const isUnlocked = level.isDev || SaveSystem.isLevelUnlocked(this.levelKeys[i]);
      if (isUnlocked) {
        card.setStrokeStyle(2, i === this.selectedIndex ? 0xaaaaff : 0x6666aa);
      }
    });
  }

  confirmSelection() {
    const key = this.levelKeys[this.selectedIndex];
    const level = LEVELS[key];
    const isUnlocked = level.isDev || SaveSystem.isLevelUnlocked(key);

    if (!isUnlocked) {
      this.cameras.main.shake(50, 0.002);
      return;
    }

    this.sound.play('sfx_buttonClick', { volume: 0.4 });
    this.registry.set('level', key);
    this.scene.start('Game');
  }
}
