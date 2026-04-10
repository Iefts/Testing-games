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
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // Background particles
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const size = Phaser.Math.Between(1, 2);
      const alpha = 0.05 + Math.random() * 0.15;
      const color = Phaser.Math.RND.pick([0x334477, 0x443366, 0x223355]);
      const p = this.add.rectangle(x, y, size, size, color, alpha);
      p._vy = -0.05 - Math.random() * 0.1;
      p._vx = (Math.random() - 0.5) * 0.15;
      p._baseAlpha = alpha;
      this.particles.push(p);
    }

    // Title with accent
    this.add.rectangle(480, 14, 240, 2, 0x4455aa, 0.3);
    this.add.text(480, 30, 'SELECT LEVEL', {
      fontSize: '22px',
      color: '#eeeeff',
      fontStyle: 'bold',
      stroke: '#0a0a1a',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.rectangle(480, 46, 160, 1, 0x333366, 0.3);

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

      const bgColor = isUnlocked ? 0x151533 : 0x0e0e1a;
      const strokeColor = isUnlocked ? 0x4455aa : 0x222233;

      // Card shadow
      this.add.rectangle(cardX + 2, cardY + 2, cardW, cardH, 0x000000, 0.25);

      const card = this.add.rectangle(cardX, cardY, cardW, cardH, bgColor, 0.95)
        .setStrokeStyle(2, strokeColor);

      if (isUnlocked) {
        card.setInteractive({ useHandCursor: true });

        // Preview background with richer detail
        if (level.isDev) {
          this.add.rectangle(cardX, cardY - 50, 120, 70, 0x1a1a1a)
            .setStrokeStyle(2, 0xff8800);
          this.add.rectangle(cardX - 8, cardY - 52, 14, 3, 0xff8800);
          this.add.rectangle(cardX, cardY - 60, 3, 14, 0xff8800);
          this.add.rectangle(cardX, cardY - 52, 8, 8, 0x1a1a1a)
            .setStrokeStyle(2, 0xff8800);
        } else {
          const previewColors = {
            grass: { bg: 0x3d7a33, border: 0x2d6622, mid: 0x4a8c3f, hi: 0x5a9c4f },
            sand: { bg: 0xb08828, border: 0x8a6a1e, mid: 0xd4a843, hi: 0xe4b853 },
            water: { bg: 0x144a70, border: 0x0e3a5a, mid: 0x1a5c8a, hi: 0x2a6c9a },
            lunar: { bg: 0x3a3a44, border: 0x2a2a34, mid: 0x555566, hi: 0x666677 },
          };
          const colors = previewColors[level.tileKey] || previewColors.grass;

          // Layered preview
          this.add.rectangle(cardX, cardY - 50, 120, 70, colors.bg)
            .setStrokeStyle(2, colors.border);
          // Terrain detail
          this.add.rectangle(cardX - 20, cardY - 60, 24, 8, colors.mid, 0.6);
          this.add.rectangle(cardX + 15, cardY - 44, 18, 6, colors.mid, 0.6);
          this.add.rectangle(cardX - 30, cardY - 46, 12, 4, colors.hi, 0.4);

          if (level.tileKey === 'grass') {
            // Trees
            this.add.rectangle(cardX - 30, cardY - 56, 6, 10, 0x2d6b1e);
            this.add.rectangle(cardX - 30, cardY - 62, 10, 4, 0x3d8b2e);
            this.add.rectangle(cardX + 20, cardY - 42, 6, 10, 0x2d6b1e);
            this.add.rectangle(cardX + 20, cardY - 48, 10, 4, 0x3d8b2e);
            // Flowers
            this.add.rectangle(cardX - 10, cardY - 44, 2, 2, 0xffee55);
            this.add.rectangle(cardX + 35, cardY - 52, 2, 2, 0xff8888);
          } else if (level.tileKey === 'sand') {
            // Cacti
            this.add.rectangle(cardX - 25, cardY - 52, 3, 12, 0x2d8b2e);
            this.add.rectangle(cardX - 28, cardY - 48, 3, 3, 0x2d8b2e);
            this.add.rectangle(cardX - 22, cardY - 46, 3, 3, 0x2d8b2e);
            this.add.rectangle(cardX + 18, cardY - 44, 3, 12, 0x2d8b2e);
            this.add.rectangle(cardX + 21, cardY - 40, 3, 3, 0x2d8b2e);
            // Sand dune
            this.add.rectangle(cardX + 5, cardY - 38, 20, 3, 0xe4b853, 0.4);
          } else if (level.tileKey === 'water') {
            // Coral
            this.add.rectangle(cardX - 25, cardY - 52, 6, 10, 0xcc4466);
            this.add.rectangle(cardX - 23, cardY - 58, 3, 4, 0xee6688);
            this.add.rectangle(cardX + 20, cardY - 44, 6, 10, 0xcc4466);
            this.add.rectangle(cardX + 22, cardY - 50, 3, 4, 0xee6688);
            // Bubbles
            this.add.rectangle(cardX - 5, cardY - 58, 2, 2, 0x88ccff, 0.5);
            this.add.rectangle(cardX + 10, cardY - 62, 2, 2, 0x88ccff, 0.3);
          } else if (level.tileKey === 'lunar') {
            // Craters
            this.add.rectangle(cardX - 20, cardY - 48, 14, 7, 0x444455);
            this.add.rectangle(cardX - 20, cardY - 49, 10, 4, 0x333344);
            this.add.rectangle(cardX + 16, cardY - 56, 12, 6, 0x444455);
            this.add.rectangle(cardX + 16, cardY - 57, 8, 3, 0x333344);
            // Stars
            this.add.rectangle(cardX - 35, cardY - 70, 2, 2, 0xffffff, 0.3);
            this.add.rectangle(cardX + 30, cardY - 66, 1, 1, 0xffffff, 0.2);
          }
        }

        // Level name
        this.add.text(cardX, cardY + 20, level.name, {
          fontSize: '15px',
          color: level.isDev ? '#ff8800' : '#eeeeff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5);

        if (level.isDev) {
          this.add.text(cardX, cardY + 48, 'TAB for\ndev menu', {
            fontSize: '10px',
            color: '#8899aa',
            align: 'center',
            lineSpacing: 2,
          }).setOrigin(0.5);

          this.add.text(cardX, cardY + 78, 'No limit', {
            fontSize: '10px',
            color: '#8899aa',
          }).setOrigin(0.5);
        } else {
          const enemyNames = level.enemyTypes
            .map(id => ENEMIES[id]?.name || id)
            .join(', ');

          this.add.text(cardX, cardY + 46, enemyNames, {
            fontSize: '9px',
            color: '#7788aa',
            wordWrap: { width: cardW - 16 },
            align: 'center',
            lineSpacing: 2,
          }).setOrigin(0.5);

          // Duration badge
          const dur = `${Math.floor(level.duration / 60)} min`;
          this.add.rectangle(cardX, cardY + 82, 46, 16, 0x000000, 0.3);
          this.add.text(cardX, cardY + 82, dur, {
            fontSize: '10px',
            color: '#8899bb',
            fontStyle: 'bold',
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
          fontSize: '15px',
          color: '#444455',
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
          fontSize: '10px',
          color: '#555566',
          align: 'center',
          lineSpacing: 2,
        }).setOrigin(0.5);
      }

      this.cards.push(card);
    });

    this.updateSelection();

    this.add.text(480, 480, 'ENTER/SPACE to select  |  arrows to browse', {
      fontSize: '10px',
      color: '#333355',
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(40, 500, '< BACK', {
      fontSize: '14px',
      color: '#886677',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#cc8899'));
    backBtn.on('pointerout', () => backBtn.setColor('#886677'));
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
        if (i === this.selectedIndex) {
          card.setStrokeStyle(3, 0x7788cc);
          card.setFillStyle(0x222244, 1);
        } else {
          card.setStrokeStyle(2, 0x4455aa);
          card.setFillStyle(0x151533, 0.95);
        }
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

  update(time) {
    for (const p of this.particles) {
      p.x += p._vx;
      p.y += p._vy;
      if (p.y < -5) p.y = 545;
      if (p.x < -5) p.x = 965;
      if (p.x > 965) p.x = -5;
      p.alpha = p._baseAlpha + Math.sin(time * 0.001 + p.x) * 0.08;
    }
  }
}
