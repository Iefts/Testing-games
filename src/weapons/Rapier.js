import Phaser from 'phaser';
import { Weapon } from './Weapon.js';

export class Rapier extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      fireRate: 400,
      damage: 4,
      bulletSpeed: 350,
      range: 250,
      bulletKey: 'rapier',
      maxBullets: 30,
    });
  }

  fire(target) {
    const bullet = this.bullets.get(this.player.x, this.player.y, this.bulletKey);
    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;

    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );

    bullet.setRotation(angle);
    bullet.setVelocity(
      Math.cos(angle) * this.bulletSpeed,
      Math.sin(angle) * this.bulletSpeed
    );

    bullet.damage = this.damage;

    this.scene.sound.play('sfx_rapier', { volume: 0.25 });

    this.scene.time.delayedCall(2000, () => {
      if (bullet.active) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
      }
    });
  }

  updateStats(stats) {
    this.fireRate = stats.fireRate;
    this.damage = stats.damage;
    this.bulletSpeed = stats.bulletSpeed;
    this.range = stats.range;
  }
}
