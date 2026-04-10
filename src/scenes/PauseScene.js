import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    // Dim overlay
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.7)
      .setDepth(190);

    // Panel background
    this.add.rectangle(482, 272, 280, 260, 0x000000, 0.3).setDepth(195);
    this.add.rectangle(480, 270, 280, 260, 0x0d0d22, 0.95)
      .setStrokeStyle(2, 0x333366)
      .setDepth(196);

    // Decorative top accent
    this.add.rectangle(480, 145, 200, 2, 0x4455aa, 0.4).setDepth(200);

    // Title
    this.add.text(480, 175, 'PAUSED', {
      fontSize: '36px',
      color: '#eeeeff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200);

    // Divider
    this.add.rectangle(480, 205, 160, 1, 0x333366, 0.4).setDepth(200);

    // Resume button
    this.add.rectangle(482, 262, 184, 44, 0x000000, 0.2).setDepth(199);
    const resumeBtn = this.add.text(480, 260, 'RESUME', {
      fontSize: '20px',
      color: '#44cc44',
      fontStyle: 'bold',
      backgroundColor: '#1a2a1a',
      padding: { x: 32, y: 10 },
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    resumeBtn.on('pointerover', () => {
      resumeBtn.setColor('#66ee66');
      resumeBtn.setBackgroundColor('#224422');
      resumeBtn.setScale(1.03);
    });
    resumeBtn.on('pointerout', () => {
      resumeBtn.setColor('#44cc44');
      resumeBtn.setBackgroundColor('#1a2a1a');
      resumeBtn.setScale(1.0);
    });
    resumeBtn.on('pointerdown', () => {
      this.resumeGame();
    });

    // Quit button
    this.add.rectangle(482, 332, 184, 44, 0x000000, 0.2).setDepth(199);
    const quitBtn = this.add.text(480, 330, 'QUIT TO MENU', {
      fontSize: '16px',
      color: '#cc5555',
      fontStyle: 'bold',
      backgroundColor: '#2a1a1a',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    quitBtn.on('pointerover', () => {
      quitBtn.setColor('#ff6666');
      quitBtn.setBackgroundColor('#3a2222');
      quitBtn.setScale(1.03);
    });
    quitBtn.on('pointerout', () => {
      quitBtn.setColor('#cc5555');
      quitBtn.setBackgroundColor('#2a1a1a');
      quitBtn.setScale(1.0);
    });
    quitBtn.on('pointerdown', () => {
      this.scene.stop('Game');
      this.scene.start('Menu');
    });

    // Controls hint
    this.add.text(480, 380, 'ESC to resume', {
      fontSize: '10px',
      color: '#444466',
    }).setOrigin(0.5).setDepth(200);

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
