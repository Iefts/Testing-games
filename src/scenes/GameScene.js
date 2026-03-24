import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // Temporary green background to verify the game boots
    this.cameras.main.setBackgroundColor('#4a8c3f');

    this.add.text(240, 135, 'Game Running', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }
}
