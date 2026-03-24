import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT } from '../config/GameConfig.js';
import { CHARACTERS } from '../config/Characters.js';
import { Player } from '../entities/Player.js';
import { InputManager } from '../systems/InputManager.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { XPSystem } from '../systems/XPSystem.js';
import { TimerSystem } from '../systems/TimerSystem.js';
import { UpgradeManager } from '../systems/UpgradeManager.js';
import { Revolver } from '../weapons/Revolver.js';
import { DamageAura } from '../weapons/DamageAura.js';
import { UnicornRider } from '../weapons/UnicornRider.js';
import { PiercingDart } from '../weapons/PiercingDart.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.gameOver = false;
    this.paused = false;

    // Set world bounds
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Create tiled grass background
    this.add.tileSprite(0, 0, MAP_WIDTH, MAP_HEIGHT, 'grass')
      .setOrigin(0, 0);

    // Scatter trees as obstacles
    this.trees = this.physics.add.staticGroup();
    this.spawnTrees();

    // Enemy group
    this.enemies = this.physics.add.group();

    // Create player at center of map
    const charConfig = CHARACTERS.human;
    this.player = new Player(this, MAP_WIDTH / 2, MAP_HEIGHT / 2, charConfig);

    // Input manager
    this.inputManager = new InputManager(this);

    // Weapons (revolver is always active)
    this.weapons = [];
    this.upgradeWeapons = {}; // keyed by upgrade id
    this.revolver = new Revolver(this, this.player);
    this.weapons.push(this.revolver);

    // Upgrade manager
    this.upgradeManager = new UpgradeManager(this);

    // Spawn system
    this.spawnSystem = new SpawnSystem(this, this.player, this.enemies);

    // XP system
    this.xpSystem = new XPSystem(this, this.player);

    // Timer system
    this.timerSystem = new TimerSystem(this);

    // HUD
    this.hud = new HUD(this);

    // Collisions: bullets hit enemies
    this.physics.add.overlap(
      this.revolver.bullets,
      this.enemies,
      this.onBulletHitEnemy,
      null,
      this
    );

    // Collisions: enemies hit player
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.onEnemyHitPlayer,
      null,
      this
    );

    // Collisions: player bumps into trees
    this.physics.add.collider(this.player, this.trees);

    // Camera follows player with zoom
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // Track kills
    this.killCount = 0;

    // Listen for events
    this.events.on('enemyKilled', this.onEnemyKilled, this);
    this.events.on('playerDeath', this.onPlayerDeath, this);
    this.events.on('victory', this.onVictory, this);
    this.events.on('levelUp', this.onLevelUp, this);

    // Pause on Escape
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.gameOver || this.paused) return;
      this.paused = true;
      this.physics.pause();
      this.timerSystem.pause();
      this.scene.launch('Pause');
    });
  }

  update(time, delta) {
    if (!this.player || this.gameOver || this.paused) return;

    // Player movement
    const movement = this.inputManager.getMovementVector(
      this.player.x,
      this.player.y
    );
    this.player.move(movement);

    // Enemies move toward player
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        enemy.moveToward(this.player.x, this.player.y);
      }
    });

    // Update all weapons
    this.weapons.forEach((weapon) => {
      weapon.update(time, this.enemies);
    });

    // Update systems
    this.spawnSystem.update(time, delta);
    this.xpSystem.update();
    this.timerSystem.update(delta);

    // Update HUD
    this.hud.update(this.player, this.xpSystem, this.timerSystem, this.killCount);
  }

  onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    enemy.takeDamage(bullet.damage);
    this.sound.play('sfx_hit', { volume: 0.2 });
  }

  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active) return;
    player.takeDamage(enemy.damage);
    this.sound.play('sfx_playerHit', { volume: 0.4 });
    this.cameras.main.shake(100, 0.005);
  }

  onEnemyKilled(enemy) {
    this.killCount++;
    this.sound.play('sfx_enemyDeath', { volume: 0.25 });
    // Death particle effect
    const particles = this.add.particles(enemy.x, enemy.y, 'bullet', {
      speed: { min: 30, max: 80 },
      scale: { start: 1.5, end: 0 },
      lifespan: 300,
      quantity: 5,
      tint: 0x44cc44,
      emitting: false,
    });
    particles.explode();
    this.time.delayedCall(400, () => particles.destroy());
  }

  onLevelUp(level) {
    const upgrades = this.upgradeManager.getRandomUpgrades(3);
    if (upgrades.length === 0) return;

    this.paused = true;
    this.physics.pause();

    this.scene.launch('LevelUp', {
      upgrades,
      onSelect: (selected) => {
        this.applyUpgrade(selected);
        this.paused = false;
        this.physics.resume();
      },
    });
  }

  applyUpgrade(upgrade) {
    const newLevel = this.upgradeManager.applyUpgrade(upgrade.id);
    const stats = this.upgradeManager.getStats(upgrade.id);

    if (this.upgradeWeapons[upgrade.id]) {
      // Upgrade existing weapon
      this.upgradeWeapons[upgrade.id].updateStats(stats);
    } else {
      // Create new weapon
      let weapon;
      switch (upgrade.id) {
        case 'damageAura':
          weapon = new DamageAura(this, this.player, stats);
          break;
        case 'unicornRider':
          weapon = new UnicornRider(this, this.player, stats);
          break;
        case 'piercingDart':
          weapon = new PiercingDart(this, this.player, stats);
          weapon.setupCollision(this.enemies);
          break;
      }
      if (weapon) {
        this.upgradeWeapons[upgrade.id] = weapon;
        this.weapons.push(weapon);
      }
    }
  }

  getStats() {
    const elapsed = this.timerSystem.elapsedSeconds;
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    return {
      time: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      kills: this.killCount,
      level: this.xpSystem.level,
    };
  }

  onPlayerDeath() {
    this.gameOver = true;
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', { victory: false, stats: this.getStats() });
    });
  }

  onVictory() {
    this.gameOver = true;
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', { victory: true, stats: this.getStats() });
    });
  }

  spawnTrees() {
    const treeCount = Math.floor(MAP_WIDTH * MAP_HEIGHT * 0.00002);
    const playerX = MAP_WIDTH / 2;
    const playerY = MAP_HEIGHT / 2;

    for (let i = 0; i < treeCount; i++) {
      const x = Phaser.Math.Between(40, MAP_WIDTH - 40);
      const y = Phaser.Math.Between(40, MAP_HEIGHT - 40);

      // Don't spawn trees too close to player start
      const dist = Phaser.Math.Distance.Between(x, y, playerX, playerY);
      if (dist < 160) continue;

      const tree = this.trees.create(x, y, 'tree');
      tree.body.setSize(8, 6);
      tree.body.setOffset(4, 18);
      tree.setDepth(y); // Trees in front overlap those behind
    }
  }
}
