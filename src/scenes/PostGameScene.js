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
    this.cameras.main.setBackgroundColor('#1a1a2e');
    SaveSystem.incrementGamesPlayed();

    // Title
    this.add.text(480, 28, 'RESULTS', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

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

    // --- Display XP Breakdown ---
    const leftX = 240;
    let rowY = 70;
    const rowGap = 24;

    const addRow = (label, value, color = '#cccccc') => {
      this.add.text(leftX - 80, rowY, label, { fontSize: '14px', color: '#888899' }).setOrigin(0, 0.5);
      this.add.text(leftX + 160, rowY, `+${value} XP`, { fontSize: '14px', color }).setOrigin(1, 0.5);
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
      addRow('XP Boost', 'x1.5', '#66aaff');
    }

    // Separator
    rowY += 4;
    this.add.rectangle(leftX + 40, rowY, 280, 1, 0x444466);
    rowY += 12;

    // Challenges section
    this.add.text(leftX - 80, rowY, 'CHALLENGES', {
      fontSize: '13px',
      color: '#ffcc44',
      fontStyle: 'bold',
    });
    rowY += 22;

    challengeResults.forEach(c => {
      const check = c.completed ? '[x]' : '[ ]';
      const color = c.completed ? '#44cc44' : '#666666';
      this.add.text(leftX - 80, rowY, `${check} ${c.description}`, {
        fontSize: '12px',
        color,
      });
      if (c.completed) {
        this.add.text(leftX + 160, rowY, `+${c.xpReward} XP`, {
          fontSize: '12px',
          color: '#44cc44',
        }).setOrigin(1, 0);
      }
      rowY += 20;
    });

    // Total XP
    rowY += 10;
    this.add.rectangle(leftX + 40, rowY, 280, 1, 0x6666aa);
    rowY += 16;

    this.add.text(leftX - 80, rowY, 'TOTAL XP', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.add.text(leftX + 160, rowY, `+${total}`, {
      fontSize: '16px',
      color: '#ffcc44',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    // --- Right side: XP Bar Animation ---
    const barX = 580;
    const barY = 100;
    const barW = 280;
    const barH = 20;

    this.add.text(barX + barW / 2, barY - 20, 'PLAYER LEVEL', {
      fontSize: '14px',
      color: '#aaaacc',
      fontStyle: 'bold',
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

    // Draw XP bar background
    this.add.rectangle(barX, barY, barW, barH, 0x111133).setOrigin(0);
    this.add.rectangle(barX, barY, barW, barH, 0x000000, 0).setOrigin(0).setStrokeStyle(2, 0x4444aa);

    // Animated fill bar
    const startFill = prevXP / prevMax;
    this.xpBarFill = this.add.rectangle(barX + 2, barY + 2, (barW - 4) * startFill, barH - 4, 0x44aaff).setOrigin(0);

    // Level text
    this.levelText = this.add.text(barX + barW / 2, barY + barH / 2, `Lv.${prevLevel}`, {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.xpText = this.add.text(barX + barW / 2, barY + barH + 8, `${prevXP} / ${prevMax}`, {
      fontSize: '11px',
      color: '#8888aa',
    }).setOrigin(0.5);

    // Animate the XP bar
    this.animateXPBar(barX, barW, barH, prevLevel, prevXP, prevMax, total, levelUps);

    // Show rewards below XP bar
    let rewardY = barY + 50;
    if (rewards.length > 0) {
      this.add.text(barX + barW / 2, rewardY, 'REWARDS', {
        fontSize: '14px',
        color: '#ffcc44',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      rewardY += 24;

      rewards.forEach(r => {
        const icon = r.type === 'coins' ? 'coin' : (r.type === 'cosmetic' ? 'sparkle' : 'star');
        const color = r.type === 'coins' ? '#ddaa22' : (r.type === 'character' ? '#44aaff' : (r.type === 'level' ? '#44cc44' : '#ffaa44'));

        this.add.text(barX + barW / 2, rewardY, `Lv.${r.level}: ${r.description}`, {
          fontSize: '12px',
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
        fontSize: '13px',
        color: '#ddaa22',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    // Continue button
    const continueBtn = this.add.text(480, 490, 'CONTINUE TO MENU', {
      fontSize: '20px',
      color: '#44aaff',
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 32, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerover', () => {
      continueBtn.setColor('#88ccff');
      continueBtn.setBackgroundColor('#444466');
    });
    continueBtn.on('pointerout', () => {
      continueBtn.setColor('#44aaff');
      continueBtn.setBackgroundColor('#333355');
    });
    continueBtn.on('pointerdown', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Menu');
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Menu');
    });
  }

  animateXPBar(barX, barW, barH, startLevel, startXP, startMax, totalXP, levelUps) {
    // Simple tween animation — fill the bar over 1.5 seconds
    const endLevel = SaveSystem.level;
    const endXP = SaveSystem.xp;
    const endMax = SaveSystem.xpToNext;

    const fillW = barW - 4;

    if (levelUps.length === 0) {
      // No level up — just animate fill
      const endFill = endXP / endMax;
      this.tweens.add({
        targets: this.xpBarFill,
        width: fillW * endFill,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          this.xpText.setText(`${endXP} / ${endMax}`);
        },
      });
    } else {
      // Level up animation — fill to max, flash, then show new level
      // First fill to full
      this.tweens.add({
        targets: this.xpBarFill,
        width: fillW,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          // Flash effect
          this.cameras.main.flash(200, 255, 255, 100);
          this.sound.play('sfx_levelUp', { volume: 0.4 });

          // Reset bar and show final state
          this.xpBarFill.width = 0;
          this.levelText.setText(`Lv.${endLevel}`);
          this.xpText.setText(`${endXP} / ${endMax}`);

          this.tweens.add({
            targets: this.xpBarFill,
            width: fillW * (endXP / endMax),
            duration: 600,
            ease: 'Power2',
          });
        },
      });
    }
  }
}
