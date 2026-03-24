import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(240, 80, 'ROGUELIKE\nSURVIVOR', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Start button
    const startBtn = this.add.text(240, 180, 'START', {
      fontSize: '16px',
      color: '#44cc44',
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 20, y: 8 },
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

    // Also allow Enter key
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('CharacterSelect');
    });
  }
}
