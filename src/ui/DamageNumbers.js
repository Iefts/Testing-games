export class DamageNumbers {
  constructor(scene) {
    this.scene = scene;
  }

  show(x, y, amount, color = '#ffffff') {
    const rounded = Math.round(amount);
    const isBig = rounded >= 20;
    const fontSize = isBig ? '10px' : '8px';

    const text = this.scene.add.text(x, y - 8, rounded.toString(), {
      fontSize,
      fontFamily: 'monospace',
      fontStyle: isBig ? 'bold' : 'normal',
      color,
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(1000);

    // Random horizontal offset for variety
    const offsetX = Phaser.Math.Between(-8, 8);

    // Bigger hits float higher and last longer
    const floatDist = isBig ? 28 : 20;
    const duration = isBig ? 750 : 550;

    // Scale pop for big hits
    if (isBig) {
      text.setScale(1.3);
      this.scene.tweens.add({
        targets: text,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut',
      });
    }

    this.scene.tweens.add({
      targets: text,
      y: y - floatDist,
      x: x + offsetX,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }
}

// Weapon color map
export const DAMAGE_COLORS = {
  revolver: '#ffdd44',
  damageAura: '#44aaff',
  unicornRider: '#aa44ff',
  piercingDart: '#cccccc',
  spearRain: '#cc8844',
  flameTrail: '#ff6600',
  tornado: '#bbbbbb',
  bugs: '#66dd44',
  rapier: '#dddddd',
  bloodOrb: '#cc2222',
  enemy: '#ff3333',
};
