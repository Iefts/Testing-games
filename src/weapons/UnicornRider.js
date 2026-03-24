import Phaser from 'phaser';

export class UnicornRider {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.damage = stats.damage;
    this.cooldown = stats.cooldown;
    this.speed = stats.speed;
    this.lastFired = 0;
    this.fromLeft = true;
  }

  updateStats(stats) {
    this.damage = stats.damage;
    this.cooldown = stats.cooldown;
    this.speed = stats.speed;
  }

  update(time, enemies) {
    if (time < this.lastFired + this.cooldown) return;
    this.lastFired = time;
    this.charge(enemies);
  }

  charge(enemies) {
    this.scene.sound.play('sfx_unicornCharge', { volume: 0.4 });
    const cam = this.scene.cameras.main;
    const y = this.player.y;

    // Spawn from alternating sides
    const startX = this.fromLeft
      ? cam.scrollX - 20
      : cam.scrollX + cam.width + 20;
    const endX = this.fromLeft
      ? cam.scrollX + cam.width + 40
      : cam.scrollX - 40;
    this.fromLeft = !this.fromLeft;

    const unicorn = this.scene.add.sprite(startX, y, 'unicorn').setDepth(10);
    if (endX < startX) unicorn.setFlipX(true);

    // Track which enemies have been hit by this charge
    const hitEnemies = new Set();

    // Overlap detection zone
    const hitZone = this.scene.add.zone(startX, y, 32, 24);
    this.scene.physics.add.existing(hitZone);
    hitZone.body.setAllowGravity(false);

    const overlap = this.scene.physics.add.overlap(
      hitZone,
      enemies,
      (zone, enemy) => {
        if (!enemy.active || hitEnemies.has(enemy)) return;
        hitEnemies.add(enemy);
        enemy.takeDamage(this.damage);
      }
    );

    // Animate across screen
    const duration = Math.abs(endX - startX) / this.speed * 1000;
    this.scene.tweens.add({
      targets: [unicorn, hitZone],
      x: endX,
      duration,
      ease: 'Linear',
      onComplete: () => {
        unicorn.destroy();
        hitZone.destroy();
        overlap.destroy();
      },
    });
  }
}
