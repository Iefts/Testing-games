import Phaser from 'phaser';
import { UPGRADES } from '../config/Upgrades.js';
import { TIER_COLORS } from '../systems/UpgradeManager.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;

    // With camera zoom 2, scrollFactor(0) coordinates are in 480x270 space
    const viewW = 480;
    const viewH = 270;

    // === XP BAR — locked to player, below sprite ===
    const xpBarWidth = 22;
    const xpBarHeight = 3;
    this.xpOffsetY = 18;

    // Bar outline
    this.xpBarOutline = scene.add.rectangle(0, 0, xpBarWidth + 2, xpBarHeight + 2, 0x000000, 0.5)
      .setOrigin(0.5, 0.5);

    this.xpBarBg = scene.add.rectangle(0, 0, xpBarWidth, xpBarHeight, 0x0d0d22)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(1, 0x555588);

    this.xpBar = scene.add.rectangle(-xpBarWidth / 2 + 1, 0, 0, xpBarHeight - 1, 0x3388dd)
      .setOrigin(0, 0.5);

    // XP bar highlight (top half for gradient look)
    this.xpBarHighlight = scene.add.rectangle(-xpBarWidth / 2 + 1, -0.5, 0, (xpBarHeight - 1) / 2, 0x55aaff, 0.3)
      .setOrigin(0, 0.5);

    this.xpBarFillWidth = xpBarWidth - 2;

    this.levelText = scene.add.text(0, -5, 'Lv 1', {
      fontSize: '7px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);

    this.xpContainer = scene.add.container(0, 0, [this.xpBarOutline, this.xpBarBg, this.xpBar, this.xpBarHighlight, this.levelText])
      .setDepth(100);

    // Lock XP bar to player position after physics
    scene.events.on('postupdate', () => {
      if (this.player && this.player.active) {
        this.xpContainer.setPosition(this.player.x, this.player.y + this.xpOffsetY);
      }
    });

    // Timer (top center) — styled with background
    this.timerBg = scene.add.rectangle(viewW / 2, 10, 52, 14, 0x000000, 0.35)
      .setScrollFactor(0).setDepth(100);
    this.timerText = scene.add.text(viewW / 2, 10, '00:00', {
      fontSize: '9px',
      color: '#eeeeff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // Kill count (top right) — styled with icon hint
    this.killBg = scene.add.rectangle(viewW - 30, 10, 58, 14, 0x000000, 0.35)
      .setScrollFactor(0).setDepth(100);
    this.killText = scene.add.text(viewW - 8, 10, 'Kills: 0', {
      fontSize: '8px',
      color: '#eeeeff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(101);

    // Grid will be created separately via createUpgradeGrid (in UI camera space)
    this.gridCols = 6;
    this.gridRows = 2;
    this.gridBorders = [];
    this.filledIcons = [];
    this.gridElements = [];
  }

  // Called from GameScene after UI camera is set up — uses 960x540 screen-pixel space
  createUpgradeGrid(scene, stopwatchBg) {
    const cellSize = 20;
    const gap = 2;

    // Position grid at top-left of screen, level with stopwatch
    const gridStartX = 10;
    const gridStartY = stopwatchBg.y + 2;

    this.uiGridStartX = gridStartX;
    this.uiGridStartY = gridStartY;
    this.uiCellSize = cellSize;
    this.uiGap = gap;

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const x = gridStartX + col * (cellSize + gap);
        const y = gridStartY + row * (cellSize + gap);

        // Cell shadow
        const shadow = scene.add.rectangle(x + 1, y + 1, cellSize, cellSize, 0x000000, 0.2)
          .setOrigin(0, 0)
          .setDepth(499);
        this.gridElements.push(shadow);

        const border = scene.add.rectangle(x, y, cellSize, cellSize, 0x0d0d22, 0.85)
          .setOrigin(0, 0)
          .setStrokeStyle(1, 0x3a3a66)
          .setDepth(500);
        this.gridBorders.push(border);
        this.gridElements.push(border);
      }
    }
  }

  updateUpgradeIcons(acquired) {
    // Clean up old icons
    this.filledIcons.forEach((slot) => {
      if (slot.icon) slot.icon.destroy();
    });
    this.filledIcons = [];

    // Reset all borders
    this.gridBorders.forEach((border) => {
      border.setStrokeStyle(1, 0x3a3a66);
      border.setFillStyle(0x0d0d22, 0.85);
    });

    let damageIdx = 0;
    let utilityIdx = 0;

    Object.keys(acquired).forEach((id) => {
      const level = acquired[id];
      if (level <= 0) return;

      const upgrade = UPGRADES[id];
      if (!upgrade) return;

      const isUtility = upgrade.isPassive;
      const row = isUtility ? 1 : 0;
      const col = isUtility ? utilityIdx : damageIdx;

      if (col >= this.gridCols) return;

      if (isUtility) utilityIdx++;
      else damageIdx++;

      const x = this.uiGridStartX + col * (this.uiCellSize + this.uiGap);
      const y = this.uiGridStartY + row * (this.uiCellSize + this.uiGap);

      const tierColor = TIER_COLORS[level - 1] || TIER_COLORS[4];
      const borderIdx = row * this.gridCols + col;
      this.gridBorders[borderIdx].setStrokeStyle(2, tierColor);
      this.gridBorders[borderIdx].setFillStyle(0x0a0a1a, 1);

      // Create icon
      const icon = this.scene.make.sprite({
        x: x + this.uiCellSize / 2,
        y: y + this.uiCellSize / 2,
        key: upgrade.icon,
        add: false,
      });
      icon._isUI = true;
      icon.setDepth(501).setScale(1.2);
      this.scene.add.existing(icon);

      this.filledIcons.push({ icon });
      this.gridElements.push(icon);

      if (this.scene.uiElements) this.scene.uiElements.add(icon);
      if (this.scene.cameras.main) this.scene.cameras.main.ignore(icon);
    });
  }

  update(player, xpSystem, timerSystem, killCount) {
    this.player = player;
    const fillWidth = this.xpBarFillWidth * xpSystem.xpProgress;
    this.xpBar.setSize(fillWidth, 2);
    this.xpBarHighlight.setSize(fillWidth, 1);
    this.levelText.setText(`Lv ${xpSystem.level}`);
    this.timerText.setText(timerSystem.timeString);
    this.killText.setText(`Kills: ${killCount}`);
  }
}
