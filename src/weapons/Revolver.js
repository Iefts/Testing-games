import { Weapon } from './Weapon.js';

export class Revolver extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      fireRate: 600,
      damage: 5,
      bulletSpeed: 300,
      range: 300,
      bulletKey: 'bullet',
      maxBullets: 30,
    });
  }
}
