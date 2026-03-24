import Phaser from 'phaser';

export class Rapier extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, player) {
    super(scene, player.x, player.y, 'rapier');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.player = player;
    this.scene = scene;
    this.damage = 15;
    this.fireRate = 900;
    this.range = 80;
    this.thrustDuration = 150;
    this.lastFired = 0;
    this.thrusting = false;

    this.setVisible(false);
    this.setActive(false);
    this.body.enable = false;
    this.body.setAllowGravity(false);
    this.setDepth(50);
  }

  update(time, enemies) {
    if (time < this.lastFired + this.fireRate) return;

    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    this.thrust(target);
    this.lastFired = time;
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let nearestDist = this.range;

    const cam = this.scene.cameras.main;

    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      // Only target on-screen enemies
      const sx = (enemy.x - cam.worldView.x) * cam.zoom;
      const sy = (enemy.y - cam.worldView.y) * cam.zoom;
      if (sx < -16 || sx > cam.width + 16 || sy < -16 || sy > cam.height + 16) return;

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

  thrust(target) {
    if (this.thrusting) return;
    this.thrusting = true;

    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );

    // Position the rapier hitbox in front of the player
    const thrustDist = 14;
    const tipX = this.player.x + Math.cos(angle) * thrustDist;
    const tipY = this.player.y + Math.sin(angle) * thrustDist;

    this.setPosition(tipX, tipY);
    this.setRotation(angle);
    this.setVisible(true);
    this.setActive(true);
    this.body.enable = true;

    this.scene.sound.play('sfx_rapier', { volume: 0.25 });

    // Track which enemies this thrust has hit
    this.hitEnemies = new Set();

    // Retract after thrust duration
    this.scene.time.delayedCall(this.thrustDuration, () => {
      this.setVisible(false);
      this.setActive(false);
      this.body.enable = false;
      this.thrusting = false;
    });
  }

  setupCollision(enemies) {
    this.scene.physics.add.overlap(
      this,
      enemies,
      (rapier, enemy) => {
        if (!rapier.active || !enemy.active) return;
        if (this.hitEnemies.has(enemy)) return;
        this.hitEnemies.add(enemy);
        enemy.takeDamage(this.damage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, this.damage, '#dddddd');
        }
      }
    );
  }

  updateStats(stats) {
    this.fireRate = stats.fireRate;
    this.damage = stats.damage;
    this.range = stats.range;
  }
}
