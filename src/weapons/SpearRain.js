import Phaser from 'phaser';

export class SpearRain {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.spearCount = stats.spearCount;
    this.damage = stats.damage;
    this.cooldown = stats.cooldown;
    this.lastFired = 0;
    this.fallSpeed = 400;
    this.isEvolved = false;

    this.spears = scene.physics.add.group({
      maxSize: 60,
    });
  }

  updateStats(stats) {
    this.spearCount = stats.spearCount;
    this.damage = stats.damage;
    this.cooldown = stats.cooldown;
  }

  evolve() {
    this.isEvolved = true;
    this.fallSpeed = 560;
  }

  update(time, enemies) {
    if (time < this.lastFired + this.cooldown) return;
    this.lastFired = time;
    this.rain(enemies);
  }

  rain(enemies) {
    const cam = this.scene.cameras.main;
    const targets = [];

    // Collect all on-screen enemies
    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const sx = (enemy.x - cam.worldView.x) * cam.zoom;
      const sy = (enemy.y - cam.worldView.y) * cam.zoom;
      if (sx >= 0 && sx <= cam.width && sy >= 0 && sy <= cam.height) {
        targets.push(enemy);
      }
    });

    // Only fire if there are enemies on screen
    if (targets.length === 0) return;

    // Prioritize enemies closest to the player
    const px = this.player.x;
    const py = this.player.y;
    targets.sort((a, b) => {
      const da = (a.x - px) ** 2 + (a.y - py) ** 2;
      const db = (b.x - px) ** 2 + (b.y - py) ** 2;
      return da - db;
    });

    this.scene.sound.play('sfx_spearRain', { volume: 0.35 });

    for (let i = 0; i < this.spearCount; i++) {
      // Cycle through targets so every spear hits an enemy
      const target = targets[i % targets.length];

      this.scene.time.delayedCall(i * 100, () => {
        if (target.active) {
          this.spawnSpear(target.x, target.y, cam);
        }
      });
    }
  }

  spawnSpear(x, targetY, cam) {
    const startY = targetY - 60;
    const spear = this.spears.get(x, startY, 'spear');
    if (!spear) return;

    spear.setActive(true);
    spear.setVisible(true);
    spear.body.enable = true;
    spear.body.setAllowGravity(false);
    spear.setVelocity(0, this.fallSpeed);
    spear.damage = this.damage;
    spear.hasHit = false;

    if (this.isEvolved) {
      spear.setTint(0xaaddff);
      spear.setScale(1.3);
      // Lightning streak above the spear
      const bolt = this.scene.add.rectangle(x, startY - 30, 2, 60, 0xaaeeff, 0.8).setDepth(12);
      this.scene.tweens.add({
        targets: bolt,
        alpha: 0,
        duration: 200,
        onComplete: () => bolt.destroy(),
      });
      // Lightning flash at spawn
      const flash = this.scene.add.circle(x, startY, 14, 0xffffff, 0.9).setDepth(12);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2.5,
        duration: 250,
        onComplete: () => flash.destroy(),
      });
    }

    // Destroy when below camera
    this.scene.time.delayedCall(2000, () => {
      if (spear.active) {
        spear.setActive(false);
        spear.setVisible(false);
        spear.body.enable = false;
      }
    });
  }

  lightningBurst(x, y, enemies) {
    const radius = 40;
    const gfx = this.scene.add.circle(x, y, radius, 0xaaeeff, 0.5).setDepth(11);
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      scale: 1.4,
      duration: 250,
      onComplete: () => gfx.destroy(),
    });
    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) > radius) return;
      const bonus = Math.floor(this.damage * 0.4);
      enemy.takeDamage(bonus);
      if (this.scene.damageNumbers) {
        this.scene.damageNumbers.show(enemy.x, enemy.y, bonus, '#ffffff');
      }
    });
    if (this.scene.boss && this.scene.boss.active && this.scene.hitBoss) {
      if (Phaser.Math.Distance.Between(x, y, this.scene.boss.x, this.scene.boss.y) <= radius) {
        this.scene.hitBoss(Math.floor(this.damage * 0.4), '#aaeeff');
      }
    }
  }

  setupCollision(enemies) {
    this.scene.physics.add.overlap(
      this.spears,
      enemies,
      (spear, enemy) => {
        if (!spear.active || !enemy.active || spear.hasHit) return;
        spear.hasHit = true;
        enemy.takeDamage(spear.damage);
        if (this.scene.damageNumbers) {
          this.scene.damageNumbers.show(enemy.x, enemy.y, spear.damage, this.isEvolved ? '#aaeeff' : '#cc8844');
        }

        // Evolution: lightning AoE at impact
        if (this.isEvolved) {
          this.lightningBurst(enemy.x, enemy.y, enemies);
        }

        // Spear sticks (stops and fades out)
        spear.setVelocity(0, 0);
        this.scene.tweens.add({
          targets: spear,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            spear.setActive(false);
            spear.setVisible(false);
            spear.body.enable = false;
            spear.alpha = 1;
          },
        });
      }
    );
  }
}
