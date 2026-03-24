import Phaser from 'phaser';

export class Tornado {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.duration = stats.duration;
    this.cooldown = stats.cooldown;
    this.lastFired = 0;
    this.activeTornado = null;
  }

  updateStats(stats) {
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.duration = stats.duration;
    this.cooldown = stats.cooldown;
  }

  update(time) {
    if (time < this.lastFired + this.cooldown) return;
    if (this.activeTornado) return; // only one at a time
    this.lastFired = time;
    this.spawn();
  }

  spawn() {
    const x = this.player.x + Phaser.Math.Between(-60, 60);
    const y = this.player.y + Phaser.Math.Between(-60, 60);

    const tornado = this.scene.physics.add.sprite(x, y, 'tornado');
    tornado.body.setAllowGravity(false);
    tornado.setDepth(5);
    this.activeTornado = tornado;

    // Damage tracking: limit damage ticks per enemy
    const hitTimes = new Map();
    tornado.hitTimes = hitTimes;
    tornado.damage = this.damage;

    // Particle debris
    const particles = this.scene.add.particles(x, y, 'bullet', {
      speed: { min: 20, max: 60 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 1,
      frequency: 150,
      tint: [0x888888, 0x666666, 0xaaaaaa, 0x4a8c3f],
      angle: { min: 0, max: 360 },
      emitting: true,
    });
    tornado.particles = particles;

    // Pick initial wander target
    this.pickWanderTarget(tornado);

    // Wander: pick new target every 1-2 seconds
    const wanderEvent = this.scene.time.addEvent({
      delay: 1200,
      loop: true,
      callback: () => {
        if (tornado.active) {
          this.pickWanderTarget(tornado);
        }
      },
    });
    tornado.wanderEvent = wanderEvent;

    // Update particle position to follow tornado
    const updateEvent = this.scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        if (tornado.active && particles.active) {
          particles.setPosition(tornado.x, tornado.y);
        }
      },
    });
    tornado.updateEvent = updateEvent;

    this.scene.sound.play('sfx_tornado', { volume: 0.25 });

    // Fade out after duration
    this.scene.time.delayedCall(this.duration - 500, () => {
      if (tornado.active) {
        this.scene.tweens.add({
          targets: tornado,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.destroyTornado(tornado);
          },
        });
      }
    });

    // Hard cleanup fallback
    this.scene.time.delayedCall(this.duration + 200, () => {
      if (tornado.active) {
        this.destroyTornado(tornado);
      }
    });
  }

  pickWanderTarget(tornado) {
    const cam = this.scene.cameras.main;
    // Pick a random point within the camera view
    const targetX = cam.worldView.x + Phaser.Math.Between(20, cam.worldView.width - 20);
    const targetY = cam.worldView.y + Phaser.Math.Between(20, cam.worldView.height - 20);

    const angle = Phaser.Math.Angle.Between(tornado.x, tornado.y, targetX, targetY);
    tornado.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  destroyTornado(tornado) {
    if (tornado.wanderEvent) tornado.wanderEvent.destroy();
    if (tornado.updateEvent) tornado.updateEvent.destroy();
    if (tornado.particles) tornado.particles.destroy();
    if (tornado.overlapCollider) {
      this.scene.physics.world.removeCollider(tornado.overlapCollider);
    }
    tornado.destroy();
    if (this.activeTornado === tornado) {
      this.activeTornado = null;
    }
  }

  setupCollision(enemies) {
    this.enemies = enemies;

    // We need to set up overlap dynamically since tornado sprites are created/destroyed
    // Use a scene update callback to check overlaps manually
    this.scene.events.on('update', () => {
      if (!this.activeTornado || !this.activeTornado.active) return;

      const tornado = this.activeTornado;
      const now = this.scene.time.now;

      this.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active) return;

        const dist = Phaser.Math.Distance.Between(
          tornado.x, tornado.y,
          enemy.x, enemy.y
        );

        if (dist < 20) {
          const lastHit = tornado.hitTimes.get(enemy) || 0;
          if (now - lastHit >= 500) {
            tornado.hitTimes.set(enemy, now);
            enemy.takeDamage(tornado.damage);
          }
        }
      });
    });
  }
}
