import Phaser from 'phaser';

export class DamageAura {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.radius = stats.radius;
    this.damage = stats.damage;
    this.tickRate = stats.tickRate;
    this.lastTick = 0;

    // Visual aura circle
    this.visual = scene.add.circle(player.x, player.y, this.radius, 0x44aaff, 0.15)
      .setDepth(5);

    // Pulse animation
    scene.tweens.add({
      targets: this.visual,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 0.25,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  updateStats(stats) {
    this.radius = stats.radius;
    this.damage = stats.damage;
    this.tickRate = stats.tickRate;
    this.visual.setRadius(this.radius);
  }

  update(time, enemies) {
    // Follow player
    this.visual.setPosition(this.player.x, this.player.y);

    if (time < this.lastTick + this.tickRate) return;
    this.lastTick = time;

    // Damage enemies in range
    let hitAny = false;
    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      if (dist <= this.radius) {
        enemy.takeDamage(this.damage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, this.damage, '#44aaff');
        }
        hitAny = true;
      }
    });
    if (hitAny) {
      this.scene.sound.play('sfx_auraPulse', { volume: 0.15 });
    }
  }
}
