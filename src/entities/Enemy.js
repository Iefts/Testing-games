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
  }

  spawn(x, y, healthMultiplier) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;

    this.hp = Math.floor(this.config.baseHp * healthMultiplier);
    this.maxHp = this.hp;
  }

  moveToward(targetX, targetY) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  takeDamage(amount) {
    this.hp -= amount;

    // Flash white on hit
    this.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
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
