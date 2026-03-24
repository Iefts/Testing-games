import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, 'player_sheet', 0);

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

    // Start with idle animation
    this.play('player_idle');
  }

  move(vector) {
    this.setVelocity(vector.x * this.speed, vector.y * this.speed);

    const moving = vector.x !== 0 || vector.y !== 0;

    // Play appropriate animation
    if (moving) {
      if (this.anims.currentAnim?.key !== 'player_walk') {
        this.play('player_walk');
      }
      // Flip sprite based on movement direction
      if (vector.x < 0) {
        this.setFlipX(true);
      } else if (vector.x > 0) {
        this.setFlipX(false);
      }
    } else {
      if (this.anims.currentAnim?.key !== 'player_idle') {
        this.play('player_idle');
      }
    }
  }

  takeDamage(amount) {
    if (this.invulnerable) return;

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
