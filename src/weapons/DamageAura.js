import Phaser from 'phaser';

export class DamageAura {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.radius = stats.radius;
    this.damage = stats.damage;
    this.tickRate = stats.tickRate;
    this.lastTick = 0;
    this.isEvolved = false;

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

  // Infernal Halo — flaming aura with embers and fire particles.
  evolve() {
    if (this.isEvolved) return;
    this.isEvolved = true;

    // Recolor the base aura to a searing orange/red
    this.visual.setFillStyle(0xff4400, 0.22);

    // Add a rotating inner ring for a halo feel
    this.haloRing = this.scene.add.circle(
      this.player.x, this.player.y, this.radius * 0.75, 0xffcc44, 0.0
    ).setDepth(5).setStrokeStyle(3, 0xffaa33, 0.7);
    this.scene.tweens.add({
      targets: this.haloRing,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.9,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Fire particles orbiting the player
    this.emberParticles = this.scene.add.particles(this.player.x, this.player.y, 'flame', {
      speed: { min: 10, max: 50 },
      scale: { start: 1.2, end: 0 },
      lifespan: 500,
      quantity: 2,
      frequency: 40,
      tint: [0xff4400, 0xffaa00, 0xffffcc, 0xcc2200],
      angle: { min: 0, max: 360 },
      emitting: true,
    });
    this.emberParticles.setDepth(6);
  }

  destroy() {
    if (this.visual) this.visual.destroy();
    if (this.haloRing) this.haloRing.destroy();
    if (this.emberParticles) this.emberParticles.destroy();
  }

  update(time, enemies) {
    // Follow player
    this.visual.setPosition(this.player.x, this.player.y);
    if (this.haloRing) this.haloRing.setPosition(this.player.x, this.player.y);
    if (this.emberParticles) this.emberParticles.setPosition(this.player.x, this.player.y);

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

    // Damage boss if in range
    if (this.scene.boss && this.scene.boss.active && this.scene.hitBoss) {
      const bossDist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.scene.boss.x, this.scene.boss.y
      );
      if (bossDist <= this.radius) {
        this.scene.hitBoss(this.damage, '#44aaff');
        hitAny = true;
      }
    }
    // Break pots in range
    if (this.scene.pots) {
      this.scene.pots.getChildren().forEach((pot) => {
        if (!pot.active) return;
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          pot.x, pot.y
        );
        if (dist <= this.radius) {
          this.scene.breakPot(pot);
        }
      });
    }

    if (hitAny) {
      this.scene.sound.play('sfx_auraPulse', { volume: 0.15 });
    }
  }
}
