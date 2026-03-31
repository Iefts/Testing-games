import Phaser from 'phaser';

export class Tornado {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.targetCount = stats.count || 1;
    this.tornadoes = [];
  }

  updateStats(stats) {
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.targetCount = stats.count || 1;

    // Update existing tornadoes
    this.tornadoes.forEach((t) => {
      if (t.active) t.damage = stats.damage;
    });

    // Spawn additional tornadoes if needed
    while (this.tornadoes.length < this.targetCount) {
      this.spawn();
    }
  }

  update(time) {
    // Spawn tornadoes up to target count
    while (this.tornadoes.length < this.targetCount) {
      this.spawn();
    }

    // Keep tornadoes near the player's screen area
    const cam = this.scene.cameras.main;
    const margin = 40;
    const left = cam.worldView.x - margin;
    const right = cam.worldView.x + cam.worldView.width + margin;
    const top = cam.worldView.y - margin;
    const bottom = cam.worldView.y + cam.worldView.height + margin;

    this.tornadoes.forEach((t) => {
      if (!t.active) return;
      if (t.x < left || t.x > right || t.y < top || t.y > bottom) {
        t.setPosition(
          this.player.x + Phaser.Math.Between(-60, 60),
          this.player.y + Phaser.Math.Between(-60, 60)
        );
        this.pickWanderTarget(t);
      }
    });
  }

  spawn() {
    const x = this.player.x + Phaser.Math.Between(-60, 60);
    const y = this.player.y + Phaser.Math.Between(-60, 60);

    const tornado = this.scene.physics.add.sprite(x, y, 'tornado');
    tornado.body.setAllowGravity(false);
    tornado.setDepth(5);
    tornado.damage = this.damage;

    // Damage tracking: limit damage ticks per enemy
    tornado.hitTimes = new Map();

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
    tornado.wanderEvent = this.scene.time.addEvent({
      delay: 1200,
      loop: true,
      callback: () => {
        if (tornado.active) this.pickWanderTarget(tornado);
      },
    });

    // Update particle position to follow tornado
    tornado.updateEvent = this.scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        if (tornado.active && particles.active) {
          particles.setPosition(tornado.x, tornado.y);
        }
      },
    });

    this.tornadoes.push(tornado);
    this.scene.sound.play('sfx_tornado', { volume: 0.25 });
  }

  pickWanderTarget(tornado) {
    const cam = this.scene.cameras.main;
    const targetX = cam.worldView.x + Phaser.Math.Between(20, cam.worldView.width - 20);
    const targetY = cam.worldView.y + Phaser.Math.Between(20, cam.worldView.height - 20);

    const angle = Phaser.Math.Angle.Between(tornado.x, tornado.y, targetX, targetY);
    tornado.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  setupCollision(enemies) {
    this.enemies = enemies;

    this.scene.events.on('update', () => {
      const now = this.scene.time.now;

      this.tornadoes.forEach((tornado) => {
        if (!tornado.active) return;

        this.enemies.getChildren().forEach((enemy) => {
          if (!enemy.active) return;

          const dist = Phaser.Math.Distance.Between(
            tornado.x, tornado.y, enemy.x, enemy.y
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
            tornado.x, tornado.y, this.scene.boss.x, this.scene.boss.y
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
    });
  }
}
