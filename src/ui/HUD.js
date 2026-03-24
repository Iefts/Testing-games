import Phaser from 'phaser';

export class HUD {
  constructor(scene) {
    this.scene = scene;

    // Create a fixed camera UI layer
    // Health bar
    this.healthBarBg = scene.add.rectangle(4, 4, 80, 8, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.healthBar = scene.add.rectangle(5, 5, 78, 6, 0xff3333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

    // XP bar
    this.xpBarBg = scene.add.rectangle(4, 14, 80, 6, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.xpBar = scene.add.rectangle(5, 15, 78, 4, 0x44aaff)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

    // Level text
    this.levelText = scene.add.text(86, 4, 'Lv 1', {
      fontSize: '8px',
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(101);

    // Timer
    this.timerText = scene.add.text(240, 4, '20:00', {
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    // Kill count
    this.killText = scene.add.text(476, 4, 'Kills: 0', {
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
  }

  update(player, xpSystem, timerSystem, killCount) {
    // Health bar
    const healthPct = player.hp / player.maxHp;
    this.healthBar.setSize(78 * healthPct, 6);
    if (healthPct > 0.5) {
      this.healthBar.setFillStyle(0x44cc44);
    } else if (healthPct > 0.25) {
      this.healthBar.setFillStyle(0xffaa00);
    } else {
      this.healthBar.setFillStyle(0xff3333);
    }

    // XP bar
    this.xpBar.setSize(78 * xpSystem.xpProgress, 4);

    // Level
    this.levelText.setText(`Lv ${xpSystem.level}`);

    // Timer
    this.timerText.setText(timerSystem.timeString);

    // Kills
    this.killText.setText(`Kills: ${killCount}`);
  }
}
