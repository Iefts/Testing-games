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

    this.spears = scene.physics.add.group({
      maxSize: 30,
    });
  }

  updateStats(stats) {
    this.spearCount = stats.spearCount;
    this.damage = stats.damage;
    this.cooldown = stats.cooldown;
  }

  update(time, enemies) {
    if (time < this.lastFired + this.cooldown) return;
    this.lastFired = time;
    this.rain(enemies);
  }

  rain(enemies) {
    const cam = this.scene.cameras.main;
    const targets = [];

    // Pick on-screen enemies as targets
    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const sx = (enemy.x - cam.worldView.x) * cam.zoom;
      const sy = (enemy.y - cam.worldView.y) * cam.zoom;
      if (sx >= 0 && sx <= cam.width && sy >= 0 && sy <= cam.height) {
        targets.push({ x: enemy.x, y: enemy.y });
      }
    });

    // Shuffle targets
    Phaser.Utils.Array.Shuffle(targets);

    this.scene.sound.play('sfx_spearRain', { volume: 0.35 });

    for (let i = 0; i < this.spearCount; i++) {
      let targetX;
      if (i < targets.length) {
        // Aim at an enemy with slight random offset
        targetX = targets[i].x + Phaser.Math.Between(-15, 15);
      } else {
        // Random position on screen
        targetX = cam.worldView.x + Phaser.Math.Between(20, cam.worldView.width - 20);
      }

      // Stagger spawn timing slightly
      this.scene.time.delayedCall(i * 100, () => {
        this.spawnSpear(targetX, cam);
      });
    }
  }

  spawnSpear(x, cam) {
    const startY = cam.worldView.y - 20;
    const spear = this.spears.get(x, startY, 'spear');
    if (!spear) return;

    spear.setActive(true);
    spear.setVisible(true);
    spear.body.enable = true;
    spear.body.setAllowGravity(false);
    spear.setVelocity(0, this.fallSpeed);
    spear.damage = this.damage;
    spear.hasHit = false;

    // Destroy when below camera
    this.scene.time.delayedCall(2000, () => {
      if (spear.active) {
        spear.setActive(false);
        spear.setVisible(false);
        spear.body.enable = false;
      }
    });
  }

  setupCollision(enemies) {
    this.scene.physics.add.overlap(
      this.spears,
      enemies,
      (spear, enemy) => {
        if (!spear.active || !enemy.active || spear.hasHit) return;
        spear.hasHit = true;
        enemy.takeDamage(spear.damage);

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
