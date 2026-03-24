import Phaser from 'phaser';

export class PiercingDart {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.speed = stats.speed;
    this.lastFired = 0;
    this.range = 500;

    this.darts = scene.physics.add.group({
      maxSize: 20,
    });
  }

  updateStats(stats) {
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.speed = stats.speed;
  }

  update(time, enemies) {
    if (time < this.lastFired + this.fireRate) return;

    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    this.fire(target);
    this.lastFired = time;
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let nearestDist = this.range;

    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      if (dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    });

    return nearest;
  }

  fire(target) {
    const dart = this.darts.get(this.player.x, this.player.y, 'dart');
    if (!dart) return;

    dart.setActive(true);
    dart.setVisible(true);
    dart.body.enable = true;
    dart.body.setAllowGravity(false);
    dart.hitEnemies = new Set();
    dart.damage = this.damage;

    this.scene.sound.play('sfx_dartFire', { volume: 0.25 });

    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );

    dart.setRotation(angle);
    dart.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );

    // Destroy after traveling far enough
    this.scene.time.delayedCall(3000, () => {
      if (dart.active) {
        dart.setActive(false);
        dart.setVisible(false);
        dart.body.enable = false;
      }
    });
  }

  setupCollision(enemies) {
    this.scene.physics.add.overlap(
      this.darts,
      enemies,
      (dart, enemy) => {
        if (!dart.active || !enemy.active) return;
        if (dart.hitEnemies.has(enemy)) return;
        dart.hitEnemies.add(enemy);
        enemy.takeDamage(dart.damage);
      }
    );
  }
}
