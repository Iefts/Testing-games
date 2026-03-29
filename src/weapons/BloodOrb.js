import Phaser from 'phaser';

export class BloodOrb {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.bulletSpeed = stats.bulletSpeed;
    this.range = stats.range || 250;
    this.lifeStealPercent = stats.lifeStealPercent || 0.15;
    this.killHealPercent = stats.killHealPercent || 0.05;
    this.lastFired = 0;

    this.orbs = scene.physics.add.group({ maxSize: 20 });
  }

  updateStats(stats) {
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.bulletSpeed = stats.bulletSpeed;
    this.range = stats.range || this.range;
    this.lifeStealPercent = stats.lifeStealPercent ?? this.lifeStealPercent;
    this.killHealPercent = stats.killHealPercent ?? this.killHealPercent;
  }

  update(time, enemies) {
    if (time < this.lastFired + this.fireRate) return;

    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    this.fire(target, time);
    this.lastFired = time;
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let nearestDist = this.range;
    const cam = this.scene.cameras.main;

    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
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

  fire(target, time) {
    const orb = this.orbs.get(this.player.x, this.player.y, 'bloodOrb');
    if (!orb) return;

    orb.setActive(true);
    orb.setVisible(true);
    orb.body.enable = true;
    orb.body.setAllowGravity(false);
    orb.orbDamage = this.damage;
    orb.lifeStealPercent = this.lifeStealPercent;

    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );
    orb.setVelocity(
      Math.cos(angle) * this.bulletSpeed,
      Math.sin(angle) * this.bulletSpeed
    );

    // Blood trail particles
    const particles = this.scene.add.particles(orb.x, orb.y, 'bullet', {
      speed: { min: 5, max: 15 },
      scale: { start: 0.6, end: 0 },
      lifespan: 200,
      quantity: 1,
      frequency: 40,
      tint: [0xcc1111, 0x880000],
      emitting: true,
    });
    orb.trailParticles = particles;

    const trailUpdate = this.scene.time.addEvent({
      delay: 30,
      loop: true,
      callback: () => {
        if (orb.active) {
          particles.setPosition(orb.x, orb.y);
        }
      },
    });
    orb.trailUpdate = trailUpdate;

    this.scene.sound.play('sfx_shoot', { volume: 0.2 });

    // Blood cost: lose 2 HP per shot
    if (this.player.hp > 2) {
      this.player.hp -= 2;
      this.player.updateHealthBar();
      if (this.scene.damageNumbers) {
        this.scene.damageNumbers.show(this.player.x, this.player.y + 6, 2, '#880000');
      }
    }

    // Auto-destroy after range
    const lifetime = (this.range / this.bulletSpeed) * 1000;
    this.scene.time.delayedCall(lifetime, () => {
      if (orb.active) {
        this.recycleOrb(orb);
      }
    });
  }

  recycleOrb(orb) {
    orb.setActive(false);
    orb.setVisible(false);
    orb.body.enable = false;
    if (orb.trailParticles) {
      orb.trailParticles.destroy();
      orb.trailParticles = null;
    }
    if (orb.trailUpdate) {
      orb.trailUpdate.destroy();
      orb.trailUpdate = null;
    }
  }

  onOrbHitEnemy(orb, enemy) {
    if (!orb.active || !enemy.active) return;

    const damage = orb.orbDamage;
    const lifeSteal = orb.lifeStealPercent;

    this.recycleOrb(orb);

    enemy.takeDamage(damage);
    if (this.scene.damageNumbers) {
      this.scene.damageNumbers.show(enemy.x, enemy.y, damage, '#cc2222');
    }

    this.scene.sound.play('sfx_hit', { volume: 0.15 });

    // Life steal heal
    const healAmount = Math.ceil(damage * lifeSteal);
    if (healAmount > 0) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
      if (this.scene.damageNumbers) {
        this.scene.damageNumbers.show(this.player.x, this.player.y, healAmount, '#44ff44');
      }
    }

    // Blood splash at enemy
    const splash = this.scene.add.particles(enemy.x, enemy.y, 'bullet', {
      speed: { min: 20, max: 50 },
      scale: { start: 0.8, end: 0 },
      lifespan: 300,
      quantity: 5,
      tint: [0xcc1111, 0x880000, 0xff3333],
      emitting: false,
    });
    splash.explode();
    this.scene.time.delayedCall(400, () => splash.destroy());
  }

  setupCollision(enemies) {
    this.enemies = enemies;

    this.scene.physics.add.overlap(
      this.orbs,
      enemies,
      (orb, enemy) => this.onOrbHitEnemy(orb, enemy)
    );

    // On-kill heal: heals % of enemy max HP when any enemy dies
    this.scene.events.on('enemyKilled', (enemy) => {
      const healAmount = Math.ceil(enemy.maxHp * this.killHealPercent);
      if (healAmount > 0) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(this.player.x, this.player.y - 6, healAmount, '#44ff44');
        }
      }
    });
  }
}
