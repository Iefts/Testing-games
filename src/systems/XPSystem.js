import Phaser from 'phaser';

export class XPSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.xp = 0;
    this.level = 1;
    this.magnetRadius = 100;

    // XP gem group
    this.gems = scene.physics.add.group();

    // Listen for enemy kills to spawn gems
    scene.events.on('enemyKilled', this.onEnemyKilled, this);
  }

  xpForLevel(level) {
    return 10 * level * (level + 1) / 2;
  }

  get xpToNextLevel() {
    return this.xpForLevel(this.level);
  }

  get xpProgress() {
    return this.xp / this.xpToNextLevel;
  }

  onEnemyKilled(enemy) {
    // Spawn XP gem at enemy position
    const gem = this.gems.get(enemy.x, enemy.y, 'xpGem');
    if (!gem) return;

    gem.setActive(true);
    gem.setVisible(true);
    gem.body.enable = true;
    gem.xpValue = enemy.xpValue;
    gem.body.setAllowGravity(false);
    gem.setVelocity(0, 0);
  }

  update() {
    // Attract gems toward player when in range
    this.gems.getChildren().forEach((gem) => {
      if (!gem.active) return;

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        gem.x, gem.y
      );

      if (dist < this.magnetRadius) {
        // Move toward player
        const angle = Phaser.Math.Angle.Between(
          gem.x, gem.y,
          this.player.x, this.player.y
        );
        const speed = 200;
        gem.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
      }

      // Collect when very close
      if (dist < 20) {
        this.collectGem(gem);
      }
    });
  }

  collectGem(gem) {
    this.xp += gem.xpValue;
    gem.setActive(false);
    gem.setVisible(false);
    gem.body.enable = false;

    this.scene.sound.play('sfx_xpPickup', { volume: 0.2 });

    // Check for level up
    if (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.scene.sound.play('sfx_levelUp', { volume: 0.4 });
      this.scene.events.emit('levelUp', this.level);
    }
  }
}
