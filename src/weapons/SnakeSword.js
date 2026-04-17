import Phaser from 'phaser';

export class SnakeSword extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, player) {
    super(scene, player.x, player.y, 'snakeSword');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.player = player;
    this.scene = scene;

    // Melee stats
    this.slashDamage = 8;
    this.slashRate = 950;
    this.slashRange = 60;
    this.slashDuration = 120;

    // Ranged stats
    this.poisonDamage = 4;
    this.poisonRate = 1000;
    this.poisonSpeed = 170;
    this.range = 150;

    this.lastSlash = 0;
    this.lastPoison = 0;
    this.slashing = false;
    this.isEvolved = false;

    this.setVisible(true);
    this.setActive(true);
    this.body.enable = false;
    this.body.setAllowGravity(false);
    this.setDepth(50);

    // Track the idle facing side (1 = right, -1 = left)
    this.facingSide = 1;
    this.facingAngle = 0;
    this.isReversed = false;
    this._bobTime = 0;

    // Poison bolt pool
    this.poisonBolts = scene.physics.add.group({ maxSize: 20 });

    // Float sword beside the player after physics
    scene.events.on('postupdate', () => {
      if (!this.slashing && !this._shootingAnim) {
        this._bobTime += 0.05;
        const bobY = Math.sin(this._bobTime) * 2;

        // Float on the side the player is facing
        const sideOffset = 14 * this.facingSide;
        this.setPosition(
          this.player.x + sideOffset,
          this.player.y - 4 + bobY
        );
        // Point the blade in the facing direction, angled slightly down
        this.setRotation(this.facingSide > 0 ? 0.3 : Math.PI - 0.3);
        this.setFlipY(this.facingSide < 0);
        this.setScale(1);
        this.setVisible(true);
      }
    });
  }

  update(time, enemies) {
    // Track player facing direction
    const vx = this.player.body.velocity.x;
    const vy = this.player.body.velocity.y;
    if (vx !== 0 || vy !== 0) {
      this.facingAngle = Math.atan2(vy, vx);
      if (vx > 0) this.facingSide = 1;
      else if (vx < 0) this.facingSide = -1;
    }

    // Find nearest enemy
    const nearest = this.findNearestEnemy(enemies);
    if (!nearest) {
      // No enemies — show normal grip
      this.isReversed = false;
      return;
    }

    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      nearest.x, nearest.y
    );

    if (dist <= this.slashRange) {
      // Melee mode — normal grip
      this.isReversed = false;
      if (time >= this.lastSlash + this.slashRate) {
        this.lastSlash = time;
        this.slash(nearest);
        if (this.isEvolved) {
          // Hydra Fang — two extra heads slash at offset angles
          this.scene.time.delayedCall(70, () => { if (nearest.active) this.slashOffset(nearest, 0.6); });
          this.scene.time.delayedCall(140, () => { if (nearest.active) this.slashOffset(nearest, -0.6); });
        }
      }
    } else {
      // Ranged mode — reversed grip (snake faces outward)
      this.isReversed = true;
      if (time >= this.lastPoison + this.poisonRate) {
        this.lastPoison = time;
        this.shootPoison(nearest, time);
        if (this.isEvolved) {
          this.scene.time.delayedCall(80, () => { if (nearest.active) this.shootPoison(nearest, time + 80, 0.3); });
          this.scene.time.delayedCall(160, () => { if (nearest.active) this.shootPoison(nearest, time + 160, -0.3); });
        }
      }
    }
  }

  evolve() {
    this.isEvolved = true;
  }

  slashOffset(target, angleOffset) {
    // Phantom slash at an offset angle — damage-only, no sword reposition.
    const baseAngle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y, target.x, target.y
    );
    const angle = baseAngle + angleOffset;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const slashDist = this.slashRange;
    const hitWidth = 14;

    this.enemyGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist > slashDist + 10) return;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const projection = dx * cosA + dy * sinA;
      if (projection < 0 || projection > slashDist) return;
      const perpDist = Math.abs(dx * sinA - dy * cosA);
      if (perpDist <= hitWidth) {
        enemy.takeDamage(this.slashDamage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, this.slashDamage, '#88ff88');
        }
      }
    });

    // Ghost slash visual
    for (let i = 0; i < 3; i++) {
      const t = (i + 1) / 4;
      const gx = this.player.x + cosA * (slashDist * t);
      const gy = this.player.y + sinA * (slashDist * t);
      const ghost = this.scene.add.image(gx, gy, 'snakeSword');
      ghost.setRotation(angle);
      ghost.setAlpha(0.5);
      ghost.setScale(1.1);
      ghost.setTint(0x44ff88);
      ghost.setDepth(48);
      this.scene.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 180,
        onComplete: () => ghost.destroy(),
      });
    }
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

    // Also consider the boss as a target
    const boss = this.scene.boss;
    if (boss && boss.active) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        boss.x, boss.y
      );
      if (dist < nearestDist) {
        nearest = boss;
        nearestDist = dist;
      }
    }

    return nearest;
  }

  slash(target) {
    if (this.slashing) return;
    this.slashing = true;

    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const slashDist = this.slashRange;

    // Position sword at midpoint of slash
    const midX = this.player.x + cosA * (slashDist * 0.5);
    const midY = this.player.y + sinA * (slashDist * 0.5);

    this.setPosition(midX, midY);
    this.setRotation(angle);
    this.setVisible(true);
    this.setActive(true);
    this.setScale(1.3);
    this.setFlipY(false);

    this.scene.sound.play('sfx_snakeSlash', { volume: 0.25 });

    // Arc-based slash damage — hit enemies in a wide cone
    const hitWidth = 14;
    this.enemyGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist > slashDist + 10) return;

      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const projection = dx * cosA + dy * sinA;
      if (projection < 0 || projection > slashDist) return;

      const perpDist = Math.abs(dx * sinA - dy * cosA);
      if (perpDist <= hitWidth) {
        enemy.takeDamage(this.slashDamage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, this.slashDamage, '#cccccc');
        }
      }
    });

    // Also slash the boss if in range
    const boss = this.scene.boss;
    if (boss && boss.active && this.scene.hitBoss) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, boss.x, boss.y);
      if (dist <= slashDist + 10) {
        const dx = boss.x - this.player.x;
        const dy = boss.y - this.player.y;
        const projection = dx * cosA + dy * sinA;
        if (projection >= 0 && projection <= slashDist) {
          const perpDist = Math.abs(dx * sinA - dy * cosA);
          if (perpDist <= hitWidth) {
            this.scene.hitBoss(this.slashDamage, '#cccccc');
          }
        }
      }
    }

    // Slash arc visual — green-tinted sweep ghosts
    for (let i = 0; i < 4; i++) {
      const spreadAngle = angle + (i - 1.5) * 0.15;
      const gx = this.player.x + Math.cos(spreadAngle) * (slashDist * 0.6);
      const gy = this.player.y + Math.sin(spreadAngle) * (slashDist * 0.6);
      const ghost = this.scene.add.image(gx, gy, 'snakeSword');
      ghost.setRotation(spreadAngle);
      ghost.setAlpha(0.5 - i * 0.1);
      ghost.setScale(1.2);
      ghost.setTint(0x88cc88);
      ghost.setDepth(49);
      this.scene.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 150,
        delay: i * 20,
        onComplete: () => ghost.destroy(),
      });
    }

    // Sparks at slash tip
    const tipX = this.player.x + cosA * slashDist;
    const tipY = this.player.y + sinA * slashDist;
    const sparks = this.scene.add.particles(tipX, tipY, 'bullet', {
      speed: { min: 30, max: 80 },
      scale: { start: 1, end: 0 },
      lifespan: 200,
      quantity: 4,
      tint: [0xcccccc, 0x88cc88, 0xffffff],
      angle: {
        min: Phaser.Math.RadToDeg(angle) - 30,
        max: Phaser.Math.RadToDeg(angle) + 30,
      },
      emitting: false,
    });
    sparks.explode();
    this.scene.time.delayedCall(300, () => sparks.destroy());

    // Retract — return to idle follow
    this.scene.time.delayedCall(this.slashDuration, () => {
      this.slashing = false;
    });
  }

  shootPoison(target, time, angleOffset = 0) {
    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    ) + angleOffset;

    // Quick recoil animation — sword kicks back briefly
    this._shootingAnim = true;
    this.setPosition(this.player.x - Math.cos(angle) * 4, this.player.y - Math.sin(angle) * 4);
    this.setRotation(angle + Math.PI);
    this.setFlipY(true);
    this.setScale(1.1);
    this.scene.time.delayedCall(100, () => {
      this._shootingAnim = false;
    });

    // Fire poison bolt
    const bolt = this.poisonBolts.get(this.player.x, this.player.y, 'poisonBolt');
    if (!bolt) return;

    bolt.setActive(true);
    bolt.setVisible(true);
    bolt.body.enable = true;
    bolt.body.setAllowGravity(false);
    bolt.damage = this.poisonDamage;
    bolt.poisonDot = true;
    bolt.setRotation(angle);
    bolt.setTint(0x44ff44);

    // Base velocity toward target
    const speed = this.poisonSpeed;
    bolt.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );

    // Squiggly motion — sine wave perpendicular to travel direction
    bolt._baseVx = Math.cos(angle) * speed;
    bolt._baseVy = Math.sin(angle) * speed;
    bolt._perpX = -Math.sin(angle);
    bolt._perpY = Math.cos(angle);
    bolt._spawnTime = time;
    bolt._squiggleAmp = 40;

    // Update squiggly motion each frame
    const squiggleEvent = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (!bolt.active) {
          squiggleEvent.destroy();
          return;
        }
        const elapsed = (this.scene.time.now - bolt._spawnTime) / 1000;
        const squiggle = Math.sin(elapsed * 15) * bolt._squiggleAmp;
        bolt.setVelocity(
          bolt._baseVx + bolt._perpX * squiggle,
          bolt._baseVy + bolt._perpY * squiggle
        );
      },
    });
    bolt._squiggleEvent = squiggleEvent;

    this.scene.sound.play('sfx_poisonSpit', { volume: 0.2 });

    // Trail particles
    const trail = this.scene.add.particles(bolt.x, bolt.y, 'bullet', {
      speed: { min: 5, max: 15 },
      scale: { start: 0.6, end: 0 },
      lifespan: 200,
      quantity: 1,
      frequency: 60,
      tint: [0x33aa33, 0x88ff88],
      emitting: true,
    });
    bolt._trail = trail;

    const trailUpdate = this.scene.time.addEvent({
      delay: 30,
      loop: true,
      callback: () => {
        if (bolt.active) {
          trail.setPosition(bolt.x, bolt.y);
        }
      },
    });
    bolt._trailUpdate = trailUpdate;

    // Auto-destroy after range
    const lifetime = (this.range / this.poisonSpeed) * 1000;
    const currentFireId = time + Math.random();
    bolt._fireId = currentFireId;
    this.scene.time.delayedCall(lifetime, () => {
      if (bolt.active && bolt._fireId === currentFireId) {
        this.recycleBolt(bolt);
      }
    });
  }

  recycleBolt(bolt) {
    bolt.setActive(false);
    bolt.setVisible(false);
    bolt.body.enable = false;
    if (bolt._trail) {
      bolt._trail.destroy();
      bolt._trail = null;
    }
    if (bolt._trailUpdate) {
      bolt._trailUpdate.destroy();
      bolt._trailUpdate = null;
    }
    if (bolt._squiggleEvent) {
      bolt._squiggleEvent.destroy();
      bolt._squiggleEvent = null;
    }
  }

  setupCollision(enemies) {
    this.enemyGroup = enemies;

    // Poison bolt hits enemies
    this.scene.physics.add.overlap(
      this.poisonBolts,
      enemies,
      (bolt, enemy) => {
        if (!bolt.active || !enemy.active) return;

        enemy.takeDamage(bolt.damage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, bolt.damage, '#44ff44');
        }

        // Poison DOT — tint green, 2 ticks over 1 second
        if (!enemy._poisoned) {
          enemy._poisoned = true;
          enemy.setTint(0x44cc44);
          const dotDamage = Math.ceil(bolt.damage * 0.5);

          this.scene.time.delayedCall(500, () => {
            if (enemy.active) {
              enemy.takeDamage(dotDamage);
              if (this.scene.damageNumbers) {
                this.scene.damageNumbers.show(enemy.x, enemy.y, dotDamage, '#33aa33');
              }
            }
          });

          this.scene.time.delayedCall(1000, () => {
            if (enemy.active) {
              enemy.takeDamage(dotDamage);
              if (this.scene.damageNumbers) {
                this.scene.damageNumbers.show(enemy.x, enemy.y, dotDamage, '#33aa33');
              }
              enemy.clearTint();
            }
            enemy._poisoned = false;
          });
        }

        this.recycleBolt(bolt);
      }
    );
  }

  updateStats(stats) {
    this.slashRate = stats.slashRate;
    this.slashDamage = stats.slashDamage;
    this.poisonRate = stats.poisonRate;
    this.poisonDamage = stats.poisonDamage;
    this.poisonSpeed = stats.poisonSpeed;
    this.range = stats.range;
  }
}
