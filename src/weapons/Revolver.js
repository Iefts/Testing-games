import Phaser from 'phaser';
import { Weapon } from './Weapon.js';

export class Revolver extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      fireRate: 600,
      damage: 5,
      bulletSpeed: 250,
      range: 150,
      bulletKey: 'bullet',
      maxBullets: 80,
    });
    this.isEvolved = false;
  }

  updateStats(stats) {
    this.fireRate = stats.fireRate;
    this.damage = stats.damage;
    this.bulletSpeed = stats.bulletSpeed;
    this.range = stats.range;
  }

  evolve() {
    this.isEvolved = true;
  }

  // Override update so the evolved form fires even without a target (all-directions hail).
  update(time, enemies) {
    if (!this.isEvolved) {
      super.update(time, enemies);
      return;
    }
    if (time < this.lastFired + this.fireRate) return;
    this.hailstorm();
    this.lastFired = time;
  }

  hailstorm() {
    const spokes = 8;
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2 + (this.scene.time.now * 0.0008);
      const bullet = this.bullets.get(this.player.x, this.player.y, this.bulletKey);
      if (!bullet) continue;
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setTint(0xaaddff);
      bullet.setScale(1.4);
      bullet.setRotation(angle);
      bullet.setVelocity(Math.cos(angle) * this.bulletSpeed, Math.sin(angle) * this.bulletSpeed);
      bullet.damage = this.damage;

      const fireId = Date.now() + Math.random();
      bullet._fireId = fireId;
      const lifetime = (this.range / this.bulletSpeed) * 1000;
      this.scene.time.delayedCall(lifetime, () => {
        if (bullet.active && bullet._fireId === fireId) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.enable = false;
          bullet.clearTint();
          bullet.setScale(1);
        }
      });
    }
    this.scene.sound.play('sfx_shoot', { volume: 0.35 });
  }
}
