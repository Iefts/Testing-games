import Phaser from 'phaser';
import { SHOP_ITEMS } from '../config/ShopItems.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { CHARACTERS } from '../config/Characters.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('Shop');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(480, 30, 'SHOP', {
      fontSize: '28px',
      color: '#ffcc44',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Coins display
    this.coinsText = this.add.text(480, 60, '', {
      fontSize: '16px',
      color: '#ddaa22',
    }).setOrigin(0.5);
    this.updateCoinsDisplay();

    // Item grid
    const cols = 4;
    const cardW = 180;
    const cardH = 160;
    const gapX = 20;
    const gapY = 16;
    const startY = 110;

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
      this.add.text(480, 480, 'XP BOOST ACTIVE (next game)', {
        fontSize: '14px',
        color: '#66aaff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

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
    const isConsumable = item.type === 'consumable';

    // Card background
    const bgColor = purchased ? 0x223322 : 0x222244;
    const strokeColor = purchased ? 0x44aa44 : (canAfford ? 0x6666aa : 0x444455);

    const card = this.add.rectangle(x, y, w, h, bgColor, 0.9)
      .setStrokeStyle(2, strokeColor);

    // Icon
    const iconKey = item.icon || 'icon_cosmetic';
    this.add.sprite(x, y - 42, iconKey).setScale(3);

    // Item name
    this.add.text(x, y - 10, item.name, {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 14, item.description, {
      fontSize: '10px',
      color: '#aaaacc',
      align: 'center',
      lineSpacing: 2,
    }).setOrigin(0.5);

    // Character name if applicable
    if (item.characterId) {
      const charName = CHARACTERS[item.characterId]?.name || '';
      this.add.text(x, y + 38, charName, {
        fontSize: '9px',
        color: '#8888aa',
      }).setOrigin(0.5);
    }

    // Price / status button
    let btnText, btnColor, btnBgColor;
    if (purchased) {
      btnText = 'OWNED';
      btnColor = '#44aa44';
      btnBgColor = '#1a331a';
    } else {
      btnText = `${item.cost} coins`;
      btnColor = canAfford ? '#ffcc44' : '#666666';
      btnBgColor = canAfford ? '#333322' : '#222222';
    }

    const btn = this.add.text(x, y + 58, btnText, {
      fontSize: '12px',
      color: btnColor,
      fontStyle: 'bold',
      backgroundColor: btnBgColor,
      padding: { x: 14, y: 5 },
    }).setOrigin(0.5);

    if (!purchased && canAfford) {
      card.setInteractive({ useHandCursor: true });
      btn.setInteractive({ useHandCursor: true });

      const hoverOn = () => {
        card.setStrokeStyle(3, 0xaaaaff);
        card.setFillStyle(0x333366, 1);
      };
      const hoverOff = () => {
        card.setStrokeStyle(2, strokeColor);
        card.setFillStyle(bgColor, 0.9);
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
            // Auto-equip the cosmetic
            if (item.characterId) {
              SaveSystem.equipCosmetic(item.characterId, item.cosmeticId);
            }
          } else if (item.type === 'consumable') {
            SaveSystem.addBoost(item.boostId);
          }
          this.sound.play('sfx_levelUp', { volume: 0.5 });
          // Refresh the scene
          this.scene.restart();
        }
      };

      card.on('pointerdown', purchase);
      btn.on('pointerdown', purchase);
    }

    this.itemCards.push({ card, btn, item });
  }

  updateCoinsDisplay() {
    this.coinsText.setText(`Coins: ${SaveSystem.coins}`);
  }
}
