import Phaser from 'phaser';

export class FlameTrail {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.dropRate = stats.dropRate;
    this.damage = stats.damage;
    this.duration = stats.duration;
    this.spreadChance = stats.spreadChance;
    this.lastDropTime = 0;
    this.lastX = player.x;
    this.lastY = player.y;

    this.flames = scene.physics.add.group({
      maxSize: 40,
    });

    // Track damage ticks per enemy per flame
    this.damageCooldowns = new Map();
  }

  updateStats(stats) {
    this.dropRate = stats.dropRate;
    this.damage = stats.damage;
    this.duration = stats.duration;
    this.spreadChance = stats.spreadChance;
  }

  update(time) {
    if (time < this.lastDropTime + this.dropRate) return;

    // Only drop if player has moved enough
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.lastX, this.lastY
    );
    if (dist < 16) return;

    this.lastDropTime = time;
    this.lastX = this.player.x;
    this.lastY = this.player.y;

    this.spawnFlame(this.player.x, this.player.y, time, true);
  }

  spawnFlame(x, y, time, canSpread) {
    const flame = this.flames.get(x, y, 'flame');
    if (!flame) return;

    flame.setActive(true);
    flame.setVisible(true);
    flame.body.enable = true;
    flame.body.setAllowGravity(false);
    flame.body.setImmovable(true);
    flame.setVelocity(0, 0);
    flame.setAlpha(1);
    flame.setDepth(0);
    flame.damage = this.damage;
    flame.spawnTime = time;
    flame.canSpread = canSpread;
    flame.hasSpread = false;

    // Particle emitter for sparks
    const particles = this.scene.add.particles(x, y, 'bullet', {
      speed: { min: 10, max: 30 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: 1,
      frequency: 200,
      tint: [0xff6600, 0xffcc00, 0xff3300],
      angle: { min: -120, max: -60 },
      emitting: true,
    });
    flame.particles = particles;

    // Schedule spread attempt at half duration
    if (canSpread) {
      this.scene.time.delayedCall(this.duration / 2, () => {
        if (flame.active && !flame.hasSpread && Math.random() < this.spreadChance) {
          flame.hasSpread = true;
          const angle = Math.random() * Math.PI * 2;
          const offset = 12 + Math.random() * 4;
          const sx = flame.x + Math.cos(angle) * offset;
          const sy = flame.y + Math.sin(angle) * offset;
          this.spawnFlame(sx, sy, this.scene.time.now, false); // spread flames don't spread again
        }
      });
    }

    // Fade out and recycle
    this.scene.time.delayedCall(this.duration - 500, () => {
      if (flame.active) {
        this.scene.tweens.add({
          targets: flame,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.recycleFlame(flame);
          },
        });
      }
    });

    // Hard cleanup fallback
    this.scene.time.delayedCall(this.duration + 100, () => {
      if (flame.active) {
        this.recycleFlame(flame);
      }
    });

    this.scene.sound.play('sfx_flameDrop', { volume: 0.15 });
  }

  recycleFlame(flame) {
    flame.setActive(false);
    flame.setVisible(false);
    flame.body.enable = false;
    if (flame.particles) {
      flame.particles.destroy();
      flame.particles = null;
    }
  }

  setupCollision(enemies) {
    this.scene.physics.add.overlap(
      this.flames,
      enemies,
      (flame, enemy) => {
        if (!flame.active || !enemy.active) return;

        // Tick-based damage: 500ms cooldown per enemy per flame
        const key = `${flame.x},${flame.y},${enemy.x},${enemy.y}`;
        const now = this.scene.time.now;
        const lastHit = this.damageCooldowns.get(key) || 0;
        if (now - lastHit < 500) return;

        this.damageCooldowns.set(key, now);
        enemy.takeDamage(flame.damage);
      }
    );

    // Periodically clean up old cooldown entries
    this.scene.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        this.damageCooldowns.clear();
      },
    });
  }
}
