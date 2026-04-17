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
    this.isEvolved = false;
  }

  updateStats(stats) {
    this.damage = stats.damage;
    this.cooldown = stats.cooldown;
    this.speed = stats.speed;
  }

  evolve() {
    this.isEvolved = true;
  }

  update(time, enemies) {
    if (time < this.lastFired + this.cooldown) return;
    this.lastFired = time;
    this.charge(enemies);
    if (this.isEvolved) {
      // Lance Cavalry — a second rider charges from the opposite side
      this.scene.time.delayedCall(120, () => this.charge(enemies, true));
    }
  }

  charge(enemies, isFollowup) {
    this.scene.sound.play('sfx_unicornCharge', { volume: 0.4 });
    const cam = this.scene.cameras.main;
    const y = this.player.y + (isFollowup ? 12 : 0);

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

    if (this.isEvolved) {
      unicorn.setTint(0xffeeaa);
      unicorn.setScale(1.25);
    }

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
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, this.damage, this.isEvolved ? '#ffcc44' : '#aa44ff');
        }
      }
    );

    let trailParticles = null;
    if (this.isEvolved) {
      // Golden streak trail following the rider
      trailParticles = this.scene.add.particles(startX, y, 'dart', {
        speed: { min: 0, max: 20 },
        scale: { start: 1.2, end: 0 },
        lifespan: 400,
        quantity: 2,
        frequency: 20,
        tint: [0xffee88, 0xffffff, 0xffaa44],
        emitting: true,
      });
      trailParticles.setDepth(9);
    }

    // Animate across screen
    const duration = Math.abs(endX - startX) / this.speed * 1000;
    const followTrail = this.scene.time.addEvent({
      delay: 20,
      loop: true,
      callback: () => {
        if (trailParticles && unicorn.active) {
          trailParticles.setPosition(unicorn.x, unicorn.y);
        }
      },
    });
    this.scene.tweens.add({
      targets: [unicorn, hitZone],
      x: endX,
      duration,
      ease: 'Linear',
      onComplete: () => {
        unicorn.destroy();
        hitZone.destroy();
        overlap.destroy();
        followTrail.destroy();
        if (trailParticles) {
          this.scene.time.delayedCall(400, () => trailParticles.destroy());
        }
      },
    });

    // Evolution: drop piercing darts along the trail
    if (this.isEvolved) {
      const dartCount = 5;
      for (let i = 1; i <= dartCount; i++) {
        this.scene.time.delayedCall((duration * i) / (dartCount + 1), () => {
          this.fireLance(unicorn.x, unicorn.y, enemies);
        });
      }
    }
  }

  fireLance(x, y, enemies) {
    // Pick nearest on-screen enemy as target; fall back to horizontal forward shot.
    let target = null;
    let nearestDist = 220;
    const cam = this.scene.cameras.main;
    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const sx = (enemy.x - cam.worldView.x) * cam.zoom;
      const sy = (enemy.y - cam.worldView.y) * cam.zoom;
      if (sx < -16 || sx > cam.width + 16 || sy < -16 || sy > cam.height + 16) return;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        target = enemy;
        nearestDist = dist;
      }
    });

    const angle = target
      ? Phaser.Math.Angle.Between(x, y, target.x, target.y)
      : 0;
    const speed = 320;
    const range = 240;

    const lance = this.scene.physics.add.sprite(x, y, 'dart');
    lance.setDepth(11);
    lance.setTint(0xffee88);
    lance.setScale(2.4, 1.6);
    lance.setRotation(angle);
    lance.body.setAllowGravity(false);
    lance.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    const hitSet = new Set();
    const overlap = this.scene.physics.add.overlap(lance, enemies, (l, enemy) => {
      if (!enemy.active || hitSet.has(enemy)) return;
      hitSet.add(enemy);
      enemy.takeDamage(Math.floor(this.damage * 0.5));
      if (this.scene.damageNumbers) {
        this.scene.damageNumbers.show(enemy.x, enemy.y, Math.floor(this.damage * 0.5), '#ffee88');
      }
    });

    this.scene.time.delayedCall((range / speed) * 1000, () => {
      if (lance.active) lance.destroy();
      overlap.destroy();
    });
  }
}
