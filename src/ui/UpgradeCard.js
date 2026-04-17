import Phaser from 'phaser';

export class UpgradeCard {
  constructor(scene, x, y, upgrade, onClick) {
    this.scene = scene;
    this.elements = [];

    const width = 240;
    const height = 220;

    const isEvolution = upgrade.isEvolution;
    const isRare = upgrade.isRare;

    let strokeColor, bgColor, headerColor, accentColor, hoverStroke, hoverBg;
    if (isEvolution) {
      strokeColor = 0xffbb44;
      bgColor = 0x2a1a0a;
      headerColor = 0x3a2a10;
      accentColor = 0xffee88;
      hoverStroke = 0xffffaa;
      hoverBg = 0x3a220a;
    } else if (isRare) {
      strokeColor = 0xffdd44;
      bgColor = 0x2a2a22;
      headerColor = 0x3a3a1a;
      accentColor = 0xffdd44;
      hoverStroke = 0xffee88;
      hoverBg = 0x333322;
    } else {
      strokeColor = 0x5566aa;
      bgColor = 0x161633;
      headerColor = 0x1a1a44;
      accentColor = 0x7788cc;
      hoverStroke = 0x99aadd;
      hoverBg = 0x222244;
    }

    // Card shadow
    const shadow = scene.add.rectangle(x + 3, y + 3, width, height, 0x000000, 0.4)
      .setDepth(199);
    this.elements.push(shadow);

    // Card background
    const bg = scene.add.rectangle(x, y, width, height, bgColor, 0.95)
      .setStrokeStyle(isEvolution ? 3 : 2, strokeColor)
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
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx, dy]) => {
      const cx = scene.add.rectangle(x + dx * cHalfW, y + dy * cHalfH, 8, 2, accentColor, 0.6).setDepth(201);
      const cy = scene.add.rectangle(x + dx * cHalfW, y + dy * cHalfH, 2, 8, accentColor, 0.6).setDepth(201);
      this.elements.push(cx, cy);
    });

    // Name text
    const nameText = scene.add.text(x, y - height / 2 + 16, upgrade.name, {
      fontSize: '16px',
      color: isEvolution ? '#ffeeaa' : '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(nameText);

    // Level indicator or EVOLVE badge
    let levelStr, levelColor;
    if (isEvolution) {
      levelStr = 'EVOLVE';
      levelColor = '#ffcc44';
    } else if (upgrade.currentLevel > 0) {
      levelStr = `Level ${upgrade.nextLevel}`;
      levelColor = '#88aadd';
    } else {
      levelStr = 'NEW';
      levelColor = '#44ff88';
    }
    const levelBg = scene.add.rectangle(x, y - height / 2 + 36, isEvolution ? 72 : 60, 16, 0x000000, 0.3)
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

    // For evolution cards, add a rotating glow ring behind the icon
    if (isEvolution) {
      const glowRing = scene.add.circle(x, y + 6, 28, 0xffcc44, 0.15).setDepth(201);
      this.elements.push(glowRing);
      scene.tweens.add({
        targets: glowRing,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0.3,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const icon = scene.add.sprite(x, y + 6, upgrade.icon).setDepth(202);
    icon.setScale(4);
    this.elements.push(icon);

    if (isEvolution) {
      // Sparkle particles around evolution icon
      const sparkles = scene.add.particles(x, y + 6, 'bullet', {
        speed: { min: 10, max: 40 },
        scale: { start: 0.6, end: 0 },
        lifespan: 600,
        quantity: 1,
        frequency: 120,
        tint: [0xffee88, 0xffffff, 0xffcc44],
        emitting: true,
      });
      sparkles.setDepth(203);
      this.elements.push(sparkles);
    }

    // Description
    const descText = scene.add.text(x, y + 55, upgrade.description, {
      fontSize: '11px',
      color: isEvolution ? '#ffeebb' : '#9999bb',
      wordWrap: { width: width - 24 },
      align: 'center',
      lineSpacing: 2,
    }).setOrigin(0.5).setDepth(201);
    this.elements.push(descText);

    // Badge at the bottom
    if (isEvolution) {
      const evoBadge = scene.add.rectangle(x, y + height / 2 - 18, 96, 18, 0x663300, 0.9)
        .setStrokeStyle(1, 0xffcc44)
        .setDepth(201);
      this.elements.push(evoBadge);
      const evoText = scene.add.text(x, y + height / 2 - 18, 'EVOLUTION', {
        fontSize: '11px',
        color: '#ffdd44',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(202);
      this.elements.push(evoText);
    } else if (isRare) {
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

    bg.on('pointerover', () => {
      bg.setFillStyle(hoverBg, 1);
      bg.setStrokeStyle(isEvolution ? 4 : 3, hoverStroke);
      shadow.setAlpha(0.6);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(bgColor, 0.95);
      bg.setStrokeStyle(isEvolution ? 3 : 2, strokeColor);
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
    this.isEvolution = isEvolution;
    this.upgrade = upgrade;
  }

  setHighlighted(highlighted) {
    if (highlighted) {
      this.bg.setFillStyle(this.hoverBgColor, 1);
      this.bg.setStrokeStyle(this.isEvolution ? 4 : 3, this.hoverStroke);
      this.shadow.setAlpha(0.6);
    } else {
      this.bg.setFillStyle(this.bgColor, 0.95);
      this.bg.setStrokeStyle(this.isEvolution ? 3 : 2, this.strokeColor);
      this.shadow.setAlpha(0.4);
    }
  }

  destroy() {
    this.elements.forEach((el) => el.destroy());
  }
}
