import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(480, 160, 'ROGUELIKE\nSURVIVOR', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Start button
    const startBtn = this.add.text(480, 360, 'START', {
      fontSize: '32px',
      color: '#44cc44',
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 40, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => {
      startBtn.setColor('#66ee66');
      startBtn.setBackgroundColor('#444466');
    });
    startBtn.on('pointerout', () => {
      startBtn.setColor('#44cc44');
      startBtn.setBackgroundColor('#333355');
    });
    startBtn.on('pointerdown', () => {
      this.scene.start('CharacterSelect');
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('CharacterSelect');
    });
  }
}
