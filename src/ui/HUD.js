import Phaser from 'phaser';

export class HUD {
  constructor(scene) {
    this.scene = scene;

    // Health bar
    this.healthBarBg = scene.add.rectangle(8, 8, 160, 16, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.healthBar = scene.add.rectangle(10, 10, 156, 12, 0xff3333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

    // XP bar
    this.xpBarBg = scene.add.rectangle(8, 28, 160, 12, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.xpBar = scene.add.rectangle(10, 30, 156, 8, 0x44aaff)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

    // Level text
    this.levelText = scene.add.text(174, 8, 'Lv 1', {
      fontSize: '16px',
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(101);

    // Timer
    this.timerText = scene.add.text(480, 8, '20:00', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    // Kill count
    this.killText = scene.add.text(952, 8, 'Kills: 0', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
  }

  update(player, xpSystem, timerSystem, killCount) {
    const healthPct = player.hp / player.maxHp;
    this.healthBar.setSize(156 * healthPct, 12);
    if (healthPct > 0.5) {
      this.healthBar.setFillStyle(0x44cc44);
    } else if (healthPct > 0.25) {
      this.healthBar.setFillStyle(0xffaa00);
    } else {
      this.healthBar.setFillStyle(0xff3333);
    }

    this.xpBar.setSize(156 * xpSystem.xpProgress, 8);
    this.levelText.setText(`Lv ${xpSystem.level}`);
    this.timerText.setText(timerSystem.timeString);
    this.killText.setText(`Kills: ${killCount}`);
  }
}
