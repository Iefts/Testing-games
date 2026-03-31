import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    const sheetKey = config.spriteSheet || 'player_sheet';
    super(scene, x, y, sheetKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp = config.hp;
    this.hp = config.hp;
    this.speed = config.speed;
    this.invulnerable = false;
    this.invulnerabilityTime = 500;

    this.setCollideWorldBounds(true);
    this.body.setSize(10, 14);
    this.body.setOffset(3, 1);

    // Health bar above player (in a container so it moves with the player)
    this.healthBarBg = scene.add.rectangle(0, -10, 14, 2, 0x000000)
      .setOrigin(0.5, 0.5);
    this.healthBarFill = scene.add.rectangle(-7, -10, 14, 2, 0x44cc44)
      .setOrigin(0, 0.5);
    this.healthBarContainer = scene.add.container(x, y, [this.healthBarBg, this.healthBarFill])
      .setDepth(10);

    // Start with idle animation
    this.animPrefix = config.animPrefix || 'player';
    this.play(`${this.animPrefix}_idle`);

    // Keep health bar locked to player position after physics runs
    scene.events.on('postupdate', () => {
      if (this.active) {
        this.healthBarContainer.setPosition(this.x, this.y);
      }
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
  }

  updateHealthBar() {
    const pct = this.hp / this.maxHp;
    this.healthBarFill.width = 14 * pct;
    if (pct > 0.5) {
      this.healthBarFill.setFillStyle(0x44cc44);
    } else if (pct > 0.25) {
      this.healthBarFill.setFillStyle(0xffaa00);
    } else {
      this.healthBarFill.setFillStyle(0xff3333);
    }
  }

  move(vector) {
    this.setVelocity(vector.x * this.speed, vector.y * this.speed);

    const moving = vector.x !== 0 || vector.y !== 0;

    // Play appropriate animation
    const walkKey = `${this.animPrefix}_walk`;
    const idleKey = `${this.animPrefix}_idle`;
    if (moving) {
      if (this.anims.currentAnim?.key !== walkKey) {
        this.play(walkKey);
      }
      // Flip sprite based on movement direction
      if (vector.x < 0) {
        this.setFlipX(true);
      } else if (vector.x > 0) {
        this.setFlipX(false);
      }
    } else {
      if (this.anims.currentAnim?.key !== idleKey) {
        this.play(idleKey);
      }
    }
  }

  takeDamage(amount) {
    if (this._godMode || this.invulnerable) return;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnerable = true;

    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.alpha = 1;
      },
    });

    this.scene.time.delayedCall(this.invulnerabilityTime, () => {
      this.invulnerable = false;
    });

    if (this.hp <= 0) {
      this.scene.events.emit('playerDeath');
    }
  }
}
