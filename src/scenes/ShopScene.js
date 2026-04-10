import Phaser from 'phaser';
import { SHOP_ITEMS } from '../config/ShopItems.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { CHARACTERS } from '../config/Characters.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('Shop');
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
      const color = Phaser.Math.RND.pick([0x554422, 0x443322, 0x665533]);
      const p = this.add.rectangle(x, y, size, size, color, alpha);
      p._vy = -0.05 - Math.random() * 0.1;
      p._vx = (Math.random() - 0.5) * 0.15;
      p._baseAlpha = alpha;
      this.particles.push(p);
    }

    // Title with accent
    this.add.rectangle(480, 14, 140, 2, 0xbb8822, 0.3);
    this.add.text(480, 30, 'SHOP', {
      fontSize: '26px',
      color: '#ffcc44',
      fontStyle: 'bold',
      stroke: '#0a0a1a',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.rectangle(480, 48, 100, 1, 0x665522, 0.3);

    // Coins display (styled)
    this.add.rectangle(480, 64, 140, 22, 0x000000, 0.3);
    this.add.sprite(426, 64, 'icon_coin').setScale(1.5);
    this.coinsText = this.add.text(480, 64, '', {
      fontSize: '14px',
      color: '#ddaa22',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.updateCoinsDisplay();

    // Item grid
    const cols = 4;
    const cardW = 180;
    const cardH = 160;
    const gapX = 20;
    const gapY = 16;
    const startY = 115;

    this.itemCards = [];

    SHOP_ITEMS.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const totalRowW = cols * cardW + (cols - 1) * gapX;
      const x = 480 - totalRowW / 2 + cardW / 2 + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY) + cardH / 2;

      this.createItemCard(item, x, y, cardW, cardH);
    });

    // XP Boost active indicator
    if (SaveSystem.hasBoost('xp_boost')) {
      this.add.rectangle(480, 480, 220, 22, 0x112233, 0.5)
        .setStrokeStyle(1, 0x335577);
      this.add.text(480, 480, 'XP BOOST ACTIVE (next game)', {
        fontSize: '12px',
        color: '#55aaff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
    }

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
      this.scene.start('Menu');
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Menu');
    });
  }

  createItemCard(item, x, y, w, h) {
    const purchased = item.type === 'cosmetic' && SaveSystem.isPurchased(item.id);
    const canAfford = SaveSystem.coins >= item.cost;

    // Card shadow
    this.add.rectangle(x + 2, y + 2, w, h, 0x000000, 0.25);

    // Card background
    const bgColor = purchased ? 0x152215 : 0x151533;
    const strokeColor = purchased ? 0x338833 : (canAfford ? 0x4455aa : 0x222233);

    const card = this.add.rectangle(x, y, w, h, bgColor, 0.95)
      .setStrokeStyle(2, strokeColor);

    // Header strip
    const headerColor = purchased ? 0x1a2a1a : 0x1a1a3a;
    this.add.rectangle(x, y - h / 2 + 18, w - 4, 32, headerColor, 0.7);

    // Icon
    const iconKey = item.icon || 'icon_cosmetic';
    this.add.sprite(x, y - 38, iconKey).setScale(3);

    // Item name
    this.add.text(x, y - 8, item.name, {
      fontSize: '12px',
      color: purchased ? '#88aa88' : '#eeeeff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 14, item.description, {
      fontSize: '9px',
      color: '#7788aa',
      align: 'center',
      lineSpacing: 2,
    }).setOrigin(0.5);

    // Character name if applicable
    if (item.characterId) {
      const charName = CHARACTERS[item.characterId]?.name || '';
      this.add.text(x, y + 36, charName, {
        fontSize: '8px',
        color: '#6677aa',
      }).setOrigin(0.5);
    }

    // Price / status button
    let btnText, btnColor, btnBgColor;
    if (purchased) {
      btnText = 'OWNED';
      btnColor = '#55aa55';
      btnBgColor = '#1a2a1a';
    } else {
      btnText = `${item.cost} coins`;
      btnColor = canAfford ? '#ffcc44' : '#555555';
      btnBgColor = canAfford ? '#2a2a11' : '#1a1a1a';
    }

    const btn = this.add.text(x, y + 58, btnText, {
      fontSize: '11px',
      color: btnColor,
      fontStyle: 'bold',
      backgroundColor: btnBgColor,
      padding: { x: 14, y: 5 },
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    if (!purchased && canAfford) {
      card.setInteractive({ useHandCursor: true });
      btn.setInteractive({ useHandCursor: true });

      const hoverOn = () => {
        card.setStrokeStyle(3, 0x7788cc);
        card.setFillStyle(0x222244, 1);
      };
      const hoverOff = () => {
        card.setStrokeStyle(2, strokeColor);
        card.setFillStyle(bgColor, 0.95);
      };

      card.on('pointerover', hoverOn);
      card.on('pointerout', hoverOff);
      btn.on('pointerover', hoverOn);
      btn.on('pointerout', hoverOff);

      const purchase = () => {
        if (SaveSystem.spendCoins(item.cost)) {
          if (item.type === 'cosmetic') {
            SaveSystem.purchaseItem(item.id);
            SaveSystem.unlockCosmetic(item.cosmeticId);
            if (item.characterId) {
              SaveSystem.equipCosmetic(item.characterId, item.cosmeticId);
            }
          } else if (item.type === 'consumable') {
            SaveSystem.addBoost(item.boostId);
          }
          this.sound.play('sfx_levelUp', { volume: 0.5 });
          this.scene.restart();
        }
      };

      card.on('pointerdown', purchase);
      btn.on('pointerdown', purchase);
    }

    this.itemCards.push({ card, btn, item });
  }

  updateCoinsDisplay() {
    this.coinsText.setText(`${SaveSystem.coins} coins`);
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
