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

    // Start button — HTML img overlay for full quality (bypasses pixelArt filtering)
    const canvas = this.game.canvas;
    const canvasRect = canvas.getBoundingClientRect();

    const startImg = document.createElement('img');
    startImg.src = 'StartArtwork.jpg';
    startImg.style.position = 'absolute';
    startImg.style.width = '220px';
    startImg.style.height = 'auto';
    startImg.style.cursor = 'pointer';
    startImg.style.zIndex = '10';
    startImg.style.transition = 'transform 0.1s';

    // Position relative to canvas
    const updatePosition = () => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / 960;
      const scaleY = rect.height / 540;
      const imgW = 220 * scaleX;
      startImg.style.width = imgW + 'px';
      startImg.style.left = (rect.left + rect.width / 2 - imgW / 2) + 'px';
      startImg.style.top = (rect.top + 235 * scaleY) + 'px';
    };

    startImg.onload = updatePosition;
    window.addEventListener('resize', updatePosition);

    startImg.addEventListener('mouseenter', () => {
      startImg.style.transform = 'scale(1.08)';
    });
    startImg.addEventListener('mouseleave', () => {
      startImg.style.transform = 'scale(1.0)';
    });
    startImg.addEventListener('click', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      startImg.remove();
      window.removeEventListener('resize', updatePosition);
      this.scene.start('CharacterSelect');
    });

    document.body.appendChild(startImg);

    // Clean up if scene is shut down without clicking
    this.events.on('shutdown', () => {
      startImg.remove();
      window.removeEventListener('resize', updatePosition);
    });

    // Multiplayer button
    const mpBtn = this.add.text(480, 430, 'MULTIPLAYER', {
      fontSize: '24px',
      color: '#44aaff',
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 30, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    mpBtn.on('pointerover', () => {
      mpBtn.setColor('#66ccff');
      mpBtn.setBackgroundColor('#444466');
    });
    mpBtn.on('pointerout', () => {
      mpBtn.setColor('#44aaff');
      mpBtn.setBackgroundColor('#333355');
    });
    mpBtn.on('pointerdown', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Lobby');
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('CharacterSelect');
    });
  }
}
