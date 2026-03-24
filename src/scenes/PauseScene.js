import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    // Dim overlay
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.7)
      .setDepth(190);

    // Title
    this.add.text(480, 160, 'PAUSED', {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);

    // Resume button
    const resumeBtn = this.add.text(480, 280, 'RESUME', {
      fontSize: '24px',
      color: '#44cc44',
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 32, y: 12 },
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    resumeBtn.on('pointerover', () => {
      resumeBtn.setColor('#66ee66');
      resumeBtn.setBackgroundColor('#444466');
    });
    resumeBtn.on('pointerout', () => {
      resumeBtn.setColor('#44cc44');
      resumeBtn.setBackgroundColor('#333355');
    });
    resumeBtn.on('pointerdown', () => {
      this.resumeGame();
    });

    // Quit button
    const quitBtn = this.add.text(480, 360, 'QUIT TO MENU', {
      fontSize: '24px',
      color: '#ff4444',
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 32, y: 12 },
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    quitBtn.on('pointerover', () => {
      quitBtn.setColor('#ff6666');
      quitBtn.setBackgroundColor('#444466');
    });
    quitBtn.on('pointerout', () => {
      quitBtn.setColor('#ff4444');
      quitBtn.setBackgroundColor('#333355');
    });
    quitBtn.on('pointerdown', () => {
      this.scene.stop('Game');
      this.scene.start('Menu');
    });

    // Resume on Escape key
    this.input.keyboard.on('keydown-ESC', () => {
      this.resumeGame();
    });
  }

  resumeGame() {
    const gameScene = this.scene.get('Game');
    gameScene.paused = false;
    gameScene.physics.resume();
    gameScene.timerSystem.resume();
    this.scene.stop();
  }
}
