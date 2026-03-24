import Phaser from 'phaser';

export class UpgradeCard {
  constructor(scene, x, y, upgrade, onClick) {
    this.scene = scene;
    this.elements = [];

    const width = 240;
    const height = 200;

    const isRare = upgrade.isRare;
    const strokeColor = isRare ? 0xffdd44 : 0x6666aa;

    const bg = scene.add.rectangle(x, y, width, height, 0x222244, 0.9)
      .setStrokeStyle(3, strokeColor)
      .setInteractive({ useHandCursor: true })
      .setDepth(200);
    this.elements.push(bg);

    const nameText = scene.add.text(x, y - 60, upgrade.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(nameText);

    const levelStr = upgrade.currentLevel > 0
      ? `Level ${upgrade.nextLevel}`
      : 'NEW';
    const levelText = scene.add.text(x, y - 36, levelStr, {
      fontSize: '14px',
      color: '#ffdd44',
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(levelText);

    const icon = scene.add.sprite(x, y + 4, upgrade.icon).setDepth(201);
    icon.setScale(4);
    this.elements.push(icon);

    const descText = scene.add.text(x, y + 52, upgrade.description, {
      fontSize: '12px',
      color: '#aaaacc',
      wordWrap: { width: width - 20 },
      align: 'center',
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(descText);

    // "RARE" label below description
    if (isRare) {
      const rareText = scene.add.text(x, y + 78, 'RARE', {
        fontSize: '14px',
        color: '#ffdd44',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(201);
      this.elements.push(rareText);
    }

    const hoverStroke = isRare ? 0xffee88 : 0xaaaaff;

    bg.on('pointerover', () => {
      bg.setFillStyle(0x333366, 0.95);
      bg.setStrokeStyle(3, hoverStroke);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x222244, 0.9);
      bg.setStrokeStyle(3, strokeColor);
    });

    bg.on('pointerdown', () => {
      onClick(upgrade);
    });
  }

  destroy() {
    this.elements.forEach((el) => el.destroy());
  }
}
