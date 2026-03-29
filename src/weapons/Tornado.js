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
    if (this.activeTornado) {
      this.activeTornado.damage = stats.damage;
    }
  }

  update(time) {
    // Spawn a permanent tornado on first update
    if (!this.activeTornado) {
      this.spawn();
    }

    // Keep tornado near the player's screen area
    if (this.activeTornado && this.activeTornado.active) {
      const cam = this.scene.cameras.main;
      const t = this.activeTornado;
      const margin = 40;
      const left = cam.worldView.x - margin;
      const right = cam.worldView.x + cam.worldView.width + margin;
      const top = cam.worldView.y - margin;
      const bottom = cam.worldView.y + cam.worldView.height + margin;

      // If tornado drifted too far off screen, teleport it back nearby
      if (t.x < left || t.x > right || t.y < top || t.y > bottom) {
        t.setPosition(
          this.player.x + Phaser.Math.Between(-60, 60),
          this.player.y + Phaser.Math.Between(-60, 60)
        );
        this.pickWanderTarget(t);
      }
    }
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
            if (this.scene.damageNumbers) {
              this.scene.damageNumbers.show(enemy.x, enemy.y, tornado.damage, '#bbbbbb');
            }
          }
        }
      });

      // Damage boss
      if (this.scene.boss && this.scene.boss.active && this.scene.hitBoss) {
        const bossDist = Phaser.Math.Distance.Between(
          tornado.x, tornado.y,
          this.scene.boss.x, this.scene.boss.y
        );
        if (bossDist < 24) {
          const lastBossHit = tornado.hitTimes.get(this.scene.boss) || 0;
          if (now - lastBossHit >= 500) {
            tornado.hitTimes.set(this.scene.boss, now);
            this.scene.hitBoss(tornado.damage, '#bbbbbb');
          }
        }
      }

      // Break pots
      if (this.scene.pots) {
        this.scene.pots.getChildren().forEach((pot) => {
          if (!pot.active) return;
          const dist = Phaser.Math.Distance.Between(tornado.x, tornado.y, pot.x, pot.y);
          if (dist < 20) {
            this.scene.breakPot(pot);
          }
        });
      }
    });
  }
}
