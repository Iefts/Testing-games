import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';
import { CHARACTERS } from '../config/Characters.js';
import { COSMETICS } from '../config/Cosmetics.js';
import { LEVELS } from '../config/Levels.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0d1a');

    // --- Animated particle background ---
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const size = Phaser.Math.Between(1, 3);
      const alpha = 0.1 + Math.random() * 0.4;
      const color = Phaser.Math.RND.pick([0x4444aa, 0x6644cc, 0x2266aa, 0x8844cc, 0xffffff]);
      const particle = this.add.rectangle(x, y, size, size, color, alpha);
      particle._vx = (Math.random() - 0.5) * 0.3;
      particle._vy = -0.1 - Math.random() * 0.3;
      particle._baseAlpha = alpha;
      this.particles.push(particle);
    }

    // --- Title with glow effect ---
    // Glow shadow (pulsing)
    this.titleGlow = this.add.text(480, 80, 'ROGUELIKE\nSURVIVOR', {
      fontSize: '52px',
      color: '#4444cc',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5).setAlpha(0.3);

    // Main title
    this.add.text(480, 80, 'ROGUELIKE\nSURVIVOR', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(480, 130, 'Survive the hordes', {
      fontSize: '13px',
      color: '#6666aa',
    }).setOrigin(0.5);

    // --- Character showcase ---
    const unlockedChars = Object.keys(CHARACTERS).filter(id => SaveSystem.isCharacterUnlocked(id));
    this.showcaseChars = unlockedChars;
    this.showcaseIndex = 0;

    this.showcaseBg = this.add.rectangle(480, 200, 80, 80, 0x111133, 0.5)
      .setStrokeStyle(1, 0x333366);

    this.showcaseSprite = null;
    this.showcaseNameText = this.add.text(480, 248, '', {
      fontSize: '11px',
      color: '#8888bb',
    }).setOrigin(0.5);

    this.updateShowcase();

    // Cycle characters every 3 seconds
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.showcaseIndex = (this.showcaseIndex + 1) % this.showcaseChars.length;
        this.updateShowcase();
      },
      loop: true,
    });

    // --- Progress bar ---
    const barX = 280;
    const barY = 290;
    const barW = 400;
    const barH = 22;

    // Bar background
    this.add.rectangle(barX + barW / 2, barY + barH / 2, barW + 4, barH + 4, 0x000000, 0.5)
      .setStrokeStyle(2, 0x4444aa);
    this.add.rectangle(barX, barY, barW, barH, 0x111133).setOrigin(0);

    // Bar fill
    const fill = SaveSystem.xpProgress;
    this.progressFill = this.add.rectangle(barX + 2, barY + 2, (barW - 4) * fill, barH - 4, 0x44aaff).setOrigin(0);

    // Bar glow overlay
    this.progressGlow = this.add.rectangle(barX + 2, barY + 2, (barW - 4) * fill, barH - 4, 0x88ccff, 0.15).setOrigin(0);

    // Level text on bar
    this.add.text(barX - 50, barY + barH / 2, `Lv.${SaveSystem.level}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // XP text
    const maxLevel = SaveSystem.level >= 100;
    const xpDisplay = maxLevel ? 'MAX' : `${SaveSystem.xp} / ${SaveSystem.xpToNext}`;
    this.add.text(barX + barW / 2, barY + barH / 2, xpDisplay, {
      fontSize: '11px',
      color: '#ccccff',
    }).setOrigin(0.5);

    // --- Coins display ---
    this.add.sprite(370, 330, 'icon_coin').setScale(2);
    this.add.text(385, 330, `${SaveSystem.coins} coins`, {
      fontSize: '14px',
      color: '#ddaa22',
    }).setOrigin(0, 0.5);

    // --- Buttons ---
    // Play button
    this.createButton(380, 390, 'PLAY', '#44ff88', '#224433', '#66ffaa', '#335544', () => {
      this.scene.start('CharacterSelect');
    });

    // Shop button
    this.createButton(580, 390, 'SHOP', '#ffcc44', '#333322', '#ffdd66', '#444433', () => {
      this.scene.start('Shop');
    });

    // Multiplayer button (smaller)
    this.createButton(480, 450, 'MULTIPLAYER', '#44aaff', '#222244', '#66ccff', '#333355', () => {
      this.scene.start('Lobby');
    }, '16px');

    // Fullscreen toggle (helps hide the mobile browser address bar)
    if (this.scale.fullscreen.available) {
      const fsBtn = this.add.text(40, 520, '\u26F6 FULLSCREEN', {
        fontSize: '12px',
        color: '#88aacc',
        backgroundColor: '#222244',
        padding: { x: 8, y: 4 },
      }).setOrigin(0, 1).setInteractive({ useHandCursor: true });

      const updateLabel = () => {
        fsBtn.setText(this.scale.isFullscreen ? '\u26F6 EXIT FULLSCREEN' : '\u26F6 FULLSCREEN');
      };

      fsBtn.on('pointerover', () => fsBtn.setColor('#aaccff'));
      fsBtn.on('pointerout', () => fsBtn.setColor('#88aacc'));
      fsBtn.on('pointerdown', () => {
        this.sound.play('sfx_buttonClick', { volume: 0.3 });
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        } else {
          this.scale.startFullscreen();
        }
        // Phaser updates state on the next frame
        this.time.delayedCall(50, updateLabel);
      });

      this.scale.on('fullscreenunsupported', () => {
        fsBtn.setText('FULLSCREEN N/A').disableInteractive();
      });

      // Keyboard: F toggles fullscreen
      this.input.keyboard.on('keydown-F', () => {
        if (this.scale.isFullscreen) this.scale.stopFullscreen();
        else this.scale.startFullscreen();
        this.time.delayedCall(50, updateLabel);
      });
    }

    // Dev unlock button (bottom right)
    const devBtn = this.add.text(920, 520, 'DEV: UNLOCK ALL', {
      fontSize: '10px',
      color: '#ff8800',
      backgroundColor: '#222200',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

    devBtn.on('pointerover', () => devBtn.setColor('#ffaa44'));
    devBtn.on('pointerout', () => devBtn.setColor('#ff8800'));
    devBtn.on('pointerdown', () => {
      // Unlock all characters
      Object.keys(CHARACTERS).forEach(id => SaveSystem.unlockCharacter(id));
      // Unlock all levels (except dev, which is always available)
      Object.keys(LEVELS).forEach(id => { if (!LEVELS[id].isDev) SaveSystem.unlockLevel(id); });
      // Unlock all cosmetics
      Object.keys(COSMETICS).forEach(id => SaveSystem.unlockCosmetic(id));
      // Grant coins and max level
      SaveSystem.data.playerLevel = 100;
      SaveSystem.data.playerXP = 0;
      SaveSystem.data.coins += 9999;
      // Mark all shop items as purchased
      SaveSystem.data.purchasedItems = ['crimson_human', 'ice_fencer', 'royal_dealer', 'void_bloodMage', 'stealth_dronePilot', 'jade_snakeSwordsman'];
      SaveSystem.save();
      this.sound.play('sfx_levelUp', { volume: 0.5 });
      this.cameras.main.flash(300, 255, 200, 0);
      this.scene.restart();
    });

    // --- Controls hint ---
    this.add.text(480, 510, 'ENTER to play  |  S for shop  |  M for multiplayer', {
      fontSize: '10px',
      color: '#444466',
    }).setOrigin(0.5);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ENTER', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('CharacterSelect');
    });
    this.input.keyboard.on('keydown-S', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Shop');
    });
    this.input.keyboard.on('keydown-M', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Lobby');
    });

    // --- Title glow pulse animation ---
    this.glowTimer = 0;

    // XP boost indicator
    if (SaveSystem.hasBoost('xp_boost')) {
      this.add.text(480, 480, 'XP BOOST ACTIVE', {
        fontSize: '12px',
        color: '#66aaff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }
  }

  createButton(x, y, text, color, bgColor, hoverColor, hoverBg, onClick, fontSize = '22px') {
    const btn = this.add.text(x, y, text, {
      fontSize,
      color,
      fontStyle: 'bold',
      backgroundColor: bgColor,
      padding: { x: 28, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setColor(hoverColor);
      btn.setBackgroundColor(hoverBg);
      btn.setScale(1.05);
    });
    btn.on('pointerout', () => {
      btn.setColor(color);
      btn.setBackgroundColor(bgColor);
      btn.setScale(1.0);
    });
    btn.on('pointerdown', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      onClick();
    });
    return btn;
  }

  updateShowcase() {
    if (this.showcaseSprite) {
      this.showcaseSprite.destroy();
    }
    const charId = this.showcaseChars[this.showcaseIndex];
    const char = CHARACTERS[charId];
    if (!char) return;

    this.showcaseSprite = this.add.sprite(480, 200, char.spriteSheet, 0)
      .setScale(5)
      .setDepth(5);
    this.showcaseSprite.play(`${char.animPrefix}_walk`);
    this.showcaseNameText.setText(char.name);
  }

  update(time, delta) {
    // Animate particles
    for (const p of this.particles) {
      p.x += p._vx;
      p.y += p._vy;
      if (p.y < -5) p.y = 545;
      if (p.x < -5) p.x = 965;
      if (p.x > 965) p.x = -5;
      p.alpha = p._baseAlpha + Math.sin(time * 0.002 + p.x) * 0.15;
    }

    // Pulse title glow
    this.glowTimer += delta * 0.002;
    const glowAlpha = 0.15 + Math.sin(this.glowTimer) * 0.15;
    this.titleGlow.setAlpha(glowAlpha);

    // Pulse progress bar glow
    this.progressGlow.setAlpha(0.1 + Math.sin(this.glowTimer * 1.5) * 0.1);
  }
}
