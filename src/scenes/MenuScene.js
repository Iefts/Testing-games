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
    this.cameras.main.setBackgroundColor('#080814');

    // --- Layered animated background ---
    // Deep star field (slow, small)
    this.particles = [];
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const size = Phaser.Math.Between(1, 2);
      const alpha = 0.05 + Math.random() * 0.25;
      const color = Phaser.Math.RND.pick([0x334488, 0x443366, 0x223355]);
      const particle = this.add.rectangle(x, y, size, size, color, alpha);
      particle._vx = (Math.random() - 0.5) * 0.1;
      particle._vy = -0.05 - Math.random() * 0.1;
      particle._baseAlpha = alpha;
      particle._layer = 0;
      this.particles.push(particle);
    }
    // Mid-layer floating motes (medium, colorful)
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const size = Phaser.Math.Between(1, 3);
      const alpha = 0.1 + Math.random() * 0.35;
      const color = Phaser.Math.RND.pick([0x5555cc, 0x7744dd, 0x3388bb, 0x9955ee]);
      const particle = this.add.rectangle(x, y, size, size, color, alpha);
      particle._vx = (Math.random() - 0.5) * 0.3;
      particle._vy = -0.15 - Math.random() * 0.25;
      particle._baseAlpha = alpha;
      particle._layer = 1;
      this.particles.push(particle);
    }
    // Bright sparks (rare, eye-catching)
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const alpha = 0.3 + Math.random() * 0.5;
      const color = Phaser.Math.RND.pick([0xffffff, 0xaaccff, 0xddaaff]);
      const particle = this.add.rectangle(x, y, 2, 2, color, alpha);
      particle._vx = (Math.random() - 0.5) * 0.5;
      particle._vy = -0.2 - Math.random() * 0.4;
      particle._baseAlpha = alpha;
      particle._layer = 2;
      this.particles.push(particle);
    }

    // --- Decorative divider lines ---
    this.add.rectangle(480, 155, 320, 1, 0x333366, 0.4);
    this.add.rectangle(480, 157, 200, 1, 0x222244, 0.3);

    // --- Title with layered glow effect ---
    // Outer glow (wide, soft)
    this.titleGlowOuter = this.add.text(480, 76, 'ROGUELIKE\nSURVIVOR', {
      fontSize: '54px',
      color: '#2222aa',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.15);

    // Inner glow (pulsing)
    this.titleGlow = this.add.text(480, 76, 'ROGUELIKE\nSURVIVOR', {
      fontSize: '50px',
      color: '#5555dd',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.3);

    // Main title with stroke
    this.add.text(480, 76, 'ROGUELIKE\nSURVIVOR', {
      fontSize: '48px',
      color: '#eeeeff',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 2,
      stroke: '#111133',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle with decorative dashes
    this.add.text(480, 134, '- - Survive the hordes - -', {
      fontSize: '13px',
      color: '#7777aa',
      fontStyle: 'bold',
      stroke: '#080814',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // --- Character showcase with frame ---
    const unlockedChars = Object.keys(CHARACTERS).filter(id => SaveSystem.isCharacterUnlocked(id));
    this.showcaseChars = unlockedChars;
    this.showcaseIndex = 0;

    // Showcase frame (double border)
    this.add.rectangle(480, 204, 88, 88, 0x000000, 0.3);
    this.showcaseBg = this.add.rectangle(480, 204, 82, 82, 0x0d0d22, 0.7)
      .setStrokeStyle(2, 0x444477);
    // Corner accents
    const cornerSize = 6;
    const cX = 480, cY = 204, cHalf = 41;
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx, dy]) => {
      this.add.rectangle(cX + dx * cHalf, cY + dy * cHalf, cornerSize, 2, 0x6666aa);
      this.add.rectangle(cX + dx * cHalf, cY + dy * cHalf, 2, cornerSize, 0x6666aa);
    });

    this.showcaseSprite = null;
    this.showcaseNameText = this.add.text(480, 254, '', {
      fontSize: '11px',
      color: '#9999cc',
      fontStyle: 'bold',
      stroke: '#080814',
      strokeThickness: 2,
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

    // --- Progress bar (refined) ---
    const barX = 280;
    const barY = 284;
    const barW = 400;
    const barH = 22;

    // Bar shadow
    this.add.rectangle(barX + barW / 2 + 2, barY + barH / 2 + 2, barW + 4, barH + 4, 0x000000, 0.3);
    // Bar outer frame
    this.add.rectangle(barX + barW / 2, barY + barH / 2, barW + 6, barH + 6, 0x000000, 0.6)
      .setStrokeStyle(2, 0x3344aa);
    // Bar inner bg
    this.add.rectangle(barX, barY, barW, barH, 0x0d0d22).setOrigin(0);

    // Bar fill with gradient effect (two layers)
    const fill = SaveSystem.xpProgress;
    this.progressFill = this.add.rectangle(barX + 2, barY + 2, (barW - 4) * fill, barH - 4, 0x3388dd).setOrigin(0);
    // Lighter top half for gradient look
    this.progressHighlight = this.add.rectangle(barX + 2, barY + 2, (barW - 4) * fill, (barH - 4) / 2, 0x55aaff, 0.4).setOrigin(0);
    // Shimmer overlay
    this.progressGlow = this.add.rectangle(barX + 2, barY + 2, (barW - 4) * fill, barH - 4, 0x88ccff, 0.1).setOrigin(0);

    // Level badge (styled)
    this.add.rectangle(barX - 46, barY + barH / 2, 44, 26, 0x111133)
      .setStrokeStyle(2, 0x4455aa);
    this.add.text(barX - 46, barY + barH / 2, `Lv.${SaveSystem.level}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // XP text
    const maxLevel = SaveSystem.level >= 100;
    const xpDisplay = maxLevel ? 'MAX' : `${SaveSystem.xp} / ${SaveSystem.xpToNext}`;
    this.add.text(barX + barW / 2, barY + barH / 2, xpDisplay, {
      fontSize: '11px',
      color: '#ccccff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // --- Coins display (styled) ---
    this.add.sprite(370, 326, 'icon_coin').setScale(2);
    this.add.text(385, 326, `${SaveSystem.coins} coins`, {
      fontSize: '14px',
      color: '#ddaa22',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // --- Buttons (polished with pixel-style borders) ---
    // Play button
    this.createButton(380, 386, 'PLAY', '#44ff88', '#1a3322', '#66ffaa', '#224433', () => {
      this.scene.start('CharacterSelect');
    });

    // Shop button
    this.createButton(580, 386, 'SHOP', '#ffcc44', '#332b11', '#ffdd66', '#443b22', () => {
      this.scene.start('Shop');
    });

    // Multiplayer button
    this.createButton(480, 446, 'MULTIPLAYER', '#55bbff', '#1a2244', '#77ddff', '#223355', () => {
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
    // Shadow rectangle behind button
    const metrics = { x: 28, y: 10 };
    const tempText = this.add.text(0, 0, text, { fontSize, fontStyle: 'bold', padding: metrics }).setOrigin(0.5).setVisible(false);
    const bw = tempText.width + 8;
    const bh = tempText.height + 4;
    tempText.destroy();

    const shadow = this.add.rectangle(x + 2, y + 2, bw, bh, 0x000000, 0.3);
    const border = this.add.rectangle(x, y, bw, bh, 0x000000, 0)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color);

    const btn = this.add.text(x, y, text, {
      fontSize,
      color,
      fontStyle: 'bold',
      backgroundColor: bgColor,
      padding: metrics,
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setColor(hoverColor);
      btn.setBackgroundColor(hoverBg);
      btn.setScale(1.05);
      border.setScale(1.05);
      border.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(hoverColor).color);
    });
    btn.on('pointerout', () => {
      btn.setColor(color);
      btn.setBackgroundColor(bgColor);
      btn.setScale(1.0);
      border.setScale(1.0);
      border.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color);
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
    // Animate particles with parallax by layer
    for (const p of this.particles) {
      p.x += p._vx;
      p.y += p._vy;
      if (p.y < -5) p.y = 545;
      if (p.x < -5) p.x = 965;
      if (p.x > 965) p.x = -5;
      const speed = p._layer === 2 ? 0.004 : (p._layer === 1 ? 0.002 : 0.001);
      p.alpha = p._baseAlpha + Math.sin(time * speed + p.x * 0.5) * 0.15;
    }

    // Pulse title glow (layered)
    this.glowTimer += delta * 0.002;
    const glowAlpha = 0.2 + Math.sin(this.glowTimer) * 0.15;
    this.titleGlow.setAlpha(glowAlpha);
    this.titleGlowOuter.setAlpha(0.1 + Math.sin(this.glowTimer * 0.7) * 0.08);

    // Pulse progress bar glow
    this.progressGlow.setAlpha(0.08 + Math.sin(this.glowTimer * 1.5) * 0.08);
  }
}
