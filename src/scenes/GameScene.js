import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT } from '../config/GameConfig.js';
import { CHARACTERS } from '../config/Characters.js';
import { LEVELS } from '../config/Levels.js';
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
import { CardDeck } from '../weapons/CardDeck.js';
import { BloodOrb } from '../weapons/BloodOrb.js';
import { SnakeSword } from '../weapons/SnakeSword.js';
import { LaserDrones } from '../weapons/LaserDrones.js';
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

    // Create tiled background (uses level config)
    this.levelId = this.registry.get('level') || 'plains';
    this.levelConfig = LEVELS[this.levelId];
    this.add.tileSprite(0, 0, MAP_WIDTH, MAP_HEIGHT, this.levelConfig.tileKey)
      .setOrigin(0, 0);

    // Spawn obstacles based on level config
    this.trees = this.physics.add.staticGroup();
    this.cacti = this.physics.add.staticGroup();
    this.corals = this.physics.add.staticGroup();
    this.craters = this.physics.add.staticGroup();
    this.spawnObstacles();

    // Breakable pots
    this.pots = this.physics.add.group();
    this.spawnPots();

    // Health potions group
    this.healthPotions = this.physics.add.group();

    // Power-up drops group
    this.powerups = this.physics.add.group();

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
    this.isCardChar = charConfig.startingWeapon === 'cardDeck';
    this.isBloodMageChar = charConfig.startingWeapon === 'bloodOrb';
    this.isSnakeSwordChar = charConfig.startingWeapon === 'snakeSword';
    this.isDronePilotChar = charConfig.startingWeapon === 'laserDrones';
    if (this.isRapierChar) {
      this.startingWeapon = new Rapier(this, this.player);
      this.startingWeapon.setupCollision(this.enemies);
    } else if (this.isCardChar) {
      const cardStats = { fireRate: 800, damage: 6, speed: 220, range: 140, diamondBonusXP: 2 };
      this.startingWeapon = new CardDeck(this, this.player, cardStats);
      this.startingWeapon.setupCollision(this.enemies);
      this.physics.add.overlap(this.startingWeapon.cards, this.pots, this.onBulletHitPot, null, this);
    } else if (this.isBloodMageChar) {
      const bloodOrbStats = {
        fireRate: 900, damage: 8, bulletSpeed: 180, range: 140,
        lifeStealPercent: 0.15, killHealPercent: 0.05,
      };
      this.startingWeapon = new BloodOrb(this, this.player, bloodOrbStats);
      this.startingWeapon.setupCollision(this.enemies);
      this.physics.add.overlap(this.startingWeapon.orbs, this.pots, this.onBulletHitPot, null, this);
    } else if (this.isSnakeSwordChar) {
      this.startingWeapon = new SnakeSword(this, this.player);
      this.startingWeapon.setupCollision(this.enemies);
      this.physics.add.overlap(this.startingWeapon.poisonBolts, this.pots, this.onBulletHitPot, null, this);
    } else if (this.isDronePilotChar) {
      this.startingWeapon = new LaserDrones(this, this.player);
      this.startingWeapon.setupCollision(this.enemies);
    } else {
      this.startingWeapon = new Revolver(this, this.player);
    }
    this.weapons.push(this.startingWeapon);

    // Upgrade manager (pass character ID for character-specific upgrades)
    this.upgradeManager = new UpgradeManager(this, charId);

    // Spawn system
    this.spawnSystem = new SpawnSystem(this, this.player, this.enemies, this.levelConfig);

    // XP system
    this.xpSystem = new XPSystem(this, this.player);

    // Timer system — uses level duration
    this.timerSystem = new TimerSystem(this, this.levelConfig.duration);
    this.boss = null;

    // HUD
    this.hud = new HUD(this);

    // Damage numbers
    this.damageNumbers = new DamageNumbers(this);

    // Collisions: starting weapon bullets hit enemies (revolver only; rapier, cardDeck, bloodOrb handle their own)
    if (!this.isRapierChar && !this.isCardChar && !this.isBloodMageChar && !this.isSnakeSwordChar && !this.isDronePilotChar) {
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

    // Collisions: player bumps into cacti (blocks + damages)
    this.physics.add.collider(this.player, this.cacti, (player, cactus) => {
      if (!player.invulnerable) {
        player.takeDamage(5);
        // Knockback away from cactus
        const angle = Phaser.Math.Angle.Between(cactus.x, cactus.y, player.x, player.y);
        player.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
        this.damageNumbers?.show(player.x, player.y, 5, '#44aa44');
        this.cameras.main.shake(60, 0.001);
      }
    }, null, this);

    // Collisions: player bumps into coral (blocks + light damage)
    this.physics.add.collider(this.player, this.corals, (player) => {
      if (!player.invulnerable) {
        player.takeDamage(3);
        this.damageNumbers?.show(player.x, player.y, 3, '#ff66aa');
      }
    }, null, this);

    // Collisions: player bumps into craters (blocks + slow debuff)
    this.physics.add.collider(this.player, this.craters, (player) => {
      if (!player._craterSlowed) {
        player._craterSlowed = true;
        const origSpeed = player.speed;
        player.speed = origSpeed * 0.6;
        this.time.delayedCall(1500, () => {
          player.speed = origSpeed;
          player._craterSlowed = false;
        });
        this.damageNumbers?.show(player.x, player.y, 'SLOW', '#aaaaff');
      }
    }, null, this);

    // Collisions: player walks over pots to break them
    this.physics.add.overlap(
      this.player,
      this.pots,
      (player, pot) => {
        if (!pot.active) return;
        this.breakPot(pot);
      },
      null,
      this
    );

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
    } else if (!this.isCardChar && !this.isBloodMageChar && !this.isSnakeSwordChar && !this.isDronePilotChar) {
      // Revolver bullets break pots (CardDeck, BloodOrb, SnakeSword set up their own pot overlap)
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

    // Collisions: player picks up power-ups
    this.physics.add.overlap(
      this.player,
      this.powerups,
      this.onPlayerPickupPowerup,
      null,
      this
    );

    // Active power-up state
    this.activePowerup = null;
    this.flamethrowerParticles = null;

    // Passive heal over time (all characters except Blood Mage)
    if (charId !== 'bloodMage') {
      this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => {
          if (this.gameOver || this.paused) return;
          if (this.player.hp < this.player.maxHp) {
            this.player.hp = Math.min(this.player.hp + 1, this.player.maxHp);
            this.player.updateHealthBar();
            this.damageNumbers.show(this.player.x, this.player.y, 1, '#44ff44');
          }
        },
      });
    }

    // Camera follows player with zoom
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // Stopwatch — uses a separate zoom-1 camera pinned to top-right of screen
    this.stopwatchBg = this.add.rectangle(960 - 60, 10, 100, 24, 0x000000, 0.7)
      .setOrigin(0.5, 0).setStrokeStyle(1, 0x666644).setDepth(500);
    this.stopwatchText = this.add.text(960 - 60, 13, '00:00', {
      fontSize: '16px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(501);

    // Create upgrade grid in 960x540 space (next to stopwatch)
    this.hud.createUpgradeGrid(this, this.stopwatchBg);

    // Collect all UI-camera elements (stopwatch + grid)
    this.uiElements = new Set([this.stopwatchBg, this.stopwatchText, ...this.hud.gridElements]);

    // UI camera at zoom 1 to render the stopwatch + grid in screen-pixel space
    this.uiCam = this.cameras.add(0, 0, 960, 540);
    this.uiCam.setZoom(1);
    this.uiCam.setScroll(0, 0);

    // Main camera should NOT render UI elements
    this.cameras.main.ignore([...this.uiElements]);

    // UI camera should ONLY render UI elements — ignore everything else
    this.children.list.forEach((child) => {
      if (!this.uiElements.has(child)) {
        this.uiCam.ignore(child);
      }
    });

    // Also ignore future objects added to the scene (unless marked as UI)
    this.events.on('addedtoscene', (gameObject) => {
      if (!this.uiElements.has(gameObject) && !gameObject._isUI) {
        if (this.uiCam) this.uiCam.ignore(gameObject);
      }
    });

    // Track kills
    this.killCount = 0;

    // Listen for events
    this.events.on('enemyKilled', this.onEnemyKilled, this);
    this.events.on('playerDeath', this.onPlayerDeath, this);
    this.events.on('victory', this.onVictory, this);
    this.events.on('levelUp', this.onLevelUp, this);
    this.events.on('bossTime', this.onBossTime, this);

    // Pause on Escape
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.gameOver || this.paused) return;
      this.paused = true;
      this.physics.pause();
      this.timerSystem.pause();
      this.scene.launch('Pause');
    });

    // Dev menu on TAB (dev level only)
    if (this.levelConfig.isDev) {
      this.input.keyboard.on('keydown-TAB', (e) => {
        e.preventDefault();
        if (this.gameOver || this.paused) return;
        this.paused = true;
        this.physics.pause();
        this.scene.launch('DevMenu');
      });

      // Stop auto-spawning in dev level — player spawns manually
      this.spawnSystem.stopped = true;
    }
  }

  update(time, delta) {
    if (!this.player || this.gameOver || this.paused) return;

    // Player movement
    const movement = this.inputManager.getMovementVector(
      this.player.x,
      this.player.y
    );
    this.player.move(movement);

    // Track player facing direction for flamethrower
    if (movement.x !== 0 || movement.y !== 0) {
      this.playerFacingAngle = Math.atan2(movement.y, movement.x);
    }

    // Update flamethrower if active
    if (this.activePowerup === 'flamethrower' && this.flamethrowerParticles) {
      const angle = this.playerFacingAngle || 0;
      const degAngle = Phaser.Math.RadToDeg(angle);
      this.flamethrowerParticles.setPosition(this.player.x, this.player.y);
      this.flamethrowerParticles.particleAngle = { min: degAngle - 15, max: degAngle + 15 };

      // Damage enemies in the flame cone
      const now = time;
      this.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active) return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        if (dist > 80) return;
        const enemyAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        let angleDiff = Math.abs(enemyAngle - angle);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        if (angleDiff < Math.PI / 4) {
          const lastHit = enemy._flamethrowerHit || 0;
          if (now - lastHit >= 100) {
            enemy._flamethrowerHit = now;
            enemy.takeDamage(8);
            this.damageNumbers.show(enemy.x, enemy.y, 8, '#ff6600');
          }
        }
      });
      // Also damage boss with flamethrower
      if (this.boss && this.boss.active && this.hitBoss) {
        const bossDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
        if (bossDist <= 80) {
          const bossAngle = Math.atan2(this.boss.y - this.player.y, this.boss.x - this.player.x);
          let bossAngleDiff = Math.abs(bossAngle - angle);
          if (bossAngleDiff > Math.PI) bossAngleDiff = Math.PI * 2 - bossAngleDiff;
          if (bossAngleDiff < Math.PI / 4) {
            const bossLastHit = this.boss._flamethrowerHit || 0;
            if (now - bossLastHit >= 100) {
              this.boss._flamethrowerHit = now;
              this.hitBoss(8, '#ff6600');
            }
          }
        }
      }
    }

    // Enemies move toward player (skip if frozen)
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      if (this.activePowerup === 'freeze') {
        enemy.setVelocity(0, 0);
      } else {
        enemy.moveToward(this.player.x, this.player.y, delta);
      }
    });

    // Boss movement
    if (this.boss && this.boss.active) {
      const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
      this.boss.setVelocity(
        Math.cos(angle) * this.boss.speed,
        Math.sin(angle) * this.boss.speed
      );
      this.boss.healthBarContainer.setPosition(this.boss.x, this.boss.y);
    }

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
    this.stopwatchText.setText(this.timerSystem.timeString);
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

    // 0.01% chance to drop a power-up
    if (Math.random() < 0.0001) {
      this.spawnPowerup(enemy.x, enemy.y);
    }
  }

  spawnPowerup(x, y) {
    const types = ['flamethrower', 'freeze'];
    const type = types[Math.floor(Math.random() * types.length)];
    const spriteKey = type === 'flamethrower' ? 'powerup_flamethrower' : 'powerup_freeze';

    const powerup = this.powerups.get(x, y, spriteKey);
    if (!powerup) return;

    powerup.setActive(true);
    powerup.setVisible(true);
    powerup.body.enable = true;
    powerup.body.setAllowGravity(false);
    powerup.setVelocity(0, 0);
    powerup.setDepth(5);
    powerup.powerupType = type;

    // Pulsing glow effect to make it noticeable
    this.tweens.add({
      targets: powerup,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  onPlayerPickupPowerup(player, powerup) {
    if (!powerup.active) return;
    if (this.activePowerup) return; // only one power-up at a time

    const type = powerup.powerupType;

    powerup.setActive(false);
    powerup.setVisible(false);
    powerup.body.enable = false;
    this.tweens.killTweensOf(powerup);

    this.sound.play('sfx_powerup', { volume: 0.4 });

    if (type === 'flamethrower') {
      this.activateFlamethrower();
    } else if (type === 'freeze') {
      this.activateFreeze();
    }
  }

  activateFlamethrower() {
    this.activePowerup = 'flamethrower';
    const angle = this.playerFacingAngle || 0;

    this.sound.play('sfx_flamethrower', { volume: 0.3 });

    // Create flame particle emitter
    this.flamethrowerParticles = this.add.particles(this.player.x, this.player.y, 'flame', {
      speed: { min: 80, max: 160 },
      scale: { start: 1.5, end: 0 },
      lifespan: 400,
      quantity: 3,
      frequency: 30,
      angle: { min: Phaser.Math.RadToDeg(angle) - 15, max: Phaser.Math.RadToDeg(angle) + 15 },
      tint: [0xff6600, 0xffcc00, 0xcc2200, 0xffffcc],
      emitting: true,
    });
    this.flamethrowerParticles.setDepth(15);

    // HUD indicator
    const indicator = this.add.text(
      this.cameras.main.width / 2, 20,
      'FLAMETHROWER! 10s',
      { fontSize: '8px', fontFamily: 'monospace', color: '#ff6600', stroke: '#000', strokeThickness: 2 }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    let remaining = 10;
    const countdownEvent = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        remaining--;
        indicator.setText(`FLAMETHROWER! ${remaining}s`);
      },
    });

    // End after 10 seconds
    this.time.delayedCall(10000, () => {
      this.activePowerup = null;
      if (this.flamethrowerParticles) {
        this.flamethrowerParticles.destroy();
        this.flamethrowerParticles = null;
      }
      indicator.destroy();
      countdownEvent.destroy();
    });
  }

  activateFreeze() {
    this.activePowerup = 'freeze';

    this.sound.play('sfx_freeze', { volume: 0.4 });

    // Tint all active enemies blue and stop them
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        enemy.setTint(0x88ccff);
        enemy.setVelocity(0, 0);
      }
    });

    // Screen flash effect
    this.cameras.main.flash(300, 136, 200, 255);

    // HUD indicator
    const indicator = this.add.text(
      this.cameras.main.width / 2, 20,
      'FROZEN! 10s',
      { fontSize: '8px', fontFamily: 'monospace', color: '#88ccff', stroke: '#000', strokeThickness: 2 }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    let remaining = 10;
    const countdownEvent = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        remaining--;
        indicator.setText(`FROZEN! ${remaining}s`);
        // Keep newly spawned enemies frozen too
        this.enemies.getChildren().forEach((enemy) => {
          if (enemy.active) {
            enemy.setTint(0x88ccff);
            enemy.setVelocity(0, 0);
          }
        });
      },
    });

    // End after 10 seconds
    this.time.delayedCall(10000, () => {
      this.activePowerup = null;
      // Remove blue tint from all enemies
      this.enemies.getChildren().forEach((enemy) => {
        if (enemy.active) {
          enemy.clearTint();
        }
      });
      indicator.destroy();
      countdownEvent.destroy();
    });
  }

  onLevelUp(level) {
    if (this.gameOver) return;
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
    if (upgrade.id === 'revolverUp' || upgrade.id === 'rapierUp' || upgrade.id === 'cardDeckUp' || upgrade.id === 'bloodOrbUp' || upgrade.id === 'snakeSwordUp' || upgrade.id === 'laserDronesUp') {
      this.startingWeapon.updateStats(stats);
      return;
    }

    // Passive upgrades
    if (upgrade.id === 'magnetRange') {
      this.xpSystem.magnetRadius = stats.magnetRadius;
      return;
    }

    if (upgrade.id === 'speedBoost') {
      this.player.speed = CHARACTERS[this.characterId].speed + stats.speedBonus;
      return;
    }

    if (upgrade.id === 'xpBoost') {
      this.xpSystem.xpMultiplier = stats.xpMultiplier;
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
    this.scene.stop('LevelUp');
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', { victory: false, stats: this.getStats() });
    });
  }

  onVictory() {
    this.gameOver = true;
    this.scene.stop('LevelUp');
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', { victory: true, stats: this.getStats() });
    });
  }

  onBossTime() {
    // Stop spawning new enemies but keep existing ones alive (not in dev mode)
    if (!this.levelConfig.isDev) {
      this.spawnSystem.stopped = true;
    }

    // Flash warning text
    const cam = this.cameras.main;
    const warningText = this.add.text(cam.midPoint.x, cam.midPoint.y - 40, `${this.levelConfig.bossName || 'BOSS'} APPROACHES!`, {
      fontSize: '12px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    // Position warning in screen center (scrollFactor 0 with zoom 2 = 240, 135 center)
    warningText.setPosition(240, 60);

    this.tweens.add({
      targets: warningText,
      alpha: 0,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => warningText.destroy(),
    });

    this.cameras.main.shake(500, 0.005);

    // Spawn boss near the player
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const dist = 200;
    const bx = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 50, MAP_WIDTH - 50);
    const by = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 50, MAP_HEIGHT - 50);

    const boss = this.physics.add.sprite(bx, by, this.levelConfig.bossSprite || 'slime');
    boss.setScale(3);
    boss.setDepth(20);
    boss.body.setCircle(8);
    boss.body.setOffset(0, 0);
    boss.body.setCollideWorldBounds(true);

    // Scale boss HP with number of weapons the player has for a proper fight
    const weaponCount = this.weapons.length;
    const baseHp = this.levelConfig.bossHp || 500;
    boss.hp = baseHp + weaponCount * 200;
    boss.maxHp = boss.hp;
    boss.damage = this.levelConfig.bossDamage || 20;
    boss.speed = this.levelConfig.bossSpeed || 22;
    boss.isBoss = true;
    boss.lastPlayerHitTime = 0;

    // Boss health bar
    boss.healthBarBg = this.add.rectangle(0, -28, 40, 4, 0x000000)
      .setOrigin(0.5, 0.5).setStrokeStyle(1, 0xff0000);
    boss.healthBarFill = this.add.rectangle(-20, -28, 40, 3, 0xff2222)
      .setOrigin(0, 0.5);
    boss.healthBarContainer = this.add.container(bx, by, [boss.healthBarBg, boss.healthBarFill])
      .setDepth(21);

    this.boss = boss;

    // Boss-player collision (with cooldown to prevent instant death)
    this.physics.add.overlap(this.player, boss, () => {
      if (!boss.active) return;
      const now = this.time.now;
      if (now - boss.lastPlayerHitTime < 500) return;
      boss.lastPlayerHitTime = now;
      this.player.takeDamage(boss.damage);
      this.damageNumbers.show(this.player.x, this.player.y, boss.damage, DAMAGE_COLORS.enemy);
      this.sound.play('sfx_playerHit', { volume: 0.1 });
      this.cameras.main.shake(80, 0.003);
    }, null, this);

    // Brief spawn invulnerability so overlapping projectiles don't instant-kill
    boss._spawnInvuln = true;
    this.time.delayedCall(500, () => { boss._spawnInvuln = false; });

    // Create hitBoss function and store on scene so area weapons can use it
    this.hitBoss = (damage, color) => {
      if (!boss.active || boss._spawnInvuln) return;
      boss.hp -= damage;
      this.damageNumbers.show(boss.x, boss.y, damage, color || '#ffffff');

      // Flash
      boss.setTintFill(0xffffff);
      this.time.delayedCall(100, () => {
        if (boss.active) boss.clearTint();
      });

      // Update health bar
      const pct = Math.max(0, boss.hp / boss.maxHp);
      boss.healthBarFill.width = 40 * pct;

      if (boss.hp <= 0) {
        this.onBossDefeated(boss);
      }
    };

    // Boss takes damage from all weapon bullets/overlaps
    this.setupBossWeaponCollisions(boss, this.hitBoss);
  }

  setupBossWeaponCollisions(boss, hitBoss) {
    // Starting weapon bullets
    if (this.startingWeapon.bullets) {
      this.physics.add.overlap(this.startingWeapon.bullets, boss, (bullet) => {
        if (!bullet.active || !boss.active) return;
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
        hitBoss(bullet.damage, DAMAGE_COLORS.revolver);
      });
    }

    // Rapier
    if (this.isRapierChar) {
      this.startingWeapon.bossTarget = boss;
      this.startingWeapon.hitBoss = hitBoss;
    }

    // Card deck
    if (this.startingWeapon.cards) {
      this.physics.add.overlap(this.startingWeapon.cards, boss, (card) => {
        if (!card.active || !boss.active) return;
        card.setActive(false);
        card.setVisible(false);
        card.body.enable = false;
        hitBoss(card.damage || 6, '#ffffff');
      });
    }

    // Blood orbs
    if (this.startingWeapon.orbs) {
      this.physics.add.overlap(this.startingWeapon.orbs, boss, (orb) => {
        if (!orb.active || !boss.active) return;
        orb.setActive(false);
        orb.setVisible(false);
        orb.body.enable = false;
        hitBoss(orb.damage || 8, '#cc1111');
      });
    }

    // Snake sword poison bolts
    if (this.startingWeapon.poisonBolts) {
      this.physics.add.overlap(this.startingWeapon.poisonBolts, boss, (objA, objB) => {
        // Phaser may pass (bolt, boss) or (boss, bolt) — identify which is which
        const bolt = objA === boss ? objB : objA;
        if (!bolt.active || !boss.active) return;
        bolt.setActive(false);
        bolt.setVisible(false);
        bolt.body.enable = false;
        hitBoss(bolt.damage || 6, '#44cc44');
      });
    }

    // Upgrade weapons (including projectile-based and area-based)
    for (const weapon of this.weapons) {
      if (weapon === this.startingWeapon) continue;
      if (weapon.bullets) {
        this.physics.add.overlap(weapon.bullets, boss, (bullet) => {
          if (!bullet.active || !boss.active) return;
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.enable = false;
          hitBoss(bullet.damage, '#aaaaff');
        });
      }
      if (weapon.darts) {
        this.physics.add.overlap(weapon.darts, boss, (dart) => {
          if (!dart.active || !boss.active) return;
          if (dart.hitEnemies && dart.hitEnemies.has(boss)) return;
          if (dart.hitEnemies) dart.hitEnemies.add(boss);
          hitBoss(dart.damage || 5, '#88ccff');
        });
      }
      if (weapon.spears) {
        this.physics.add.overlap(weapon.spears, boss, (spear) => {
          if (!spear.active || spear.hasHit || !boss.active) return;
          spear.hasHit = true;
          hitBoss(spear.damage || 5, '#cccccc');
        });
      }
    }
  }

  onBossDefeated(boss) {
    boss.setActive(false);
    boss.setVisible(false);
    boss.body.enable = false;
    boss.healthBarContainer.destroy();
    this.boss = null;

    // In dev mode, just flash and continue — no victory screen
    if (this.levelConfig.isDev) {
      this.cameras.main.flash(500, 255, 255, 255);
      this.sound.play('sfx_victory', { volume: 0.5 });
      return;
    }

    // Kill all remaining enemies
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        enemy.die();
      }
    });

    // Stop spawning
    this.spawnSystem.stopped = true;

    // Screen flash
    this.cameras.main.flash(500, 255, 255, 255);
    this.sound.play('sfx_victory', { volume: 0.5 });

    // Show CLEARED overlay
    const clearedBg = this.add.rectangle(240, 135, 300, 120, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(300);

    const clearedText = this.add.text(240, 110, 'CLEARED!', {
      fontSize: '24px',
      color: '#44ff44',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const subText = this.add.text(240, 145, 'Level Complete', {
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    this.gameOver = true;
    this.scene.stop('LevelUp');

    this.time.delayedCall(3000, () => {
      this.scene.start('GameOver', {
        victory: true,
        stats: this.getStats(),
        levelCleared: this.levelId,
      });
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

    // 15% chance to drop health potion
    if (Math.random() < 0.15) {
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

  spawnObstacles() {
    const playerX = MAP_WIDTH / 2;
    const playerY = MAP_HEIGHT / 2;
    const obstacles = this.levelConfig.obstacles || [];

    for (const obstacleDef of obstacles) {
      const count = Math.floor(MAP_WIDTH * MAP_HEIGHT * (obstacleDef.density || 0.00002));

      for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(40, MAP_WIDTH - 40);
        const y = Phaser.Math.Between(40, MAP_HEIGHT - 40);

        const dist = Phaser.Math.Distance.Between(x, y, playerX, playerY);
        if (dist < 160) continue;

        if (obstacleDef.type === 'tree') {
          const tree = this.trees.create(x, y, 'tree');
          tree.body.setSize(8, 6);
          tree.body.setOffset(4, 18);
          tree.setDepth(y);
        } else if (obstacleDef.type === 'cactus') {
          const cactus = this.cacti.create(x, y, 'cactus');
          cactus.body.setSize(8, 6);
          cactus.body.setOffset(4, 18);
          cactus.setDepth(y);
        } else if (obstacleDef.type === 'coral') {
          const coral = this.corals.create(x, y, 'coral');
          coral.body.setSize(8, 6);
          coral.body.setOffset(4, 18);
          coral.setDepth(y);
        } else if (obstacleDef.type === 'crater') {
          const crater = this.craters.create(x, y, 'crater');
          crater.body.setSize(10, 6);
          crater.body.setOffset(3, 18);
          crater.setDepth(y);
        }
      }
    }
  }
}
