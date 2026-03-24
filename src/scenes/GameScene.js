import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT } from '../config/GameConfig.js';
import { CHARACTERS } from '../config/Characters.js';
import { Player } from '../entities/Player.js';
import { InputManager } from '../systems/InputManager.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { XPSystem } from '../systems/XPSystem.js';
import { TimerSystem } from '../systems/TimerSystem.js';
import { Revolver } from '../weapons/Revolver.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.gameOver = false;

    // Set world bounds
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Create tiled grass background
    this.add.tileSprite(0, 0, MAP_WIDTH, MAP_HEIGHT, 'grass')
      .setOrigin(0, 0);

    // Enemy group
    this.enemies = this.physics.add.group();

    // Create player at center of map
    const charConfig = CHARACTERS.human;
    this.player = new Player(this, MAP_WIDTH / 2, MAP_HEIGHT / 2, charConfig);

    // Input manager
    this.inputManager = new InputManager(this);

    // Weapons
    this.weapons = [];
    this.revolver = new Revolver(this, this.player);
    this.weapons.push(this.revolver);

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

    // Camera follows player
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Track kills
    this.killCount = 0;

    // Listen for events
    this.events.on('enemyKilled', this.onEnemyKilled, this);
    this.events.on('playerDeath', this.onPlayerDeath, this);
    this.events.on('victory', this.onVictory, this);
    this.events.on('levelUp', this.onLevelUp, this);
  }

  update(time, delta) {
    if (!this.player || this.gameOver) return;

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

    // Update weapons
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
  }

  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active) return;
    player.takeDamage(enemy.damage);
  }

  onEnemyKilled(enemy) {
    this.killCount++;
  }

  onLevelUp(level) {
    // Will launch upgrade selection scene in Step 5
  }

  onPlayerDeath() {
    this.gameOver = true;
    // Will transition to GameOverScene in Step 6
    this.time.delayedCall(1000, () => {
      this.scene.restart();
    });
  }

  onVictory() {
    this.gameOver = true;
    // Will transition to GameOverScene in Step 6
    this.time.delayedCall(1000, () => {
      this.scene.restart();
    });
  }
}
