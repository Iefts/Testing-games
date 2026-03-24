import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT } from '../config/GameConfig.js';
import { CHARACTERS } from '../config/Characters.js';
import { Player } from '../entities/Player.js';
import { InputManager } from '../systems/InputManager.js';

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

    // Create player at center of map
    const charConfig = CHARACTERS.human;
    this.player = new Player(this, MAP_WIDTH / 2, MAP_HEIGHT / 2, charConfig);

    // Input manager
    this.inputManager = new InputManager(this);

    // Camera follows player
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  update() {
    if (!this.player || this.player.hp <= 0) return;

    // Player movement
    const movement = this.inputManager.getMovementVector(
      this.player.x,
      this.player.y
    );
    this.player.move(movement);
  }
}
