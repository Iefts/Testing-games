import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.sprite);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = config;
    this.hp = config.baseHp;
    this.maxHp = config.baseHp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.xpValue = config.xpValue;

    this.body.setCircle(config.colliderRadius);
    this.body.setOffset(
      (16 - config.colliderRadius * 2) / 2,
      (16 - config.colliderRadius * 2) / 2
    );

    if (config.scale) {
      this.setScale(config.scale);
    }

    // Ranged enemy properties
    this.ranged = config.ranged || false;
    this.attackRange = config.attackRange || 120;
    this.projectileSpeed = config.projectileSpeed || 100;
    this.fireRate = config.fireRate || 2000;
    this.lastFired = 0;

    // Movement pattern
    this.movementPattern = config.movementPattern || 'direct';
    this.moveTimer = 0;
  }

  spawn(x, y, healthMultiplier) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.clearTint();

    this.hp = Math.floor(this.config.baseHp * healthMultiplier);
    this.maxHp = this.hp;

    if (this.config.scale) {
      this.setScale(this.config.scale);
    }
  }

  moveToward(targetX, targetY, delta) {
    if (this.ranged) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
      if (dist <= this.attackRange) {
        this.setVelocity(0, 0);
        return;
      }
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
      return;
    }

    this.moveTimer += (delta || 16);
    const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    switch (this.movementPattern) {
      case 'skitter': {
        // Zigzag approach with sine-wave lateral wobble
        const wobble = Math.sin(this.moveTimer * 0.008) * 0.7;
        const angle = baseAngle + wobble;
        this.setVelocity(
          Math.cos(angle) * this.speed,
          Math.sin(angle) * this.speed
        );
        break;
      }
      case 'shuffle': {
        // Lurching movement with brief pauses and slight sway
        const cycle = this.moveTimer % 800;
        if (cycle < 150) {
          this.setVelocity(0, 0);
        } else {
          const sway = Math.sin(this.moveTimer * 0.003) * 0.15;
          const angle = baseAngle + sway;
          this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
          );
        }
        break;
      }
      case 'lumber': {
        // Stomp-stop-stomp with long pauses
        const cycle = this.moveTimer % 2500;
        if (cycle > 2000) {
          this.setVelocity(0, 0);
        } else {
          this.setVelocity(
            Math.cos(baseAngle) * this.speed,
            Math.sin(baseAngle) * this.speed
          );
        }
        break;
      }
      case 'drift': {
        // Lazy floating with wide lateral drift and pulsing speed
        const drift = Math.sin(this.moveTimer * 0.003) * 1.2;
        const angle = baseAngle + drift;
        const speedMod = 0.7 + 0.3 * Math.sin(this.moveTimer * 0.005);
        this.setVelocity(
          Math.cos(angle) * this.speed * speedMod,
          Math.sin(angle) * this.speed * speedMod
        );
        break;
      }
      default: {
        // Direct pursuit (slimes etc.)
        this.setVelocity(
          Math.cos(baseAngle) * this.speed,
          Math.sin(baseAngle) * this.speed
        );
        break;
      }
    }
  }

  tryShoot(targetX, targetY, time) {
    if (!this.ranged || !this.active) return false;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    if (dist > this.attackRange) return false;
    if (time < this.lastFired + this.fireRate) return false;

    this.lastFired = time;
    return true;
  }

  takeDamage(amount) {
    this.hp -= amount;

    // Flash white on hit
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(150, () => {
      if (this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.scene.events.emit('enemyKilled', this);
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
  }
}
