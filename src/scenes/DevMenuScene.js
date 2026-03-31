import Phaser from 'phaser';
import { UPGRADES } from '../config/Upgrades.js';
import { ENEMIES } from '../config/Enemies.js';
import { LEVELS } from '../config/Levels.js';

export class DevMenuScene extends Phaser.Scene {
  constructor() {
    super('DevMenu');
  }

  create() {
    const gameScene = this.scene.get('Game');
    this.gameScene = gameScene;

    // Dim overlay
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.85).setDepth(190);

    // Title
    this.add.text(480, 20, 'DEV MENU', {
      fontSize: '28px',
      color: '#ff8800',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);

    // Close hint
    this.add.text(480, 48, 'TAB to close', {
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(0.5).setDepth(200);

    // === GOD MODE TOGGLE ===
    this.godMode = gameScene.player._godMode || false;
    this.godBtn = this.add.text(480, 80, this.godMode ? 'GOD MODE: ON' : 'GOD MODE: OFF', {
      fontSize: '18px',
      color: this.godMode ? '#44ff44' : '#ff4444',
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 20, y: 6 },
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    this.godBtn.on('pointerdown', () => {
      this.godMode = !this.godMode;
      gameScene.player._godMode = this.godMode;
      gameScene.player.invulnerable = this.godMode;
      this.godBtn.setText(this.godMode ? 'GOD MODE: ON' : 'GOD MODE: OFF');
      this.godBtn.setColor(this.godMode ? '#44ff44' : '#ff4444');
    });

    // === UPGRADES PANEL ===
    this.add.text(30, 115, 'UPGRADES (click to grant)', {
      fontSize: '14px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setDepth(200);

    const upgrades = Object.values(UPGRADES);
    const weaponUpgrades = upgrades.filter(u => !u.isPassive);
    const passiveUpgrades = upgrades.filter(u => u.isPassive);

    // Weapon upgrades - left column
    this.add.text(30, 138, 'Weapons:', {
      fontSize: '11px', color: '#aaaacc',
    }).setDepth(200);

    let wy = 154;
    weaponUpgrades.forEach((upgrade) => {
      if (upgrade.characterOnly && upgrade.characterOnly !== gameScene.characterId) return;
      const currentLevel = gameScene.upgradeManager.acquired[upgrade.id] || 0;
      const btn = this.add.text(35, wy, `${upgrade.name} [${currentLevel}/${upgrade.maxLevel}]`, {
        fontSize: '12px',
        color: currentLevel >= upgrade.maxLevel ? '#666666' : '#44aaff',
        backgroundColor: '#222244',
        padding: { x: 6, y: 3 },
      }).setDepth(200).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setBackgroundColor('#333366'));
      btn.on('pointerout', () => btn.setBackgroundColor('#222244'));
      btn.on('pointerdown', () => {
        if (gameScene.upgradeManager.acquired[upgrade.id] >= upgrade.maxLevel) return;
        const fakeUpgrade = {
          ...upgrade,
          currentLevel: gameScene.upgradeManager.acquired[upgrade.id],
          nextLevel: gameScene.upgradeManager.acquired[upgrade.id] + 1,
        };
        gameScene.applyUpgrade(fakeUpgrade);
        gameScene.hud.updateUpgradeIcons(gameScene.upgradeManager.acquired);
        const newLevel = gameScene.upgradeManager.acquired[upgrade.id];
        btn.setText(`${upgrade.name} [${newLevel}/${upgrade.maxLevel}]`);
        if (newLevel >= upgrade.maxLevel) btn.setColor('#666666');
      });

      wy += 22;
    });

    // Passive upgrades - middle column
    this.add.text(310, 138, 'Passives:', {
      fontSize: '11px', color: '#aaaacc',
    }).setDepth(200);

    let py = 154;
    passiveUpgrades.forEach((upgrade) => {
      const currentLevel = gameScene.upgradeManager.acquired[upgrade.id] || 0;
      const btn = this.add.text(315, py, `${upgrade.name} [${currentLevel}/${upgrade.maxLevel}]`, {
        fontSize: '12px',
        color: currentLevel >= upgrade.maxLevel ? '#666666' : '#44ff88',
        backgroundColor: '#222244',
        padding: { x: 6, y: 3 },
      }).setDepth(200).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setBackgroundColor('#333366'));
      btn.on('pointerout', () => btn.setBackgroundColor('#222244'));
      btn.on('pointerdown', () => {
        if (gameScene.upgradeManager.acquired[upgrade.id] >= upgrade.maxLevel) return;
        const fakeUpgrade = {
          ...upgrade,
          currentLevel: gameScene.upgradeManager.acquired[upgrade.id],
          nextLevel: gameScene.upgradeManager.acquired[upgrade.id] + 1,
        };
        gameScene.applyUpgrade(fakeUpgrade);
        gameScene.hud.updateUpgradeIcons(gameScene.upgradeManager.acquired);
        const newLevel = gameScene.upgradeManager.acquired[upgrade.id];
        btn.setText(`${upgrade.name} [${newLevel}/${upgrade.maxLevel}]`);
        if (newLevel >= upgrade.maxLevel) btn.setColor('#666666');
      });

      py += 22;
    });

    // === SPAWN ENEMIES PANEL ===
    this.add.text(600, 115, 'SPAWN ENEMIES (click)', {
      fontSize: '14px',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setDepth(200);

    let ey = 140;
    Object.values(ENEMIES).forEach((enemy) => {
      const btn = this.add.text(605, ey, `${enemy.name}`, {
        fontSize: '12px',
        color: '#ff8866',
        backgroundColor: '#222244',
        padding: { x: 6, y: 3 },
      }).setDepth(200).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setBackgroundColor('#333366'));
      btn.on('pointerout', () => btn.setBackgroundColor('#222244'));
      btn.on('pointerdown', () => {
        // Spawn a cluster near the player
        const px = gameScene.player.x;
        const py = gameScene.player.y;
        for (let i = 0; i < 5; i++) {
          const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          const dist = Phaser.Math.FloatBetween(100, 200);
          const x = px + Math.cos(angle) * dist;
          const y = py + Math.sin(angle) * dist;
          gameScene.spawnSystem.spawnSingleEnemy(enemy, x, y, 1);
        }
      });

      ey += 22;
    });

    // Spawn wave button
    const waveBtn = this.add.text(605, ey + 10, 'SPAWN BURST WAVE', {
      fontSize: '12px',
      color: '#ff4444',
      fontStyle: 'bold',
      backgroundColor: '#442222',
      padding: { x: 6, y: 3 },
    }).setDepth(200).setInteractive({ useHandCursor: true });

    waveBtn.on('pointerover', () => waveBtn.setBackgroundColor('#553333'));
    waveBtn.on('pointerout', () => waveBtn.setBackgroundColor('#442222'));
    waveBtn.on('pointerdown', () => {
      gameScene.spawnSystem.spawnBurstWave(1);
    });

    // Boss spawn buttons
    let by = ey + 42;
    this.add.text(605, by, 'BOSSES:', {
      fontSize: '11px', color: '#aaaacc',
    }).setDepth(200);
    by += 16;

    Object.values(LEVELS).forEach((level) => {
      if (!level.bossName || level.isDev) return;
      const btn = this.add.text(605, by, `${level.bossName}`, {
        fontSize: '12px',
        color: '#ff44ff',
        backgroundColor: '#331133',
        padding: { x: 6, y: 3 },
      }).setDepth(200).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setBackgroundColor('#442244'));
      btn.on('pointerout', () => btn.setBackgroundColor('#331133'));
      btn.on('pointerdown', () => {
        // Kill existing boss first
        if (gameScene.boss && gameScene.boss.active) {
          gameScene.boss.hp = 0;
          gameScene.onBossDefeated(gameScene.boss);
        }
        // Close menu first, then spawn boss on next frame so overlaps don't stack
        const origConfig = gameScene.levelConfig;
        this.closeMenu();
        gameScene.time.delayedCall(100, () => {
          gameScene.levelConfig = { ...origConfig, ...level };
          gameScene.onBossTime();
          gameScene.levelConfig = origConfig;
        });
      });

      by += 22;
    });

    // === UTILITY BUTTONS ===
    const utilY = 480;

    // Kill all enemies
    const killAllBtn = this.add.text(200, utilY, 'KILL ALL ENEMIES', {
      fontSize: '14px',
      color: '#ff4444',
      fontStyle: 'bold',
      backgroundColor: '#442222',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    killAllBtn.on('pointerover', () => killAllBtn.setBackgroundColor('#553333'));
    killAllBtn.on('pointerout', () => killAllBtn.setBackgroundColor('#442222'));
    killAllBtn.on('pointerdown', () => {
      gameScene.enemies.getChildren().forEach(e => {
        if (e.active) e.die();
      });
    });

    // Heal to full
    const healBtn = this.add.text(480, utilY, 'HEAL TO FULL', {
      fontSize: '14px',
      color: '#44ff44',
      fontStyle: 'bold',
      backgroundColor: '#224422',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    healBtn.on('pointerover', () => healBtn.setBackgroundColor('#335533'));
    healBtn.on('pointerout', () => healBtn.setBackgroundColor('#224422'));
    healBtn.on('pointerdown', () => {
      gameScene.player.hp = gameScene.player.maxHp;
    });

    // Level up (grant XP)
    const lvlBtn = this.add.text(760, utilY, 'GRANT LEVEL UP', {
      fontSize: '14px',
      color: '#ffdd44',
      fontStyle: 'bold',
      backgroundColor: '#444422',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    lvlBtn.on('pointerover', () => lvlBtn.setBackgroundColor('#555533'));
    lvlBtn.on('pointerout', () => lvlBtn.setBackgroundColor('#444422'));
    lvlBtn.on('pointerdown', () => {
      gameScene.xpSystem.xp = gameScene.xpSystem.xpToNextLevel;
      gameScene.xpSystem.level++;
      gameScene.events.emit('levelUp', gameScene.xpSystem.level);
    });

    // Close on TAB
    this.input.keyboard.on('keydown-TAB', (e) => {
      e.preventDefault();
      this.closeMenu();
    });
  }

  closeMenu() {
    const gameScene = this.gameScene;
    gameScene.paused = false;
    gameScene.physics.resume();
    // Re-enforce god mode invulnerability if active
    if (gameScene.player._godMode) {
      gameScene.player.invulnerable = true;
    }
    this.scene.stop();
  }
}
