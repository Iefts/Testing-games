export class DamageNumbers {
  constructor(scene) {
    this.scene = scene;
  }

  show(x, y, amount, color = '#ffffff') {
    const text = this.scene.add.text(x, y - 8, Math.round(amount).toString(), {
      fontSize: '8px',
      fontFamily: 'monospace',
      color,
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(1000);

    // Random horizontal offset for variety
    const offsetX = Phaser.Math.Between(-6, 6);

    this.scene.tweens.add({
      targets: text,
      y: y - 24,
      x: x + offsetX,
      alpha: 0,
      duration: 600,
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
