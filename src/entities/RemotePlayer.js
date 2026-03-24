import Phaser from 'phaser';
import { CHARACTERS } from '../config/Characters.js';

export class RemotePlayer extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, characterId) {
    const config = CHARACTERS[characterId] || CHARACTERS.human;
    super(scene, x, y, config.spriteSheet, 0);

    scene.add.existing(this);
    this.animPrefix = config.animPrefix;
    this.characterId = characterId;
    this.setDepth(10);

    // Health bar
    this.healthBarBg = scene.add.rectangle(x, y - 12, 16, 2, 0x000000)
      .setDepth(11).setOrigin(0.5);
    this.healthBarFill = scene.add.rectangle(x, y - 12, 16, 2, 0x44cc44)
      .setDepth(12).setOrigin(0.5);

    // Name label
    this.nameLabel = scene.add.text(x, y - 18, '', {
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(11);

    this.targetX = x;
    this.targetY = y;
    this.isAlive = true;
  }

  syncFromServer(data) {
    this.targetX = data.x;
    this.targetY = data.y;
    this.isAlive = data.alive;

    // Interpolate position
    this.x = Phaser.Math.Linear(this.x, this.targetX, 0.5);
    this.y = Phaser.Math.Linear(this.y, this.targetY, 0.5);

    this.setFlipX(data.flipX);
    this.setVisible(data.alive);
    this.setAlpha(data.inv ? 0.5 : 1);

    // Animation
    const animKey = data.anim === 'walk'
      ? `${this.animPrefix}_walk`
      : `${this.animPrefix}_idle`;
    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey);
    }

    // Health bar
    const healthPct = data.hp / data.mhp;
    this.healthBarBg.setPosition(this.x, this.y - 12);
    this.healthBarFill.setPosition(this.x, this.y - 12);
    this.healthBarFill.setSize(16 * healthPct, 2);
    this.healthBarBg.setVisible(data.alive);
    this.healthBarFill.setVisible(data.alive);

    if (healthPct > 0.5) this.healthBarFill.setFillStyle(0x44cc44);
    else if (healthPct > 0.25) this.healthBarFill.setFillStyle(0xffaa00);
    else this.healthBarFill.setFillStyle(0xff3333);

    // Name
    this.nameLabel.setPosition(this.x, this.y - 18);
    this.nameLabel.setVisible(data.alive);
  }

  setPlayerName(name) {
    this.nameLabel.setText(name);
  }

  destroy() {
    this.healthBarBg.destroy();
    this.healthBarFill.destroy();
    this.nameLabel.destroy();
    super.destroy();
  }
}
