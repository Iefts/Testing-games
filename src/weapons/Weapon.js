import Phaser from 'phaser';

export class Weapon {
  constructor(scene, player, config) {
    this.scene = scene;
    this.player = player;
    this.fireRate = config.fireRate;
    this.damage = config.damage;
    this.bulletSpeed = config.bulletSpeed;
    this.range = config.range || 200;
    this.bulletKey = config.bulletKey || 'bullet';
    this.lastFired = 0;

    // Bullet pool
    this.bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: config.maxBullets || 50,
      runChildUpdate: false,
    });
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
    const bullet = this.bullets.get(this.player.x, this.player.y, this.bulletKey);
    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;

    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );

    bullet.setRotation(angle);
    bullet.setVelocity(
      Math.cos(angle) * this.bulletSpeed,
      Math.sin(angle) * this.bulletSpeed
    );

    bullet.damage = this.damage;

    // Auto-destroy when out of range
    this.scene.time.delayedCall(2000, () => {
      if (bullet.active) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
      }
    });
  }
}
