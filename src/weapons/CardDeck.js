import Phaser from 'phaser';

const SUITS = ['heart', 'spade', 'diamond', 'club'];
const JOKER_CHANCE = 0.05;

export class CardDeck {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.speed = stats.speed;
    this.range = stats.range || 300;
    this.diamondBonusXP = stats.diamondBonusXP || 2;
    this.lastFired = 0;
    this.isEvolved = false;

    this.cards = scene.physics.add.group({ maxSize: 60 });

    // Track AoE zones for heart/club
    this.aoeZones = [];
  }

  evolve() {
    this.isEvolved = true;
  }

  updateStats(stats) {
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.speed = stats.speed;
    this.range = stats.range || this.range;
    this.diamondBonusXP = stats.diamondBonusXP || this.diamondBonusXP;
  }

  update(time, enemies) {
    if (time < this.lastFired + this.fireRate) return;

    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    this.fire(target, time);
    this.lastFired = time;

    // Clean up expired AoE zones
    this.cleanupAoE(time);
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let nearestDist = this.range;
    const cam = this.scene.cameras.main;

    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const sx = (enemy.x - cam.worldView.x) * cam.zoom;
      const sy = (enemy.y - cam.worldView.y) * cam.zoom;
      if (sx < -16 || sx > cam.width + 16 || sy < -16 || sy > cam.height + 16) return;

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      if (dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    });
    return nearest;
  }

  fire(target, time) {
    // Royal Flush — fan out all four suits simultaneously plus a joker.
    if (this.isEvolved) {
      const baseAngle = Phaser.Math.Angle.Between(
        this.player.x, this.player.y, target.x, target.y
      );
      const suits = ['heart', 'spade', 'diamond', 'club', 'joker'];
      const spread = 0.35; // ~20deg between each
      suits.forEach((suit, i) => {
        const offset = (i - (suits.length - 1) / 2) * spread;
        this.spawnCard(suit, baseAngle + offset, time, suit === 'joker');
      });
      this.scene.sound.play('sfx_cardThrow', { volume: 0.3 });
      return;
    }

    // Pick a suit (5% joker chance)
    const isJoker = Math.random() < JOKER_CHANCE;
    // Diamond is much rarer than other suits
    // Weights: heart=1, spade=1, diamond=0.3, club=1 → total 3.3
    let suit;
    if (isJoker) {
      suit = 'joker';
    } else {
      const roll = Math.random() * 3.3;
      if (roll < 1) suit = 'heart';
      else if (roll < 2) suit = 'spade';
      else if (roll < 2.3) suit = 'diamond';
      else suit = 'club';
    }

    const textureKey = `card_${suit}`;
    const card = this.cards.get(this.player.x, this.player.y, textureKey);
    if (!card) return;

    card.setActive(true);
    card.setVisible(true);
    card.body.enable = true;
    card.body.setAllowGravity(false);
    card.suit = suit;
    card.cardDamage = this.getDamageForSuit(suit);
    card.hitEnemies = new Set();
    card.isJoker = isJoker;
    card.bounces = isJoker ? 5 : 0;
    card.diamondBonusXP = this.diamondBonusXP;
    card.fireId = time + Math.random();

    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );
    card.setRotation(angle);
    card.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );

    // Spin animation
    this.scene.tweens.add({
      targets: card,
      angle: card.angle + 720,
      duration: 800,
      ease: 'Linear',
    });

    // Card flair color tint
    const tints = {
      heart: 0xff4444,
      spade: 0xccccff,
      diamond: 0x44ffff,
      club: 0x44cc44,
      joker: 0xffdd00,
    };
    card.setTint(tints[suit]);

    // Trail particles
    const trailTint = tints[suit];
    const particles = this.scene.add.particles(card.x, card.y, 'bullet', {
      speed: { min: 5, max: 15 },
      scale: { start: 0.6, end: 0 },
      lifespan: 200,
      quantity: 1,
      frequency: 50,
      tint: [trailTint, 0xffffff],
      emitting: true,
    });
    card.trailParticles = particles;

    // Update trail to follow card
    const trailUpdate = this.scene.time.addEvent({
      delay: 30,
      loop: true,
      callback: () => {
        if (card.active) {
          particles.setPosition(card.x, card.y);
        }
      },
    });
    card.trailUpdate = trailUpdate;

    this.scene.sound.play('sfx_cardThrow', { volume: 0.25 });

    // Auto-destroy after range — track fireId so old timers don't kill reused cards
    const lifetime = (this.range / this.speed) * 1000;
    const currentFireId = card.fireId;
    this.scene.time.delayedCall(lifetime, () => {
      if (card.active && card.fireId === currentFireId) {
        this.recycleCard(card);
      }
    });
  }

  spawnCard(suit, angle, time, isJoker) {
    const textureKey = `card_${suit}`;
    const card = this.cards.get(this.player.x, this.player.y, textureKey);
    if (!card) return;

    card.setActive(true);
    card.setVisible(true);
    card.body.enable = true;
    card.body.setAllowGravity(false);
    card.suit = suit;
    card.cardDamage = this.getDamageForSuit(suit);
    card.hitEnemies = new Set();
    card.isJoker = !!isJoker;
    card.bounces = isJoker ? 5 : 0;
    card.diamondBonusXP = this.diamondBonusXP;
    card.fireId = time + Math.random();

    card.setRotation(angle);
    card.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );

    this.scene.tweens.add({
      targets: card,
      angle: card.angle + 720,
      duration: 800,
      ease: 'Linear',
    });

    const tints = {
      heart: 0xff4444, spade: 0xccccff, diamond: 0x44ffff, club: 0x44cc44, joker: 0xffdd00,
    };
    card.setTint(tints[suit]);

    const particles = this.scene.add.particles(card.x, card.y, 'bullet', {
      speed: { min: 5, max: 15 },
      scale: { start: 0.8, end: 0 },
      lifespan: 280,
      quantity: 1,
      frequency: 40,
      tint: [tints[suit], 0xffffff, 0xffdd88],
      emitting: true,
    });
    card.trailParticles = particles;

    const trailUpdate = this.scene.time.addEvent({
      delay: 30,
      loop: true,
      callback: () => {
        if (card.active) particles.setPosition(card.x, card.y);
      },
    });
    card.trailUpdate = trailUpdate;

    const lifetime = (this.range / this.speed) * 1000;
    const currentFireId = card.fireId;
    this.scene.time.delayedCall(lifetime, () => {
      if (card.active && card.fireId === currentFireId) this.recycleCard(card);
    });
  }

  getDamageForSuit(suit) {
    switch (suit) {
      case 'heart': return this.damage;
      case 'spade': return Math.floor(this.damage * 2.5);
      case 'diamond': return this.damage;
      case 'club': return Math.floor(this.damage * 0.6);
      case 'joker': return Math.floor(this.damage * 2);
      default: return this.damage;
    }
  }

  recycleCard(card) {
    if (!card.active) return;
    card.setActive(false);
    card.setVisible(false);
    if (card.body) card.body.enable = false;
    if (card.trailParticles) {
      card.trailParticles.destroy();
      card.trailParticles = null;
    }
    if (card.trailUpdate) {
      card.trailUpdate.destroy();
      card.trailUpdate = null;
    }
  }

  onCardHitEnemy(card, enemy) {
    if (!card.active || !enemy.active) return;
    if (card.hitEnemies.has(enemy)) return;
    if (!card.body || !enemy.body) return;
    card.hitEnemies.add(enemy);

    const suit = card.suit;
    const isJoker = card.isJoker;

    // --- SPADE: High single target damage ---
    if (suit === 'spade' || isJoker) {
      enemy.takeDamage(card.cardDamage);
      if (this.scene.damageNumbers) {
        this.scene.damageNumbers.show(enemy.x, enemy.y, card.cardDamage, '#ccccff');
      }
      // Spade impact flash
      const flash = this.scene.add.circle(enemy.x, enemy.y, 12, 0xccccff, 0.7);
      flash.setDepth(10);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2,
        duration: 200,
        onComplete: () => flash.destroy(),
      });
    }

    // --- HEART: AoE damage in area ---
    if (suit === 'heart' || isJoker) {
      this.spawnHeartAoE(enemy.x, enemy.y, card.cardDamage);
    }

    // --- DIAMOND: Bonus XP on kill ---
    if (suit === 'diamond' || isJoker) {
      if (!isJoker) {
        enemy.takeDamage(card.cardDamage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, card.cardDamage, '#44ffff');
        }
      }
      // Tag enemy so bonus XP drops on death
      if (!enemy.bonusXPOrbs) enemy.bonusXPOrbs = 0;
      enemy.bonusXPOrbs += card.diamondBonusXP;
    }

    // --- CLUB: Low damage + slow in area ---
    if (suit === 'club' || isJoker) {
      this.spawnClubAoE(enemy.x, enemy.y, card.cardDamage);
    }

    // For non-special suits that haven't dealt damage yet
    if (suit !== 'spade' && suit !== 'diamond' && suit !== 'heart' && suit !== 'club' && !isJoker) {
      enemy.takeDamage(card.cardDamage);
    }

    // --- JOKER: Bounce to next enemy ---
    if (isJoker && card.bounces > 0) {
      card.bounces--;
      this.bounceToNext(card, enemy);
      return; // Don't recycle, it's bouncing
    }

    // Recycle non-joker cards or jokers that are done bouncing
    if (!isJoker || card.bounces <= 0) {
      this.recycleCard(card);
    }
  }

  bounceToNext(card, lastEnemy) {
    // Find nearest enemy that hasn't been hit
    let nearest = null;
    let nearestDist = 200;

    const enemies = this.enemies;
    if (!enemies) {
      this.recycleCard(card);
      return;
    }

    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active || card.hitEnemies.has(enemy)) return;
      const dist = Phaser.Math.Distance.Between(lastEnemy.x, lastEnemy.y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    });

    if (!nearest) {
      this.recycleCard(card);
      return;
    }

    // Redirect card toward next enemy
    const angle = Phaser.Math.Angle.Between(card.x, card.y, nearest.x, nearest.y);
    card.setVelocity(
      Math.cos(angle) * this.speed * 1.2,
      Math.sin(angle) * this.speed * 1.2
    );
    card.setRotation(angle);

    // Joker flash effect on bounce
    const flash = this.scene.add.circle(card.x, card.y, 8, 0xffdd00, 0.8);
    flash.setDepth(10);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 3,
      duration: 250,
      onComplete: () => flash.destroy(),
    });

    this.scene.sound.play('sfx_cardThrow', { volume: 0.15 });
  }

  spawnHeartAoE(x, y, damage) {
    const radius = 40;
    // Heart-shaped visual
    const gfx = this.scene.add.graphics();
    gfx.setDepth(8);

    // Draw heart shape
    gfx.fillStyle(0xff4444, 0.4);
    gfx.fillCircle(x - 10, y - 6, 12);
    gfx.fillCircle(x + 10, y - 6, 12);
    gfx.fillTriangle(x - 22, y - 2, x + 22, y - 2, x, y + 20);

    // Fade and damage
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 600,
      onComplete: () => gfx.destroy(),
    });

    // Damage all enemies in the area
    const enemies = this.enemies;
    if (!enemies) return;

    // Snapshot active enemies to avoid issues with mid-iteration kills
    const activeEnemies = enemies.getChildren().filter(e => e.active);
    activeEnemies.forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist <= radius) {
        enemy.takeDamage(damage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, damage, '#ff4444');
        }
      }
    });

    // Break pots in area
    if (this.scene.pots) {
      this.scene.pots.getChildren().filter(p => p.active).forEach((pot) => {
        if (!pot.active) return;
        const dist = Phaser.Math.Distance.Between(x, y, pot.x, pot.y);
        if (dist <= radius) {
          this.scene.breakPot(pot);
        }
      });
    }

    // Heart particles
    const particles = this.scene.add.particles(x, y, 'bullet', {
      speed: { min: 20, max: 60 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8,
      tint: [0xff4444, 0xff8888, 0xffaaaa],
      emitting: false,
    });
    particles.explode();
    this.scene.time.delayedCall(500, () => particles.destroy());
  }

  spawnClubAoE(x, y, damage) {
    const radius = 35;

    // Green poison/slow cloud visual
    const gfx = this.scene.add.graphics();
    gfx.setDepth(8);
    gfx.fillStyle(0x44cc44, 0.3);
    gfx.fillCircle(x, y, radius);
    gfx.fillStyle(0x228822, 0.2);
    gfx.fillCircle(x - 5, y + 3, radius * 0.7);

    // Slow enemies in area
    const enemies = this.enemies;
    if (!enemies) return;

    // Snapshot active enemies to avoid issues with mid-iteration kills
    const activeEnemies = enemies.getChildren().filter(e => e.active);
    activeEnemies.forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist <= radius) {
        enemy.takeDamage(damage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, damage, '#44cc44');
        }
        // Apply slow effect
        if (enemy.active && !enemy.clubSlowed) {
          enemy.clubSlowed = true;
          const origSpeed = enemy.speed;
          enemy.speed = origSpeed * 0.4;
          enemy.setTint(0x44cc44);
          // Remove slow after 2 seconds
          this.scene.time.delayedCall(2000, () => {
            if (enemy.active) {
              enemy.speed = origSpeed;
              enemy.clearTint();
              enemy.clubSlowed = false;
            }
          });
        }
      }
    });

    // Break pots in area
    if (this.scene.pots) {
      this.scene.pots.getChildren().filter(p => p.active).forEach((pot) => {
        if (!pot.active) return;
        const dist = Phaser.Math.Distance.Between(x, y, pot.x, pot.y);
        if (dist <= radius) {
          this.scene.breakPot(pot);
        }
      });
    }

    // Fade cloud
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 1500,
      onComplete: () => gfx.destroy(),
    });
  }

  cleanupAoE() {
    // AoE effects are self-cleaning via tweens, nothing needed here
  }

  setupCollision(enemies) {
    this.enemies = enemies;

    this.scene.physics.add.overlap(
      this.cards,
      enemies,
      (card, enemy) => this.onCardHitEnemy(card, enemy)
    );

    // Listen for enemy kills to drop bonus XP from diamond cards
    this.scene.events.on('enemyKilled', (enemy) => {
      if (enemy.bonusXPOrbs && enemy.bonusXPOrbs > 0 && this.scene.xpSystem && this.scene.xpSystem.gems) {
        for (let i = 0; i < enemy.bonusXPOrbs; i++) {
          const ox = enemy.x + Phaser.Math.Between(-12, 12);
          const oy = enemy.y + Phaser.Math.Between(-12, 12);
          const gem = this.scene.xpSystem.gems.get(ox, oy, 'xpGem');
          if (gem) {
            gem.setActive(true);
            gem.setVisible(true);
            if (gem.body) {
              gem.body.enable = true;
              gem.body.setAllowGravity(false);
            }
            gem.xpValue = 5;
            gem.setVelocity(
              Phaser.Math.Between(-30, 30),
              Phaser.Math.Between(-30, 30)
            );
            gem.setDepth(3);
            // Slow down
            this.scene.time.delayedCall(300, () => {
              if (gem.active) gem.setVelocity(0, 0);
            });
          }
        }
        // Cyan sparkle for diamond XP
        const sparkle = this.scene.add.particles(enemy.x, enemy.y, 'bullet', {
          speed: { min: 20, max: 50 },
          scale: { start: 0.8, end: 0 },
          lifespan: 300,
          quantity: 4,
          tint: [0x44ffff, 0xffffff],
          emitting: false,
        });
        sparkle.explode();
        this.scene.time.delayedCall(400, () => sparkle.destroy());
      }
    });
  }
}
