import { Weapon } from './Weapon.js';

export class Revolver extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      fireRate: 600,
      damage: 5,
      bulletSpeed: 250,
      range: 150,
      bulletKey: 'bullet',
      maxBullets: 30,
    });
  }

  updateStats(stats) {
    this.fireRate = stats.fireRate;
    this.damage = stats.damage;
    this.bulletSpeed = stats.bulletSpeed;
    this.range = stats.range;
  }
}
