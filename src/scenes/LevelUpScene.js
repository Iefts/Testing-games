import Phaser from 'phaser';
import { UpgradeCard } from '../ui/UpgradeCard.js';

export class LevelUpScene extends Phaser.Scene {
  constructor() {
    super('LevelUp');
  }

  init(data) {
    this.upgrades = data.upgrades; // Array of upgrade options
    this.onSelect = data.onSelect; // Callback
  }

  create() {
    // Dim overlay
    this.add.rectangle(240, 135, 480, 270, 0x000000, 0.6)
      .setDepth(190);

    // Title
    this.add.text(240, 30, 'LEVEL UP!', {
      fontSize: '16px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);

    this.add.text(240, 48, 'Choose an upgrade', {
      fontSize: '8px',
      color: '#cccccc',
    }).setOrigin(0.5).setDepth(200);

    // Create upgrade cards
    this.cards = [];
    const count = this.upgrades.length;
    const spacing = 140;
    const startX = 240 - (count - 1) * spacing / 2;

    this.upgrades.forEach((upgrade, i) => {
      const card = new UpgradeCard(
        this,
        startX + i * spacing,
        145,
        upgrade,
        (selected) => this.selectUpgrade(selected)
      );
      this.cards.push(card);
    });
  }

  selectUpgrade(upgrade) {
    this.cards.forEach((card) => card.destroy());
    this.onSelect(upgrade);
    this.scene.stop();
  }
}
