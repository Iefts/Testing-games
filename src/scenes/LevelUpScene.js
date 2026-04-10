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
    // Dim overlay with subtle gradient effect (darker edges)
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.65)
      .setDepth(190);

    // Decorative top accent line
    this.add.rectangle(480, 30, 300, 2, 0xffdd44, 0.5).setDepth(200);
    this.add.rectangle(480, 32, 180, 1, 0xffdd44, 0.25).setDepth(200);

    // Title glow
    this.titleGlow = this.add.text(480, 56, 'LEVEL UP!', {
      fontSize: '36px',
      color: '#aa8800',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200).setAlpha(0.3);

    // Title
    this.add.text(480, 56, 'LEVEL UP!', {
      fontSize: '32px',
      color: '#ffdd44',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200);

    this.add.text(480, 88, 'Choose an upgrade', {
      fontSize: '13px',
      color: '#9999aa',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(200);

    // Decorative line below subtitle
    this.add.rectangle(480, 100, 200, 1, 0x444466, 0.4).setDepth(200);

    this.cards = [];
    const count = this.upgrades.length;
    const spacing = 270;
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

    // Controls hint
    this.add.text(480, 470, 'arrows to browse   ENTER/SPACE to select', {
      fontSize: '10px',
      color: '#444466',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(200);

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

    // Glow pulse timer
    this.glowTimer = 0;
  }

  update(time, delta) {
    this.glowTimer += delta * 0.003;
    if (this.titleGlow) {
      this.titleGlow.setAlpha(0.2 + Math.sin(this.glowTimer) * 0.15);
    }
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
