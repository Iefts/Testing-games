import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy.js';
import { ENEMIES } from '../config/Enemies.js';

export class SpawnSystem {
  constructor(scene, player, enemyGroup) {
    this.scene = scene;
    this.player = player;
    this.enemyGroup = enemyGroup;

    this.spawnTimer = 0;
    this.elapsedSeconds = 0;
    this.baseSpawnRate = 1000; // ms between spawns
    this.minSpawnDist = 400;
    this.maxSpawnDist = 600;
  }

  update(time, delta) {
    this.elapsedSeconds += delta / 1000;
    const elapsedMinutes = this.elapsedSeconds / 60;

    // Spawn rate increases over time
    const currentRate = this.baseSpawnRate / (1 + elapsedMinutes * 0.3);

    this.spawnTimer += delta;
    if (this.spawnTimer >= currentRate) {
      this.spawnTimer = 0;
      this.spawnEnemy(elapsedMinutes);
    }
  }

  spawnEnemy(elapsedMinutes) {
    const config = ENEMIES.greenSlime;

    // Find an inactive enemy in the pool or create one
    let enemy = this.enemyGroup.getFirstDead(false);

    if (!enemy) {
      if (this.enemyGroup.getLength() >= 200) return; // Pool full
      enemy = new Enemy(this.scene, 0, 0, config);
      this.enemyGroup.add(enemy);
      enemy.setActive(false);
      enemy.setVisible(false);
      enemy.body.enable = false;
    }

    // Spawn at random position in ring around player
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const dist = Phaser.Math.FloatBetween(this.minSpawnDist, this.maxSpawnDist);
    const x = Phaser.Math.Clamp(
      this.player.x + Math.cos(angle) * dist,
      16, this.scene.physics.world.bounds.width - 16
    );
    const y = Phaser.Math.Clamp(
      this.player.y + Math.sin(angle) * dist,
      16, this.scene.physics.world.bounds.height - 16
    );

    // Health scales with time
    const healthMultiplier = 1 + elapsedMinutes * 0.15;
    enemy.spawn(x, y, healthMultiplier);
  }
}
