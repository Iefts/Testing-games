import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT } from '../config/GameConfig.js';
import { CHARACTERS } from '../config/Characters.js';
import { UPGRADES } from '../config/Upgrades.js';
import { TIER_COLORS } from '../systems/UpgradeManager.js';
import { InputManager } from '../systems/InputManager.js';
import { RemotePlayer } from '../entities/RemotePlayer.js';
import { DamageNumbers, DAMAGE_COLORS } from '../ui/DamageNumbers.js';

export class MultiplayerGameScene extends Phaser.Scene {
  constructor() {
    super('MultiplayerGame');
  }

  create() {
    this.network = this.game.registry.get('network');
    const startData = this.registry.get('gameStartData');

    this.gameOver = false;

    // World
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.add.tileSprite(0, 0, MAP_WIDTH, MAP_HEIGHT, 'grass').setOrigin(0, 0);

    // Trees (from server)
    this.trees = this.physics.add.staticGroup();
    if (startData.trees) {
      startData.trees.forEach((t) => {
        const tree = this.trees.create(t.x, t.y, 'tree');
        tree.body.setSize(8, 6);
        tree.body.setOffset(4, 18);
        tree.setDepth(t.y);
      });
    }

    // Pots (visual only, server handles logic)
    this.potSprites = new Map();
    if (startData.pots) {
      startData.pots.forEach((p) => {
        const pot = this.add.sprite(p.x, p.y, 'pot').setDepth(p.y);
        this.potSprites.set(p.id, pot);
      });
    }

    // Input
    this.inputManager = new InputManager(this);

    // Create local player sprite
    const myData = startData.players.find((p) => p.id === this.network.myId);
    const myChar = CHARACTERS[myData?.characterId || 'human'];
    this.localPlayer = this.add.sprite(
      myData?.x || MAP_WIDTH / 2,
      myData?.y || MAP_HEIGHT / 2,
      myChar.spriteSheet, 0
    ).setDepth(10);
    this.localAnimPrefix = myChar.animPrefix;

    // Local player health bar
    this.localHealthBg = this.add.rectangle(0, 0, 16, 2, 0x000000).setDepth(11);
    this.localHealthFill = this.add.rectangle(0, 0, 16, 2, 0x44cc44).setDepth(12);

    // Remote player
    this.remotePlayer = null;
    this.remotePlayers = new Map();

    // Enemy sprite pool
    this.enemySprites = new Map();

    // Projectile sprite pool
    this.projSprites = new Map();

    // XP gem sprite pool
    this.gemSprites = new Map();

    // Health potion sprites
    this.potionSprites = new Map();

    // Flame sprites
    this.flameSprites = new Map();

    // Tornado sprites
    this.tornadoSprites = new Map();

    // Damage numbers
    this.damageNumbers = new DamageNumbers(this);

    // Camera
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.localPlayer, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // HUD (simplified for multiplayer)
    this.createHUD();

    // Upgrade icons
    this.upgradeSlots = [];

    // Network callbacks
    this.network.onLevelUp = (msg) => this.onNetworkLevelUp(msg);
    this.network.onGameOver = (msg) => this.onNetworkGameOver(msg);
    this.network.onUpgradeApplied = (msg) => this.onNetworkUpgradeApplied(msg);

    // Pause on Escape
    this.input.keyboard.on('keydown-ESC', () => {
      // In multiplayer, ESC could show a menu but doesn't pause
    });
  }

  createHUD() {
    // Health bar
    this.hudHealthBg = this.add.rectangle(8, 8, 160, 16, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.hudHealthBar = this.add.rectangle(10, 10, 156, 12, 0xff3333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

    // XP bar
    this.hudXpBg = this.add.rectangle(8, 28, 160, 12, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.hudXpBar = this.add.rectangle(10, 30, 156, 8, 0x44aaff)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

    // Level text
    this.hudLevelText = this.add.text(174, 8, 'Lv 1', {
      fontSize: '16px', color: '#ffffff',
    }).setScrollFactor(0).setDepth(101);

    // Timer
    this.hudTimerText = this.add.text(480, 8, '20:00', {
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    // Kill count
    this.hudKillText = this.add.text(952, 8, 'Kills: 0', {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

    // Partner health bar (top right area)
    this.hudPartnerBg = this.add.rectangle(800, 8, 100, 12, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100).setVisible(false);
    this.hudPartnerBar = this.add.rectangle(802, 10, 96, 8, 0x44cc44)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101).setVisible(false);
    this.hudPartnerLabel = this.add.text(800, 22, 'P2', {
      fontSize: '10px', color: '#aaaaaa',
    }).setScrollFactor(0).setDepth(101).setVisible(false);

    // Respawn text (hidden)
    this.respawnText = this.add.text(480, 270, '', {
      fontSize: '24px', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver) return;

    // Send input
    const movement = this.inputManager.getMovementVector(
      this.localPlayer.x, this.localPlayer.y
    );
    this.network.sendInput(movement.x, movement.y);

    // Apply server state
    const state = this.network.latestState;
    if (!state) return;

    this.syncPlayers(state.p);
    this.syncEnemies(state.e);
    this.syncProjectiles(state.pr);
    this.syncGems(state.g);
    this.syncPotions(state.h);
    this.syncFlames(state.fl);
    this.syncTornados(state.tn);
    this.syncPots(state.pt);

    // Process events
    const events = this.network.drainEvents();
    this.processEvents(events);

    // Update HUD
    this.updateHUD(state);
  }

  syncPlayers(players) {
    if (!players) return;

    for (const p of players) {
      if (p.id === this.network.myId) {
        // Local player — interpolate toward server position
        this.localPlayer.x = Phaser.Math.Linear(this.localPlayer.x, p.x, 0.3);
        this.localPlayer.y = Phaser.Math.Linear(this.localPlayer.y, p.y, 0.3);
        this.localPlayer.setFlipX(p.flipX);
        this.localPlayer.setVisible(p.alive);
        this.localPlayer.setAlpha(p.inv ? 0.5 : 1);

        const animKey = p.anim === 'walk'
          ? `${this.localAnimPrefix}_walk`
          : `${this.localAnimPrefix}_idle`;
        if (this.localPlayer.anims.currentAnim?.key !== animKey) {
          this.localPlayer.play(animKey);
        }

        // Local health bar follows player
        this.localHealthBg.setPosition(this.localPlayer.x, this.localPlayer.y - 12);
        this.localHealthFill.setPosition(this.localPlayer.x, this.localPlayer.y - 12);
        const hpPct = p.hp / p.mhp;
        this.localHealthFill.setSize(16 * hpPct, 2);
        this.localHealthBg.setVisible(p.alive);
        this.localHealthFill.setVisible(p.alive);

        // Respawn timer
        if (!p.alive && p.rt > 0) {
          this.respawnText.setText(`Respawning in ${p.rt}s`);
          this.respawnText.setVisible(true);
        } else {
          this.respawnText.setVisible(false);
        }
      } else {
        // Remote player
        let remote = this.remotePlayers.get(p.id);
        if (!remote) {
          remote = new RemotePlayer(this, p.x, p.y, p.ch);
          remote.setPlayerName('P2');
          this.remotePlayers.set(p.id, remote);
        }
        remote.syncFromServer(p);
      }
    }
  }

  syncEnemies(enemies) {
    if (!enemies) return;

    const activeIds = new Set();
    for (const [id, x, y, hpPct] of enemies) {
      activeIds.add(id);
      let sprite = this.enemySprites.get(id);
      if (!sprite) {
        sprite = this.add.sprite(x, y, 'slime').setDepth(5);
        if (sprite.anims.animationManager.exists('slime_walk')) {
          sprite.play('slime_walk');
        }
        this.enemySprites.set(id, sprite);
      }
      sprite.x = Phaser.Math.Linear(sprite.x, x, 0.3);
      sprite.y = Phaser.Math.Linear(sprite.y, y, 0.3);
      sprite.setVisible(true);
    }

    // Remove stale enemies
    for (const [id, sprite] of this.enemySprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.enemySprites.delete(id);
      }
    }
  }

  syncProjectiles(projectiles) {
    if (!projectiles) return;

    const activeIds = new Set();
    for (const [id, type, x, y, rotation] of projectiles) {
      activeIds.add(id);
      let sprite = this.projSprites.get(id);
      if (!sprite) {
        const key = type === 'unicorn' ? 'unicorn' : type === 'dart' ? 'dart' : 'bullet';
        sprite = this.add.sprite(x, y, key).setDepth(15);
        if (type === 'unicorn') sprite.setScale(2);
        this.projSprites.set(id, sprite);
      }
      sprite.x = x;
      sprite.y = y;
      sprite.setRotation(rotation || 0);
    }

    for (const [id, sprite] of this.projSprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.projSprites.delete(id);
      }
    }
  }

  syncGems(gems) {
    if (!gems) return;

    const activeIds = new Set();
    for (const [id, x, y] of gems) {
      activeIds.add(id);
      let sprite = this.gemSprites.get(id);
      if (!sprite) {
        sprite = this.add.sprite(x, y, 'xpGem').setDepth(4);
        this.gemSprites.set(id, sprite);
      }
      sprite.x = Phaser.Math.Linear(sprite.x, x, 0.4);
      sprite.y = Phaser.Math.Linear(sprite.y, y, 0.4);
    }

    for (const [id, sprite] of this.gemSprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.gemSprites.delete(id);
      }
    }
  }

  syncPotions(potions) {
    if (!potions) return;

    const activeIds = new Set();
    for (const [id, x, y] of potions) {
      activeIds.add(id);
      let sprite = this.potionSprites.get(id);
      if (!sprite) {
        sprite = this.add.sprite(x, y, 'healthPotion').setDepth(5);
        this.potionSprites.set(id, sprite);
      }
    }

    for (const [id, sprite] of this.potionSprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.potionSprites.delete(id);
      }
    }
  }

  syncFlames(flames) {
    if (!flames) return;

    const activeIds = new Set();
    for (const [id, x, y] of flames) {
      activeIds.add(id);
      let sprite = this.flameSprites.get(id);
      if (!sprite) {
        sprite = this.add.sprite(x, y, 'bullet').setDepth(3).setTint(0xff6600).setScale(1.5);
        this.flameSprites.set(id, sprite);
      }
    }

    for (const [id, sprite] of this.flameSprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.flameSprites.delete(id);
      }
    }
  }

  syncTornados(tornados) {
    if (!tornados) return;

    const activeIds = new Set();
    for (const [id, x, y] of tornados) {
      activeIds.add(id);
      let sprite = this.tornadoSprites.get(id);
      if (!sprite) {
        sprite = this.add.sprite(x, y, 'tornado').setDepth(15);
        this.tornadoSprites.set(id, sprite);
      }
      sprite.x = Phaser.Math.Linear(sprite.x, x, 0.3);
      sprite.y = Phaser.Math.Linear(sprite.y, y, 0.3);
    }

    for (const [id, sprite] of this.tornadoSprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.tornadoSprites.delete(id);
      }
    }
  }

  syncPots(pots) {
    if (!pots) return;

    const activeIds = new Set();
    for (const [id, x, y] of pots) {
      activeIds.add(id);
      let sprite = this.potSprites.get(id);
      if (sprite) {
        sprite.setPosition(x, y);
        sprite.setVisible(true);
      }
    }

    for (const [id, sprite] of this.potSprites) {
      if (!activeIds.has(id)) {
        sprite.setVisible(false);
      }
    }
  }

  processEvents(events) {
    for (const event of events) {
      switch (event.type) {
        case 'damage':
          if (this.damageNumbers) {
            // Find enemy position
            const enemy = this.enemySprites.get(event.targetId);
            if (enemy) {
              this.damageNumbers.show(enemy.x, enemy.y, event.amount, event.color || '#ffffff');
            }
          }
          break;

        case 'enemyDeath': {
          // Death particles
          const particles = this.add.particles(event.x, event.y, 'bullet', {
            speed: { min: 30, max: 80 },
            scale: { start: 1.5, end: 0 },
            lifespan: 300,
            quantity: 5,
            tint: 0x44cc44,
            emitting: false,
          });
          particles.explode();
          this.time.delayedCall(400, () => particles.destroy());
          this.sound.play('sfx_enemyDeath', { volume: 0.25 });
          break;
        }

        case 'playerHit':
          if (event.playerId === this.network.myId) {
            this.damageNumbers.show(this.localPlayer.x, this.localPlayer.y, event.amount, DAMAGE_COLORS.enemy);
            this.sound.play('sfx_playerHit', { volume: 0.1 });
            this.cameras.main.shake(80, 0.002);
          } else {
            const remote = this.remotePlayers.get(event.playerId);
            if (remote) {
              this.damageNumbers.show(remote.x, remote.y, event.amount, DAMAGE_COLORS.enemy);
            }
          }
          break;

        case 'playerDeath':
          this.sound.play('sfx_playerHit', { volume: 0.3 });
          break;

        case 'playerRespawn':
          this.sound.play('sfx_healthPickup', { volume: 0.3 });
          break;

        case 'weaponFired':
          if (event.weaponType === 'revolver') {
            this.sound.play('sfx_shoot', { volume: 0.3 });
          } else if (event.weaponType === 'rapier') {
            this.sound.play('sfx_rapier', { volume: 0.25 });
          } else if (event.weaponType === 'piercingDart') {
            this.sound.play('sfx_dartFire', { volume: 0.25 });
          }
          break;

        case 'potBreak': {
          const particles = this.add.particles(event.x, event.y, 'bullet', {
            speed: { min: 20, max: 60 },
            scale: { start: 1, end: 0 },
            lifespan: 250,
            quantity: 4,
            tint: 0xcc7744,
            emitting: false,
          });
          particles.explode();
          this.time.delayedCall(300, () => particles.destroy());
          this.sound.play('sfx_potBreak', { volume: 0.25 });
          break;
        }

        case 'healthPickup':
          if (event.playerId === this.network.myId) {
            this.damageNumbers.show(this.localPlayer.x, this.localPlayer.y, event.amount, '#44ff44');
          }
          this.sound.play('sfx_healthPickup', { volume: 0.3 });
          break;

        case 'spearImpact': {
          const particles = this.add.particles(event.x, event.y, 'bullet', {
            speed: { min: 20, max: 50 },
            scale: { start: 1, end: 0 },
            lifespan: 200,
            quantity: 3,
            tint: 0xcc8844,
            emitting: false,
          });
          particles.explode();
          this.time.delayedCall(250, () => particles.destroy());
          break;
        }

        case 'gemCollected':
          this.sound.play('sfx_xpPickup', { volume: 0.2 });
          break;
      }
    }
  }

  updateHUD(state) {
    // Find my player data
    const me = state.p?.find((p) => p.id === this.network.myId);
    const partner = state.p?.find((p) => p.id !== this.network.myId);

    if (me) {
      const healthPct = me.hp / me.mhp;
      this.hudHealthBar.setSize(156 * Math.max(0, healthPct), 12);
      if (healthPct > 0.5) this.hudHealthBar.setFillStyle(0x44cc44);
      else if (healthPct > 0.25) this.hudHealthBar.setFillStyle(0xffaa00);
      else this.hudHealthBar.setFillStyle(0xff3333);

      // XP progress
      const xpNeeded = 10 * me.level * (me.level + 1) / 2;
      const xpProgress = xpNeeded > 0 ? me.xp / xpNeeded : 0;
      this.hudXpBar.setSize(156 * Math.min(1, xpProgress), 8);
      this.hudLevelText.setText(`Lv ${me.level}`);

      // Update upgrade icons
      if (me.upgrades) {
        this.updateUpgradeIcons(me.upgrades);
      }
    }

    if (partner) {
      this.hudPartnerBg.setVisible(true);
      this.hudPartnerBar.setVisible(true);
      this.hudPartnerLabel.setVisible(true);
      const pHpPct = partner.hp / partner.mhp;
      this.hudPartnerBar.setSize(96 * Math.max(0, pHpPct), 8);
      if (pHpPct > 0.5) this.hudPartnerBar.setFillStyle(0x44cc44);
      else if (pHpPct > 0.25) this.hudPartnerBar.setFillStyle(0xffaa00);
      else this.hudPartnerBar.setFillStyle(0xff3333);

      if (!partner.alive) {
        this.hudPartnerLabel.setText(`P2 (dead - ${partner.rt}s)`);
      } else {
        this.hudPartnerLabel.setText('P2');
      }
    }

    // Timer
    const remaining = state.tm || 0;
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    this.hudTimerText.setText(
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    );

    // Kill count
    this.hudKillText.setText(`Kills: ${state.k || 0}`);
  }

  updateUpgradeIcons(acquired) {
    // Destroy old
    this.upgradeSlots.forEach((slot) => {
      slot.border.destroy();
      slot.icon.destroy();
    });
    this.upgradeSlots = [];

    const startX = 10;
    const startY = 48;
    const size = 20;
    const gap = 4;
    let idx = 0;

    Object.keys(acquired).forEach((id) => {
      const level = acquired[id];
      if (level <= 0) return;
      const upgrade = UPGRADES[id];
      if (!upgrade) return;

      const x = startX + idx * (size + gap);
      const tierColor = TIER_COLORS[level - 1] || TIER_COLORS[4];

      const border = this.add.rectangle(x, startY, size, size, 0x111122)
        .setOrigin(0, 0).setStrokeStyle(2, tierColor)
        .setScrollFactor(0).setDepth(100);

      const icon = this.add.sprite(x + size / 2, startY + size / 2, upgrade.icon)
        .setScrollFactor(0).setDepth(101).setScale(2);

      this.upgradeSlots.push({ border, icon });
      idx++;
    });
  }

  onNetworkLevelUp(msg) {
    if (msg.playerId !== this.network.myId) return;

    // Launch LevelUp overlay
    this.scene.launch('LevelUp', {
      upgrades: msg.choices,
      onSelect: (selected) => {
        this.network.sendSelectUpgrade(selected.id, selected.isRare || false);
      },
    });
  }

  onNetworkUpgradeApplied(msg) {
    this.sound.play('sfx_upgradeSelect', { volume: 0.4 });
  }

  onNetworkGameOver(msg) {
    this.gameOver = true;
    this.time.delayedCall(1000, () => {
      this.network.disconnect();
      this.scene.start('GameOver', {
        victory: msg.victory,
        stats: msg.stats,
      });
    });
  }
}

