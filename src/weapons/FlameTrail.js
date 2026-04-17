import Phaser from 'phaser';

export class FlameTrail {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.dropRate = stats.dropRate;
    this.damage = stats.damage;
    this.duration = stats.duration;
    this.spreadChance = stats.spreadChance;
    this.lastX = player.x;
    this.lastY = player.y;

    // Store active flame zones for damage (physics bodies)
    this.flameZones = [];
    this.maxZones = 60;

    // Track damage ticks per enemy
    this.damageCooldowns = new Map();
  }

  updateStats(stats) {
    this.dropRate = stats.dropRate;
    this.damage = stats.damage;
    this.duration = stats.duration;
    this.spreadChance = stats.spreadChance;
  }

  update(time) {
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.lastX, this.lastY
    );

    // Drop lava puddles when player moves
    if (dist >= 6) {
      const steps = Math.ceil(dist / 6);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const px = Phaser.Math.Linear(this.lastX, this.player.x, t);
        const py = Phaser.Math.Linear(this.lastY, this.player.y, t);
        this.stampPuddle(px, py, time);
      }

      this.lastX = this.player.x;
      this.lastY = this.player.y;
    }

    // Clean up expired flame zones
    this.cleanupZones(time);
  }

  stampPuddle(x, y, time) {
    // Lava puddle — wide and flat, sitting on the ground
    const puddle = this.scene.add.sprite(x, y + 2, 'flame').setDepth(0);
    puddle.setScale((1.4 + Math.random() * 0.4) * 2, 0.5 + Math.random() * 0.2);
    puddle.setAlpha(0.9);
    puddle.setTint(Phaser.Utils.Array.GetRandom([0xff4400, 0xff6600, 0xcc2200, 0xff8800]));

    // Smooth fade: glow briefly then fade out
    this.scene.tweens.add({
      targets: puddle,
      alpha: 0,
      scaleX: puddle.scaleX * 0.6,
      duration: this.duration,
      ease: 'Sine.easeIn',
      onComplete: () => puddle.destroy(),
    });

    // Spread puddles for a wider trail
    if (Math.random() < this.spreadChance * 0.4) {
      const angle = Math.random() * Math.PI * 2;
      const offset = 8 + Math.random() * 10;
      const sx = x + Math.cos(angle) * offset;
      const sy = y + Math.sin(angle) * offset + 2;
      const spread = this.scene.add.sprite(sx, sy, 'flame').setDepth(0);
      spread.setScale((1.0 + Math.random() * 0.3) * 2, 0.4 + Math.random() * 0.15);
      spread.setAlpha(0.7);
      spread.setTint(Phaser.Utils.Array.GetRandom([0xff4400, 0xcc2200, 0xff6600]));
      this.scene.tweens.add({
        targets: spread,
        alpha: 0,
        scaleX: spread.scaleX * 0.5,
        duration: this.duration * 0.7,
        ease: 'Sine.easeIn',
        onComplete: () => spread.destroy(),
      });
    }

    // Create a damage zone (invisible physics body)
    const zone = this.scene.add.zone(x, y, 24, 12);
    this.scene.physics.add.existing(zone, true);
    zone.spawnTime = time;
    zone.flameDamage = this.damage;
    zone.flameDuration = this.duration;
    this.flameZones.push(zone);

    // If we have too many zones, remove the oldest
    if (this.flameZones.length > this.maxZones) {
      const old = this.flameZones.shift();
      old.destroy();
    }
  }

  cleanupZones(time) {
    while (this.flameZones.length > 0 && time - this.flameZones[0].spawnTime > this.flameZones[0].flameDuration) {
      const old = this.flameZones.shift();
      old.destroy();
    }
  }

  destroy() {
    this.destroyed = true;
    this.flameZones.forEach((z) => z.destroy());
    this.flameZones = [];
  }

  setupCollision(enemies) {
    this.scene.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const now = this.scene.time.now;
        const activeEnemies = enemies.getChildren().filter(e => e.active);

        for (const zone of this.flameZones) {
          if (now - zone.spawnTime > zone.flameDuration) continue;

          for (const enemy of activeEnemies) {
            const dist = Phaser.Math.Distance.Between(zone.x, zone.y, enemy.x, enemy.y);
            if (dist > 28) continue;

            const key = enemy;
            const lastHit = this.damageCooldowns.get(key) || 0;
            if (now - lastHit < 500) continue;

            this.damageCooldowns.set(key, now);
            enemy.takeDamage(zone.flameDamage);
            if (this.scene.damageNumbers) {
              this.scene.damageNumbers.show(enemy.x, enemy.y, zone.flameDamage, '#ff6600');
            }
          }

          // Damage boss if standing in flames
          if (this.scene.boss && this.scene.boss.active && this.scene.hitBoss) {
            const bossDist = Phaser.Math.Distance.Between(zone.x, zone.y, this.scene.boss.x, this.scene.boss.y);
            if (bossDist <= 28) {
              const bossKey = this.scene.boss;
              const bossLastHit = this.damageCooldowns.get(bossKey) || 0;
              if (now - bossLastHit >= 500) {
                this.damageCooldowns.set(bossKey, now);
                this.scene.hitBoss(zone.flameDamage, '#ff6600');
              }
            }
          }

          // Break pots
          if (this.scene.pots) {
            this.scene.pots.getChildren().forEach((pot) => {
              if (!pot.active) return;
              const dist = Phaser.Math.Distance.Between(zone.x, zone.y, pot.x, pot.y);
              if (dist < 28) {
                this.scene.breakPot(pot);
              }
            });
          }
        }
      },
    });

    this.scene.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        for (const [enemy] of this.damageCooldowns) {
          if (!enemy.active) this.damageCooldowns.delete(enemy);
        }
      },
    });
  }
}
