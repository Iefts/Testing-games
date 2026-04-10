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
    this.cameras.main.setBackgroundColor('#0a0a1a');

    this.sound.play(this.victory ? 'sfx_victory' : 'sfx_gameOver', { volume: 0.5 });

    // --- Animated particle background ---
    this.particles = [];
    const particleColor = this.victory ? [0x44cc44, 0x88ff88, 0x66dd66] : [0xcc4444, 0xff6666, 0xaa3333];
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const size = Phaser.Math.Between(1, 3);
      const alpha = 0.1 + Math.random() * 0.3;
      const color = Phaser.Math.RND.pick(particleColor);
      const p = this.add.rectangle(x, y, size, size, color, alpha);
      p._vy = -0.1 - Math.random() * 0.3;
      p._vx = (Math.random() - 0.5) * 0.3;
      p._baseAlpha = alpha;
      this.particles.push(p);
    }

    // --- Decorative top border ---
    const borderColor = this.victory ? 0x44cc44 : 0xcc4444;
    this.add.rectangle(480, 40, 400, 2, borderColor, 0.4);
    this.add.rectangle(480, 42, 250, 1, borderColor, 0.2);

    // --- Title with glow ---
    const title = this.victory ? 'VICTORY!' : 'GAME OVER';
    const titleColor = this.victory ? '#44cc44' : '#ff4444';
    const glowColor = this.victory ? '#22aa22' : '#aa2222';

    // Glow layer
    this.titleGlow = this.add.text(480, 90, title, {
      fontSize: '52px',
      color: glowColor,
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.25);

    // Main title
    this.add.text(480, 90, title, {
      fontSize: '48px',
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // --- Stats panel ---
    const panelX = 480;
    const panelY = 230;
    const panelW = 340;
    const panelH = 160;

    // Panel shadow
    this.add.rectangle(panelX + 2, panelY + 2, panelW, panelH, 0x000000, 0.3);
    // Panel background
    this.add.rectangle(panelX, panelY, panelW, panelH, 0x111128, 0.9)
      .setStrokeStyle(2, 0x333366);
    // Panel header
    this.add.rectangle(panelX, panelY - panelH / 2 + 16, panelW - 4, 28, 0x1a1a3a, 0.9);
    this.add.text(panelX, panelY - panelH / 2 + 16, 'STATS', {
      fontSize: '14px',
      color: '#8888bb',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Divider under header
    this.add.rectangle(panelX, panelY - panelH / 2 + 31, panelW - 20, 1, 0x333366, 0.5);

    const statsData = [
      { label: 'Time Survived', value: this.stats.time || '00:00', icon: null },
      { label: 'Enemies Killed', value: `${this.stats.kills || 0}`, icon: null },
      { label: 'Level Reached', value: `${this.stats.level || 1}`, icon: null },
    ];

    const startY = panelY - 30;
    statsData.forEach((stat, i) => {
      const y = startY + i * 40;
      // Label
      this.add.text(panelX - panelW / 2 + 30, y, stat.label, {
        fontSize: '14px',
        color: '#8888aa',
      }).setOrigin(0, 0.5);
      // Value
      this.add.text(panelX + panelW / 2 - 30, y, stat.value, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(1, 0.5);

      // Separator between rows
      if (i < statsData.length - 1) {
        this.add.rectangle(panelX, y + 20, panelW - 40, 1, 0x222244, 0.4);
      }
    });

    // --- Decorative bottom border ---
    this.add.rectangle(480, 340, 400, 2, borderColor, 0.3);

    // --- Continue button (polished) ---
    const btnY = 400;
    // Button shadow
    this.add.rectangle(482, btnY + 2, 220, 48, 0x000000, 0.3);
    // Button border
    this.add.rectangle(480, btnY, 220, 48, 0x000000, 0)
      .setStrokeStyle(2, 0x4488cc);

    const continueBtn = this.add.text(480, btnY, 'CONTINUE', {
      fontSize: '22px',
      color: '#55bbff',
      fontStyle: 'bold',
      backgroundColor: '#1a2244',
      padding: { x: 32, y: 12 },
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerover', () => {
      continueBtn.setColor('#88ddff');
      continueBtn.setBackgroundColor('#223355');
      continueBtn.setScale(1.05);
    });
    continueBtn.on('pointerout', () => {
      continueBtn.setColor('#55bbff');
      continueBtn.setBackgroundColor('#1a2244');
      continueBtn.setScale(1.0);
    });
    continueBtn.on('pointerdown', () => {
      this.goToPostGame();
    });

    // Controls hint
    this.add.text(480, 460, 'ENTER or SPACE to continue', {
      fontSize: '10px',
      color: '#444466',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ENTER', () => {
      this.goToPostGame();
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      this.goToPostGame();
    });

    // --- Glow timer for animations ---
    this.glowTimer = 0;

    // Entrance animation — fade in stats
    this.cameras.main.fadeIn(300);
  }

  update(time, delta) {
    // Animate particles
    for (const p of this.particles) {
      p.x += p._vx;
      p.y += p._vy;
      if (p.y < -5) p.y = 545;
      if (p.x < -5) p.x = 965;
      if (p.x > 965) p.x = -5;
      p.alpha = p._baseAlpha + Math.sin(time * 0.002 + p.x) * 0.12;
    }

    // Pulse title glow
    this.glowTimer += delta * 0.002;
    this.titleGlow.setAlpha(0.15 + Math.sin(this.glowTimer) * 0.12);
  }

  goToPostGame() {
    this.scene.start('PostGame', {
      victory: this.victory,
      stats: this.stats,
    });
  }
}
