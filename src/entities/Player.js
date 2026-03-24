import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.sprite);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp = config.hp;
    this.hp = config.hp;
    this.speed = config.speed;
    this.invulnerable = false;
    this.invulnerabilityTime = 500; // ms

    this.setCollideWorldBounds(true);
    this.body.setSize(10, 14);
    this.body.setOffset(3, 1);
  }

  move(vector) {
    this.setVelocity(vector.x * this.speed, vector.y * this.speed);
  }

  takeDamage(amount) {
    if (this.invulnerable) return;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnerable = true;

    // Flash effect
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
