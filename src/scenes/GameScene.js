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
import { Rapier } from '../weapons/Rapier.js';
import { DamageAura } from '../weapons/DamageAura.js';
import { UnicornRider } from '../weapons/UnicornRider.js';
import { PiercingDart } from '../weapons/PiercingDart.js';
import { SpearRain } from '../weapons/SpearRain.js';
import { FlameTrail } from '../weapons/FlameTrail.js';
import { Tornado } from '../weapons/Tornado.js';
import { BugSwarm } from '../weapons/BugSwarm.js';
import { HUD } from '../ui/HUD.js';
import { DamageNumbers, DAMAGE_COLORS } from '../ui/DamageNumbers.js';

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

    // Breakable pots
    this.pots = this.physics.add.group();
    this.spawnPots();

    // Health potions group
    this.healthPotions = this.physics.add.group();

    // Enemy group
    this.enemies = this.physics.add.group();

    // Create player at center of map
    const charId = this.registry.get('character') || 'human';
    const charConfig = CHARACTERS[charId];
    this.characterId = charId;
    this.player = new Player(this, MAP_WIDTH / 2, MAP_HEIGHT / 2, charConfig);

    // Input manager
    this.inputManager = new InputManager(this);

    // Weapons (starting weapon is always active)
    this.weapons = [];
    this.upgradeWeapons = {}; // keyed by upgrade id
    this.isRapierChar = charConfig.startingWeapon === 'rapier';
    if (this.isRapierChar) {
      this.startingWeapon = new Rapier(this, this.player);
      this.startingWeapon.setupCollision(this.enemies);
    } else {
      this.startingWeapon = new Revolver(this, this.player);
    }
    this.weapons.push(this.startingWeapon);

    // Upgrade manager (pass character ID for character-specific upgrades)
    this.upgradeManager = new UpgradeManager(this, charId);

    // Spawn system
    this.spawnSystem = new SpawnSystem(this, this.player, this.enemies);

    // XP system
    this.xpSystem = new XPSystem(this, this.player);

    // Timer system
    this.timerSystem = new TimerSystem(this);

    // HUD
    this.hud = new HUD(this);

    // Damage numbers
    this.damageNumbers = new DamageNumbers(this);

    // Collisions: starting weapon bullets hit enemies (revolver only, rapier handles its own)
    if (!this.isRapierChar) {
      this.physics.add.overlap(
        this.startingWeapon.bullets,
        this.enemies,
        this.onBulletHitEnemy,
        null,
        this
      );
    }

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

    // Collisions: starting weapon breaks pots
    if (this.isRapierChar) {
      // Rapier thrust breaks pots
      this.physics.add.overlap(
        this.startingWeapon,
        this.pots,
        (rapier, pot) => {
          if (!rapier.active || !pot.active) return;
          this.breakPot(pot);
        },
        null,
        this
      );
    } else {
      // Revolver bullets break pots
      this.physics.add.overlap(
        this.startingWeapon.bullets,
        this.pots,
        this.onBulletHitPot,
        null,
        this
      );
    }

    // Collisions: player picks up health potions
    this.physics.add.overlap(
      this.player,
      this.healthPotions,
      this.onPlayerPickupPotion,
      null,
      this
    );

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
    this.player.updateHealthBar();
  }

  onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    enemy.takeDamage(bullet.damage);
    this.damageNumbers.show(enemy.x, enemy.y, bullet.damage, DAMAGE_COLORS.revolver);
    this.sound.play('sfx_hit', { volume: 0.2 });
  }

  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active) return;
    player.takeDamage(enemy.damage);
    this.damageNumbers.show(player.x, player.y, enemy.damage, DAMAGE_COLORS.enemy);
    this.sound.play('sfx_playerHit', { volume: 0.1 });
    this.cameras.main.shake(80, 0.002);
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
    // Rare upgrades apply twice (capped at maxLevel by UpgradeManager)
    const times = upgrade.isRare ? 2 : 1;

    for (let i = 0; i < times; i++) {
      this.applySingleUpgrade(upgrade);
    }

    // Refresh HUD upgrade icons
    this.hud.updateUpgradeIcons(this.upgradeManager.acquired);
  }

  applySingleUpgrade(upgrade) {
    const newLevel = this.upgradeManager.applyUpgrade(upgrade.id);
    const stats = this.upgradeManager.getStats(upgrade.id);

    // Starting weapon upgrades apply directly to the existing weapon
    if (upgrade.id === 'revolverUp' || upgrade.id === 'rapierUp') {
      this.startingWeapon.updateStats(stats);
      return;
    }

    // Passive upgrades
    if (upgrade.id === 'magnetRange') {
      this.xpSystem.magnetRadius = stats.magnetRadius;
      return;
    }

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
          this.physics.add.overlap(weapon.darts, this.pots, this.onBulletHitPot, null, this);
          break;
        case 'spearRain':
          weapon = new SpearRain(this, this.player, stats);
          weapon.setupCollision(this.enemies);
          this.physics.add.overlap(weapon.spears, this.pots, this.onBulletHitPot, null, this);
          break;
        case 'flameTrail':
          weapon = new FlameTrail(this, this.player, stats);
          weapon.setupCollision(this.enemies);
          break;
        case 'tornado':
          weapon = new Tornado(this, this.player, stats);
          weapon.setupCollision(this.enemies);
          break;
        case 'bugs':
          weapon = new BugSwarm(this, this.player, stats);
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

  onBulletHitPot(bullet, pot) {
    if (!bullet.active || !pot.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    this.breakPot(pot);
  }

  breakPot(pot) {
    pot.setActive(false);
    pot.setVisible(false);
    pot.body.enable = false;

    this.sound.play('sfx_potBreak', { volume: 0.25 });

    // Shatter particles
    const particles = this.add.particles(pot.x, pot.y, 'bullet', {
      speed: { min: 20, max: 60 },
      scale: { start: 1, end: 0 },
      lifespan: 250,
      quantity: 4,
      tint: 0xcc7744,
      emitting: false,
    });
    particles.explode();
    this.time.delayedCall(300, () => particles.destroy());

    // 15% chance to drop XP gem
    if (Math.random() < 0.15) {
      const gem = this.xpSystem.gems.get(pot.x, pot.y, 'xpGem');
      if (gem) {
        gem.setActive(true);
        gem.setVisible(true);
        gem.body.enable = true;
        gem.xpValue = 10;
        gem.body.setAllowGravity(false);
        gem.setVelocity(0, 0);
      }
    }

    // 3% chance to drop health potion
    if (Math.random() < 0.03) {
      const potion = this.healthPotions.get(pot.x, pot.y, 'healthPotion');
      if (potion) {
        potion.setActive(true);
        potion.setVisible(true);
        potion.body.enable = true;
        potion.body.setAllowGravity(false);
        potion.setVelocity(0, 0);
        potion.setDepth(5);
      }
    }

    // Respawn pot after 30-60 seconds at a random location
    this.time.delayedCall(Phaser.Math.Between(30000, 60000), () => {
      const x = Phaser.Math.Between(40, MAP_WIDTH - 40);
      const y = Phaser.Math.Between(40, MAP_HEIGHT - 40);
      pot.setPosition(x, y);
      pot.setActive(true);
      pot.setVisible(true);
      pot.body.enable = true;
    });
  }

  onPlayerPickupPotion(player, potion) {
    if (!potion.active) return;

    potion.setActive(false);
    potion.setVisible(false);
    potion.body.enable = false;

    // Heal 50% of max HP
    const healAmount = Math.floor(player.maxHp * 0.5);
    player.hp = Math.min(player.maxHp, player.hp + healAmount);

    this.sound.play('sfx_healthPickup', { volume: 0.3 });
    this.damageNumbers.show(player.x, player.y, healAmount, '#44ff44');
  }

  spawnPots() {
    const potCount = Math.floor(MAP_WIDTH * MAP_HEIGHT * 0.000015);
    const playerX = MAP_WIDTH / 2;
    const playerY = MAP_HEIGHT / 2;

    for (let i = 0; i < potCount; i++) {
      const x = Phaser.Math.Between(40, MAP_WIDTH - 40);
      const y = Phaser.Math.Between(40, MAP_HEIGHT - 40);

      const dist = Phaser.Math.Distance.Between(x, y, playerX, playerY);
      if (dist < 160) continue;

      const pot = this.pots.create(x, y, 'pot');
      pot.body.setAllowGravity(false);
      pot.body.setImmovable(true);
      pot.setDepth(y);
    }
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
