import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.victory = data.victory || false;
    this.stats = data.stats || {};
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    const title = this.victory ? 'VICTORY!' : 'GAME OVER';
    const titleColor = this.victory ? '#44cc44' : '#ff4444';
    this.add.text(240, 50, title, {
      fontSize: '24px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    const statsY = 100;
    const stats = [
      `Time Survived: ${this.stats.time || '00:00'}`,
      `Enemies Killed: ${this.stats.kills || 0}`,
      `Level Reached: ${this.stats.level || 1}`,
    ];

    stats.forEach((text, i) => {
      this.add.text(240, statsY + i * 20, text, {
        fontSize: '10px',
        color: '#cccccc',
      }).setOrigin(0.5);
    });

    // Return to menu button
    const menuBtn = this.add.text(240, 210, 'RETURN TO MENU', {
      fontSize: '12px',
      color: '#44aaff',
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 16, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => {
      menuBtn.setColor('#88ccff');
      menuBtn.setBackgroundColor('#444466');
    });
    menuBtn.on('pointerout', () => {
      menuBtn.setColor('#44aaff');
      menuBtn.setBackgroundColor('#333355');
    });
    menuBtn.on('pointerdown', () => {
      this.scene.start('Menu');
    });

    // Also allow Enter key
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('Menu');
    });
  }
}
