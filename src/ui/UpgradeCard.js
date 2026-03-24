import Phaser from 'phaser';

export class UpgradeCard {
  constructor(scene, x, y, upgrade, onClick) {
    this.scene = scene;
    this.elements = [];

    const width = 120;
    const height = 100;

    // Card background
    const bg = scene.add.rectangle(x, y, width, height, 0x222244, 0.9)
      .setStrokeStyle(2, 0x6666aa)
      .setInteractive({ useHandCursor: true })
      .setDepth(200);
    this.elements.push(bg);

    // Upgrade name
    const nameText = scene.add.text(x, y - 30, upgrade.name, {
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(nameText);

    // Level indicator
    const levelStr = upgrade.currentLevel > 0
      ? `Level ${upgrade.nextLevel}`
      : 'NEW';
    const levelText = scene.add.text(x, y - 18, levelStr, {
      fontSize: '7px',
      color: '#ffdd44',
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(levelText);

    // Icon
    const icon = scene.add.sprite(x, y + 2, upgrade.icon).setDepth(201);
    icon.setScale(2);
    this.elements.push(icon);

    // Description
    const descText = scene.add.text(x, y + 26, upgrade.description, {
      fontSize: '6px',
      color: '#aaaacc',
      wordWrap: { width: width - 10 },
      align: 'center',
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(descText);

    // Hover effect
    bg.on('pointerover', () => {
      bg.setFillStyle(0x333366, 0.95);
      bg.setStrokeStyle(2, 0xaaaaff);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x222244, 0.9);
      bg.setStrokeStyle(2, 0x6666aa);
    });

    // Click handler
    bg.on('pointerdown', () => {
      onClick(upgrade);
    });
  }

  destroy() {
    this.elements.forEach((el) => el.destroy());
  }
}
