import Phaser from 'phaser';

export class UpgradeCard {
  constructor(scene, x, y, upgrade, onClick) {
    this.scene = scene;
    this.elements = [];

    const width = 240;
    const height = 220;

    const isRare = upgrade.isRare;
    const strokeColor = isRare ? 0xffdd44 : 0x5566aa;
    const bgColor = isRare ? 0x2a2a22 : 0x161633;
    const headerColor = isRare ? 0x3a3a1a : 0x1a1a44;

    // Card shadow
    const shadow = scene.add.rectangle(x + 3, y + 3, width, height, 0x000000, 0.4)
      .setDepth(199);
    this.elements.push(shadow);

    // Card background
    const bg = scene.add.rectangle(x, y, width, height, bgColor, 0.95)
      .setStrokeStyle(2, strokeColor)
      .setInteractive({ useHandCursor: true })
      .setDepth(200);
    this.elements.push(bg);

    // Header strip
    const header = scene.add.rectangle(x, y - height / 2 + 24, width - 4, 44, headerColor, 0.9)
      .setDepth(200);
    this.elements.push(header);

    // Header divider
    const divider = scene.add.rectangle(x, y - height / 2 + 46, width - 16, 1, strokeColor, 0.3)
      .setDepth(201);
    this.elements.push(divider);

    // Corner accents
    const cHalfW = width / 2 - 2, cHalfH = height / 2 - 2;
    const accentColor = isRare ? 0xffdd44 : 0x7788cc;
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx, dy]) => {
      const cx = scene.add.rectangle(x + dx * cHalfW, y + dy * cHalfH, 8, 2, accentColor, 0.6).setDepth(201);
      const cy = scene.add.rectangle(x + dx * cHalfW, y + dy * cHalfH, 2, 8, accentColor, 0.6).setDepth(201);
      this.elements.push(cx, cy);
    });

    // Name text
    const nameText = scene.add.text(x, y - height / 2 + 16, upgrade.name, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(nameText);

    // Level indicator
    const levelStr = upgrade.currentLevel > 0
      ? `Level ${upgrade.nextLevel}`
      : 'NEW';
    const levelColor = upgrade.currentLevel > 0 ? '#88aadd' : '#44ff88';
    const levelBg = scene.add.rectangle(x, y - height / 2 + 36, 60, 16, 0x000000, 0.3)
      .setDepth(201);
    this.elements.push(levelBg);
    const levelText = scene.add.text(x, y - height / 2 + 36, levelStr, {
      fontSize: '11px',
      color: levelColor,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(levelText);

    // Icon with subtle background circle
    const iconBg = scene.add.circle(x, y + 6, 22, 0x000000, 0.25)
      .setDepth(201);
    this.elements.push(iconBg);
    const icon = scene.add.sprite(x, y + 6, upgrade.icon).setDepth(201);
    icon.setScale(4);
    this.elements.push(icon);

    // Description
    const descText = scene.add.text(x, y + 55, upgrade.description, {
      fontSize: '11px',
      color: '#9999bb',
      wordWrap: { width: width - 24 },
      align: 'center',
      lineSpacing: 2,
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(descText);

    // "RARE" badge
    if (isRare) {
      const rareBadge = scene.add.rectangle(x, y + height / 2 - 18, 56, 18, 0x554400, 0.8)
        .setStrokeStyle(1, 0xffdd44)
        .setDepth(201);
      this.elements.push(rareBadge);
      const rareText = scene.add.text(x, y + height / 2 - 18, 'RARE', {
        fontSize: '11px',
        color: '#ffdd44',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(202);
      this.elements.push(rareText);
    }

    const hoverStroke = isRare ? 0xffee88 : 0x99aadd;
    const hoverBg = isRare ? 0x333322 : 0x222244;

    bg.on('pointerover', () => {
      bg.setFillStyle(hoverBg, 1);
      bg.setStrokeStyle(3, hoverStroke);
      shadow.setAlpha(0.6);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(bgColor, 0.95);
      bg.setStrokeStyle(2, strokeColor);
      shadow.setAlpha(0.4);
    });

    bg.on('pointerdown', () => {
      onClick(upgrade);
    });

    this.bg = bg;
    this.shadow = shadow;
    this.strokeColor = strokeColor;
    this.hoverStroke = hoverStroke;
    this.bgColor = bgColor;
    this.hoverBgColor = hoverBg;
    this.upgrade = upgrade;
  }

  setHighlighted(highlighted) {
    if (highlighted) {
      this.bg.setFillStyle(this.hoverBgColor, 1);
      this.bg.setStrokeStyle(3, this.hoverStroke);
      this.shadow.setAlpha(0.6);
    } else {
      this.bg.setFillStyle(this.bgColor, 0.95);
      this.bg.setStrokeStyle(2, this.strokeColor);
      this.shadow.setAlpha(0.4);
    }
  }

  destroy() {
    this.elements.forEach((el) => el.destroy());
  }
}
