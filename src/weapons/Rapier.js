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
    this.range = 240;
    this.thrustDuration = 150;
    this.lastFired = 0;
    this.thrusting = false;
    this.isEvolved = false;

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

    if (this.isEvolved) {
      // Phantom Rapier — two ghost follow-up thrusts from a different angle
      this.scene.time.delayedCall(80, () => {
        if (target.active) this.thrust(target, { ghost: true, angleOffset: 0.35 });
      });
      this.scene.time.delayedCall(160, () => {
        if (target.active) this.thrust(target, { ghost: true, angleOffset: -0.35 });
      });
    }
  }

  evolve() {
    this.isEvolved = true;
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

  thrust(target, opts = {}) {
    if (this.thrusting && !opts.ghost) return;
    if (!opts.ghost) this.thrusting = true;

    const baseAngle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );
    const angle = baseAngle + (opts.angleOffset || 0);

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const thrustDist = this.range * 0.5;

    if (!opts.ghost) {
      // Position the rapier visual at the midpoint of the thrust line
      const midX = this.player.x + cosA * (thrustDist * 0.5);
      const midY = this.player.y + sinA * (thrustDist * 0.5);

      this.setPosition(midX, midY);
      this.setRotation(angle);
      this.setVisible(true);
      this.setActive(true);
      this.body.enable = false;
      this.setScale(1.5);
    }

    this.scene.sound.play('sfx_rapier', { volume: opts.ghost ? 0.15 : 0.25 });

    // Line-based damage: hit all enemies along the thrust line
    const lineWidth = 8; // How close to the line an enemy must be to get hit
    const hitEnemies = new Set();

    this.enemyGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist > thrustDist + 8) return;

      // Project enemy position onto the thrust line
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const projection = dx * cosA + dy * sinA;
      if (projection < 0 || projection > thrustDist) return;

      // Perpendicular distance from the thrust line
      const perpDist = Math.abs(dx * sinA - dy * cosA);
      if (perpDist <= lineWidth) {
        hitEnemies.add(enemy);
        enemy.takeDamage(this.damage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, this.damage, '#dddddd');
        }
      }
    });

    // Check boss hit along thrust line
    if (this.bossTarget && this.bossTarget.active && this.hitBoss) {
      const bDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bossTarget.x, this.bossTarget.y);
      if (bDist <= thrustDist + 16) {
        const bdx = this.bossTarget.x - this.player.x;
        const bdy = this.bossTarget.y - this.player.y;
        const bProj = bdx * cosA + bdy * sinA;
        if (bProj >= 0 && bProj <= thrustDist) {
          const bPerp = Math.abs(bdx * sinA - bdy * cosA);
          if (bPerp <= 16) {
            this.hitBoss(this.damage, '#dddddd');
          }
        }
      }
    }

    // Thrust trail — rapier ghosts along the full line
    const trailCount = 6;
    for (let i = 0; i < trailCount; i++) {
      const t = (i + 1) / (trailCount + 1);
      const tx = this.player.x + cosA * (thrustDist * t);
      const ty = this.player.y + sinA * (thrustDist * t);
      const ghost = this.scene.add.image(tx, ty, 'rapier');
      ghost.setRotation(angle);
      ghost.setAlpha(0.6 - i * 0.08);
      ghost.setScale(1.3);
      ghost.setTint(0x88ccff);
      ghost.setDepth(49);
      this.scene.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 200,
        delay: i * 25,
        onComplete: () => ghost.destroy(),
      });
    }

    // Spark particles at the tip
    const tipX = this.player.x + cosA * thrustDist;
    const tipY = this.player.y + sinA * thrustDist;
    const sparks = this.scene.add.particles(tipX, tipY, 'bullet', {
      speed: { min: 40, max: 100 },
      scale: { start: 1, end: 0 },
      lifespan: 250,
      quantity: 6,
      tint: [0xffffff, 0x88ccff, 0xffd700],
      angle: {
        min: Phaser.Math.RadToDeg(angle) - 40,
        max: Phaser.Math.RadToDeg(angle) + 40,
      },
      emitting: false,
    });
    sparks.explode();
    this.scene.time.delayedCall(500, () => sparks.destroy());

    // Retract after thrust duration (skip for ghost thrusts)
    if (!opts.ghost) {
      this.scene.time.delayedCall(this.thrustDuration, () => {
        this.setVisible(false);
        this.setActive(false);
        this.thrusting = false;
        this.setScale(1);
      });
    }
  }

  setupCollision(enemies) {
    // Store enemy group reference for line-based damage checks in thrust()
    this.enemyGroup = enemies;
  }

  updateStats(stats) {
    this.fireRate = stats.fireRate;
    this.damage = stats.damage;
    this.range = stats.range;
  }
}
