import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';
import { pickChallenges } from '../config/Challenges.js';
import { PASS_REWARDS, applyReward } from '../config/PassRewards.js';

export class PostGameScene extends Phaser.Scene {
  constructor() {
    super('PostGame');
  }

  init(data) {
    this.victory = data.victory || false;
    this.stats = data.stats || {};
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0a1a');
    SaveSystem.incrementGamesPlayed();

    // Background particles
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const size = Phaser.Math.Between(1, 2);
      const alpha = 0.05 + Math.random() * 0.15;
      const color = Phaser.Math.RND.pick([0x334477, 0x443366, 0x223355]);
      const p = this.add.rectangle(x, y, size, size, color, alpha);
      p._vy = -0.05 - Math.random() * 0.1;
      p._vx = (Math.random() - 0.5) * 0.15;
      p._baseAlpha = alpha;
      this.particles.push(p);
    }

    // Title with accent
    this.add.rectangle(480, 12, 180, 2, 0x4455aa, 0.3);
    this.add.text(480, 26, 'RESULTS', {
      fontSize: '22px',
      color: '#eeeeff',
      fontStyle: 'bold',
      stroke: '#0a0a1a',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.rectangle(480, 42, 120, 1, 0x333366, 0.3);

    // --- Calculate XP breakdown ---
    const kills = this.stats.kills || 0;
    const elapsed = this.stats.elapsedSeconds || 0;
    const minutes = elapsed / 60;
    const level = this.stats.level || 1;

    const baseXP = 50;
    const killXP = kills;
    const timeXP = Math.floor(minutes * 20);
    const levelXP = level * 10;

    // Challenges
    const challenges = pickChallenges();
    let challengeXP = 0;
    const challengeResults = challenges.map(c => {
      const completed = c.check({
        kills,
        elapsedSeconds: elapsed,
        level,
        victory: this.victory,
      });
      if (completed) challengeXP += c.xpReward;
      return { ...c, completed };
    });

    let subtotal = baseXP + killXP + timeXP + levelXP + challengeXP;

    // Victory bonus (doubles)
    const victoryMultiplier = this.victory ? 2 : 1;
    let total = subtotal * victoryMultiplier;

    // XP Boost from shop
    const hasBoost = SaveSystem.consumeBoost('xp_boost');
    const boostMultiplier = hasBoost ? 1.5 : 1;
    total = Math.floor(total * boostMultiplier);

    // --- Left panel: XP Breakdown ---
    const leftX = 240;
    const panelW = 300;

    // Panel background
    this.add.rectangle(leftX + 40 + 1, 255 + 1, panelW, 380, 0x000000, 0.2);
    this.add.rectangle(leftX + 40, 255, panelW, 380, 0x0d0d22, 0.8)
      .setStrokeStyle(1, 0x333366);

    let rowY = 80;
    const rowGap = 24;

    const addRow = (label, value, color = '#ccccdd') => {
      this.add.text(leftX - 80, rowY, label, {
        fontSize: '13px',
        color: '#6677aa',
      }).setOrigin(0, 0.5);
      this.add.text(leftX + 160, rowY, `+${value} XP`, {
        fontSize: '13px',
        color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(1, 0.5);
      rowY += rowGap;
    };

    addRow('Base Reward', baseXP);
    addRow(`Kills (${kills})`, killXP);
    addRow(`Time (${Math.floor(minutes)}m ${Math.floor(elapsed % 60)}s)`, timeXP);
    addRow(`Level Reached (${level})`, levelXP);

    if (this.victory) {
      addRow('Victory Bonus', `x2`, '#44cc44');
    }
    if (hasBoost) {
      addRow('XP Boost', 'x1.5', '#55aaff');
    }

    // Separator
    rowY += 4;
    this.add.rectangle(leftX + 40, rowY, panelW - 30, 1, 0x333366, 0.4);
    rowY += 14;

    // Challenges section header
    this.add.rectangle(leftX + 40, rowY + 2, panelW - 20, 20, 0x1a1a2a, 0.5);
    this.add.text(leftX - 80, rowY, 'CHALLENGES', {
      fontSize: '12px',
      color: '#ddaa33',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1,
    });
    rowY += 24;

    challengeResults.forEach(c => {
      const check = c.completed ? '[x]' : '[ ]';
      const color = c.completed ? '#44cc44' : '#555566';
      this.add.text(leftX - 80, rowY, `${check} ${c.description}`, {
        fontSize: '11px',
        color,
      });
      if (c.completed) {
        this.add.text(leftX + 160, rowY, `+${c.xpReward} XP`, {
          fontSize: '11px',
          color: '#44cc44',
          fontStyle: 'bold',
        }).setOrigin(1, 0);
      }
      rowY += 20;
    });

    // Total XP
    rowY += 8;
    this.add.rectangle(leftX + 40, rowY, panelW - 30, 1, 0x5566aa, 0.4);
    rowY += 16;

    this.add.rectangle(leftX + 40, rowY + 4, panelW - 20, 24, 0x1a1a3a, 0.5);
    this.add.text(leftX - 80, rowY, 'TOTAL XP', {
      fontSize: '15px',
      color: '#eeeeff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.add.text(leftX + 160, rowY, `+${total}`, {
      fontSize: '15px',
      color: '#ffcc44',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0);

    // --- Right panel: XP Bar Animation ---
    const barX = 580;
    const barY = 100;
    const barW = 280;
    const barH = 20;

    // Right panel background
    this.add.rectangle(barX + barW / 2 + 1, 255 + 1, panelW, 380, 0x000000, 0.2);
    this.add.rectangle(barX + barW / 2, 255, panelW, 380, 0x0d0d22, 0.8)
      .setStrokeStyle(1, 0x333366);

    this.add.text(barX + barW / 2, barY - 20, 'PLAYER LEVEL', {
      fontSize: '13px',
      color: '#8899bb',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const prevLevel = SaveSystem.level;
    const prevXP = SaveSystem.xp;
    const prevMax = SaveSystem.xpToNext;

    // Apply XP and get level ups
    const levelUps = SaveSystem.addXP(total);

    // Apply pass rewards for each level up
    const rewards = [];
    for (const lv of levelUps) {
      const result = applyReward(SaveSystem, lv);
      if (result) rewards.push({ level: lv, ...result });
    }

    // XP bar shadow
    this.add.rectangle(barX + 1, barY + 1, barW, barH, 0x000000, 0.3).setOrigin(0);
    // XP bar background
    this.add.rectangle(barX, barY, barW, barH, 0x0d0d22).setOrigin(0);
    this.add.rectangle(barX, barY, barW, barH, 0x000000, 0).setOrigin(0).setStrokeStyle(2, 0x3344aa);

    // Animated fill bar
    const startFill = prevXP / prevMax;
    this.xpBarFill = this.add.rectangle(barX + 2, barY + 2, (barW - 4) * startFill, barH - 4, 0x3388dd).setOrigin(0);
    // Highlight top half
    this.xpBarHighlight = this.add.rectangle(barX + 2, barY + 2, (barW - 4) * startFill, (barH - 4) / 2, 0x55aaff, 0.3).setOrigin(0);

    // Level text
    this.levelText = this.add.text(barX + barW / 2, barY + barH / 2, `Lv.${prevLevel}`, {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.xpText = this.add.text(barX + barW / 2, barY + barH + 10, `${prevXP} / ${prevMax}`, {
      fontSize: '10px',
      color: '#6677aa',
    }).setOrigin(0.5);

    // Animate the XP bar
    this.animateXPBar(barX, barW, barH, prevLevel, prevXP, prevMax, total, levelUps);

    // Show rewards below XP bar
    let rewardY = barY + 56;
    if (rewards.length > 0) {
      this.add.rectangle(barX + barW / 2, rewardY + 2, 200, 20, 0x1a1a2a, 0.5);
      this.add.text(barX + barW / 2, rewardY, 'REWARDS', {
        fontSize: '13px',
        color: '#ddaa33',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
      rewardY += 26;

      rewards.forEach(r => {
        const color = r.type === 'coins' ? '#ddaa22' : (r.type === 'character' ? '#55aaff' : (r.type === 'level' ? '#44cc44' : '#cc8833'));

        this.add.text(barX + barW / 2, rewardY, `Lv.${r.level}: ${r.description}`, {
          fontSize: '11px',
          color,
          align: 'center',
        }).setOrigin(0.5);
        rewardY += 20;
      });
    }

    // Coins earned
    const coinsFromRewards = rewards
      .filter(r => r.type === 'coins')
      .reduce((sum, r) => sum + r.amount, 0);
    if (coinsFromRewards > 0) {
      this.add.text(barX + barW / 2, rewardY + 10, `+${coinsFromRewards} Coins earned!`, {
        fontSize: '12px',
        color: '#ddaa22',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
    }

    // --- Continue button (polished) ---
    const btnY = 490;
    this.add.rectangle(482, btnY + 2, 240, 44, 0x000000, 0.3);
    this.add.rectangle(480, btnY, 240, 44, 0x000000, 0)
      .setStrokeStyle(2, 0x4488cc);

    const continueBtn = this.add.text(480, btnY, 'CONTINUE TO MENU', {
      fontSize: '18px',
      color: '#55bbff',
      fontStyle: 'bold',
      backgroundColor: '#1a2244',
      padding: { x: 28, y: 10 },
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerover', () => {
      continueBtn.setColor('#88ddff');
      continueBtn.setBackgroundColor('#223355');
      continueBtn.setScale(1.03);
    });
    continueBtn.on('pointerout', () => {
      continueBtn.setColor('#55bbff');
      continueBtn.setBackgroundColor('#1a2244');
      continueBtn.setScale(1.0);
    });
    continueBtn.on('pointerdown', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Menu');
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Menu');
    });

    // Fade in
    this.cameras.main.fadeIn(300);
  }

  animateXPBar(barX, barW, barH, startLevel, startXP, startMax, totalXP, levelUps) {
    const endLevel = SaveSystem.level;
    const endXP = SaveSystem.xp;
    const endMax = SaveSystem.xpToNext;

    const fillW = barW - 4;

    if (levelUps.length === 0) {
      const endFill = endXP / endMax;
      this.tweens.add({
        targets: [this.xpBarFill, this.xpBarHighlight],
        width: fillW * endFill,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          this.xpText.setText(`${endXP} / ${endMax}`);
        },
      });
    } else {
      this.tweens.add({
        targets: [this.xpBarFill, this.xpBarHighlight],
        width: fillW,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          this.cameras.main.flash(200, 255, 255, 100);
          this.sound.play('sfx_levelUp', { volume: 0.4 });

          this.xpBarFill.width = 0;
          this.xpBarHighlight.width = 0;
          this.levelText.setText(`Lv.${endLevel}`);
          this.xpText.setText(`${endXP} / ${endMax}`);

          this.tweens.add({
            targets: [this.xpBarFill, this.xpBarHighlight],
            width: fillW * (endXP / endMax),
            duration: 600,
            ease: 'Power2',
          });
        },
      });
    }
  }

  update(time) {
    for (const p of this.particles) {
      p.x += p._vx;
      p.y += p._vy;
      if (p.y < -5) p.y = 545;
      if (p.x < -5) p.x = 965;
      if (p.x > 965) p.x = -5;
      p.alpha = p._baseAlpha + Math.sin(time * 0.001 + p.x) * 0.08;
    }
  }
}
