import Phaser from 'phaser';
import { UpgradeCard } from '../ui/UpgradeCard.js';

export class LevelUpScene extends Phaser.Scene {
  constructor() {
    super('LevelUp');
  }

  init(data) {
    this.upgrades = data.upgrades;
    this.onSelect = data.onSelect;
  }

  create() {
    // Dim overlay
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.6)
      .setDepth(190);

    this.add.text(480, 60, 'LEVEL UP!', {
      fontSize: '32px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);

    this.add.text(480, 100, 'Choose an upgrade', {
      fontSize: '16px',
      color: '#cccccc',
    }).setOrigin(0.5).setDepth(200);

    this.cards = [];
    const count = this.upgrades.length;
    const spacing = 280;
    const startX = 480 - (count - 1) * spacing / 2;

    this.upgrades.forEach((upgrade, i) => {
      const card = new UpgradeCard(
        this,
        startX + i * spacing,
        290,
        upgrade,
        (selected) => this.selectUpgrade(selected)
      );
      this.cards.push(card);
    });

    // Keyboard navigation
    this.selectedIndex = 0;
    this.cards[0].setHighlighted(true);

    this.input.keyboard.on('keydown', (event) => {
      const key = event.code;
      if (key === 'ArrowLeft' || key === 'KeyA') {
        this.moveSelection(-1);
      } else if (key === 'ArrowRight' || key === 'KeyD') {
        this.moveSelection(1);
      } else if (key === 'ArrowUp' || key === 'KeyW') {
        this.moveSelection(-1);
      } else if (key === 'ArrowDown' || key === 'KeyS') {
        this.moveSelection(1);
      } else if (key === 'Space' || key === 'Enter') {
        this.selectUpgrade(this.cards[this.selectedIndex].upgrade);
      }
    });
  }

  moveSelection(dir) {
    this.cards[this.selectedIndex].setHighlighted(false);
    this.selectedIndex = (this.selectedIndex + dir + this.cards.length) % this.cards.length;
    this.cards[this.selectedIndex].setHighlighted(true);
  }

  selectUpgrade(upgrade) {
    this.sound.play('sfx_upgradeSelect', { volume: 0.4 });
    this.cards.forEach((card) => card.destroy());
    this.onSelect(upgrade);
    this.scene.stop();
  }
}
