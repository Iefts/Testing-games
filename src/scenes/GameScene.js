import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT } from '../config/GameConfig.js';
import { CHARACTERS } from '../config/Characters.js';
import { Player } from '../entities/Player.js';
import { InputManager } from '../systems/InputManager.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { Revolver } from '../weapons/Revolver.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
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
  }

  update(time, delta) {
    if (!this.player || this.player.hp <= 0) return;

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

    // Update spawn system
    this.spawnSystem.update(time, delta);
  }

  onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    // Deactivate bullet
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    // Damage enemy
    enemy.takeDamage(bullet.damage);
  }

  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active) return;
    player.takeDamage(enemy.damage);
  }

  onEnemyKilled(enemy) {
    this.killCount++;
  }

  onPlayerDeath() {
    // For now, just restart
    this.scene.restart();
  }
}
