import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy.js';
import { ENEMIES } from '../config/Enemies.js';

export class SpawnSystem {
  constructor(scene, player, enemyGroup, levelConfig) {
    this.scene = scene;
    this.player = player;
    this.enemyGroup = enemyGroup;
    this.allowedEnemyTypes = levelConfig ? levelConfig.enemyTypes : null;

    this.spawnTimer = 0;
    this.elapsedSeconds = 0;
    this.baseSpawnRate = 1000; // ms between spawns
    this.minSpawnDist = 400;
    this.maxSpawnDist = 600;

    // Enemy arrow projectiles (for skeleton)
    this.arrows = scene.physics.add.group({ maxSize: 30 });

    // Set up arrow-player collision
    scene.physics.add.overlap(
      player,
      this.arrows,
      (player, arrow) => {
        if (!arrow.active) return;
        player.takeDamage(arrow.damage);
        scene.damageNumbers?.show(player.x, player.y, arrow.damage, '#ff4444');
        scene.sound.play('sfx_playerHit', { volume: 0.1 });
        scene.cameras.main.shake(80, 0.002);
        arrow.setActive(false);
        arrow.setVisible(false);
        arrow.body.enable = false;
      },
      null,
      scene
    );
  }

  update(time, delta) {
    if (this.stopped) return;
    this.elapsedSeconds += delta / 1000;
    const elapsedMinutes = this.elapsedSeconds / 60;

    // Spawn rate increases over time
    const currentRate = this.baseSpawnRate / (1 + elapsedMinutes * 0.3);

    this.spawnTimer += delta;
    if (this.spawnTimer >= currentRate) {
      this.spawnTimer = 0;
      this.spawnEnemy(elapsedMinutes, time);
    }

    // Enemy burst wave every 60 seconds
    this.burstTimer = (this.burstTimer || 0) + delta;
    if (this.burstTimer >= 60000) {
      this.burstTimer = 0;
      this.spawnBurstWave(elapsedMinutes);
    }

    // Handle ranged enemy shooting
    this.updateRangedEnemies(time);
  }

  spawnEnemy(elapsedMinutes, time) {
    // Build list of available enemy types based on elapsed time
    const available = [];
    for (const config of Object.values(ENEMIES)) {
      if (this.allowedEnemyTypes && !this.allowedEnemyTypes.includes(config.id)) continue;
      const spawnAfter = config.spawnAfter || 0;
      if (this.elapsedSeconds >= spawnAfter) {
        available.push(config);
      }
    }

    // Pick a weighted random enemy type from available
    const config = this.weightedPick(available);

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
    this.spawnSingleEnemy(config, x, y, healthMultiplier);
  }

  spawnBurstWave(elapsedMinutes) {
    const cam = this.scene.cameras.main;
    const worldView = cam.worldView;
    const bounds = this.scene.physics.world.bounds;

    // More enemies per side as the game progresses: 3 base + 2 per minute
    const perSide = Math.floor(3 + elapsedMinutes * 2);
    const healthMultiplier = 1 + elapsedMinutes * 0.15;
    const margin = 8; // spawn just outside the visible area

    // Build available enemy types
    const available = [];
    for (const config of Object.values(ENEMIES)) {
      if (this.allowedEnemyTypes && !this.allowedEnemyTypes.includes(config.id)) continue;
      if (this.elapsedSeconds >= (config.spawnAfter || 0)) {
        available.push(config);
      }
    }

    // Spawn from all 4 sides of the screen
    const sides = [
      // Top edge
      (i) => ({
        x: worldView.x + (worldView.width / (perSide + 1)) * (i + 1),
        y: worldView.y - margin,
      }),
      // Bottom edge
      (i) => ({
        x: worldView.x + (worldView.width / (perSide + 1)) * (i + 1),
        y: worldView.y + worldView.height + margin,
      }),
      // Left edge
      (i) => ({
        x: worldView.x - margin,
        y: worldView.y + (worldView.height / (perSide + 1)) * (i + 1),
      }),
      // Right edge
      (i) => ({
        x: worldView.x + worldView.width + margin,
        y: worldView.y + (worldView.height / (perSide + 1)) * (i + 1),
      }),
    ];

    for (const sideFn of sides) {
      for (let i = 0; i < perSide; i++) {
        const pos = sideFn(i);
        // Clamp to world bounds
        const x = Phaser.Math.Clamp(pos.x, 16, bounds.width - 16);
        const y = Phaser.Math.Clamp(pos.y, 16, bounds.height - 16);

        const config = this.weightedPick(available);
        this.spawnSingleEnemy(config, x, y, healthMultiplier);
      }
    }

    // Screen shake to signal the burst
    this.scene.cameras.main.shake(200, 0.003);
  }

  spawnSingleEnemy(config, x, y, healthMultiplier) {
    let enemy = null;
    const children = this.enemyGroup.getChildren();
    for (const child of children) {
      if (!child.active && child.config.id === config.id) {
        enemy = child;
        break;
      }
    }

    if (!enemy) {
      if (this.enemyGroup.getLength() >= 200) return;
      enemy = new Enemy(this.scene, 0, 0, config);
      this.enemyGroup.add(enemy);
      enemy.setActive(false);
      enemy.setVisible(false);
      enemy.body.enable = false;
    }

    enemy.spawn(x, y, healthMultiplier);
  }

  updateRangedEnemies(time) {
    this.enemyGroup.getChildren().forEach((enemy) => {
      if (!enemy.active || !enemy.ranged) return;

      if (enemy.tryShoot(this.player.x, this.player.y, time)) {
        this.fireArrow(enemy);
      }
    });
  }

  weightedPick(available) {
    const totalWeight = available.reduce((sum, c) => sum + (c.spawnWeight ?? 1), 0);
    let roll = Math.random() * totalWeight;
    for (const config of available) {
      roll -= config.spawnWeight ?? 1;
      if (roll <= 0) return config;
    }
    return available[available.length - 1];
  }

  fireArrow(enemy) {
    const arrow = this.arrows.get(enemy.x, enemy.y, 'arrow');
    if (!arrow) return;

    arrow.setActive(true);
    arrow.setVisible(true);
    arrow.body.enable = true;
    arrow.body.setAllowGravity(false);
    arrow.damage = Math.ceil(enemy.damage / 2);

    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      this.player.x, this.player.y
    );

    arrow.setRotation(angle);
    arrow.setVelocity(
      Math.cos(angle) * enemy.projectileSpeed,
      Math.sin(angle) * enemy.projectileSpeed
    );

    this.scene.sound.play('sfx_shoot', { volume: 0.1 });

    // Auto-destroy after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (arrow.active) {
        arrow.setActive(false);
        arrow.setVisible(false);
        arrow.body.enable = false;
      }
    });
  }
}
