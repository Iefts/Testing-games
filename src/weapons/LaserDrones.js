import Phaser from 'phaser';

export class LaserDrones {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    // Stats
    this.damage = 20;
    this.fireRate = 2000;
    this.range = 170;
    this.pierceCount = 1;

    this.lastFire = 0;
    this.lastDroneFired = 0; // alternate between drones

    // Create two drone sprites
    this.droneLeft = scene.add.sprite(player.x - 16, player.y, 'drone').setScale(2).setDepth(50);
    this.droneRight = scene.add.sprite(player.x + 16, player.y, 'drone').setScale(2).setDepth(50);

    // Floating bob offset
    this._bobTime = 0;

    // Laser graphics (drawn as lines, not sprites)
    this.laserGraphics = scene.add.graphics().setDepth(49);

    // Active laser beams for visual display
    this._activeBeams = [];

    // Keep drones following player
    scene.events.on('postupdate', () => {
      this._bobTime += 0.05;
      const bobY = Math.sin(this._bobTime) * 2;
      const bobYR = Math.sin(this._bobTime + Math.PI) * 2;

      this.droneLeft.setPosition(
        this.player.x - 18,
        this.player.y - 4 + bobY
      );
      this.droneRight.setPosition(
        this.player.x + 18,
        this.player.y - 4 + bobYR
      );
    });
  }

  update(time, enemies) {
    // Clear old laser beams
    this.laserGraphics.clear();
    this._activeBeams = this._activeBeams.filter(beam => {
      return time - beam.startTime < 80;
    });

    // Draw active beams
    this._activeBeams.forEach(beam => {
      const alpha = 1 - (time - beam.startTime) / 80;
      // Outer glow
      this.laserGraphics.lineStyle(4, 0xff2222, alpha * 0.3);
      this.laserGraphics.beginPath();
      this.laserGraphics.moveTo(beam.sx, beam.sy);
      this.laserGraphics.lineTo(beam.ex, beam.ey);
      this.laserGraphics.strokePath();
      // Core beam
      this.laserGraphics.lineStyle(2, 0xff4444, alpha * 0.8);
      this.laserGraphics.beginPath();
      this.laserGraphics.moveTo(beam.sx, beam.sy);
      this.laserGraphics.lineTo(beam.ex, beam.ey);
      this.laserGraphics.strokePath();
      // Bright center
      this.laserGraphics.lineStyle(1, 0xffaaaa, alpha);
      this.laserGraphics.beginPath();
      this.laserGraphics.moveTo(beam.sx, beam.sy);
      this.laserGraphics.lineTo(beam.ex, beam.ey);
      this.laserGraphics.strokePath();
    });

    if (time < this.lastFire + this.fireRate) return;

    // Find nearest enemy in range
    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    this.lastFire = time;
    this.lastDroneFired = 1 - this.lastDroneFired;

    // Pick which drone fires
    const drone = this.lastDroneFired === 0 ? this.droneLeft : this.droneRight;

    this.fireLaser(drone, target, time, enemies);
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let nearestDist = this.range;
    const cam = this.scene.cameras.main;

    enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      // Only target on-screen enemies
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

    // Also consider boss as a target
    if (this.scene.boss && this.scene.boss.active) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.scene.boss.x, this.scene.boss.y
      );
      if (dist < nearestDist) {
        nearest = this.scene.boss;
        nearestDist = dist;
      }
    }

    return nearest;
  }

  fireLaser(drone, target, time, enemies) {
    const angle = Phaser.Math.Angle.Between(
      drone.x, drone.y,
      target.x, target.y
    );

    // Cast a ray from drone toward target, hitting up to pierceCount enemies
    const maxDist = this.range;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Collect enemies along the beam path
    const hitEnemies = [];
    const targets = [...enemies.getChildren()];
    if (this.scene.boss && this.scene.boss.active) targets.push(this.scene.boss);
    targets.forEach((enemy) => {
      if (!enemy.active) return;

      const dx = enemy.x - drone.x;
      const dy = enemy.y - drone.y;
      const projection = dx * cosA + dy * sinA;
      if (projection < 0 || projection > maxDist) return;

      const perpDist = Math.abs(dx * sinA - dy * cosA);
      if (perpDist <= 10) {
        hitEnemies.push({ enemy, dist: projection });
      }
    });

    // Sort by distance and pierce through N enemies
    hitEnemies.sort((a, b) => a.dist - b.dist);
    const maxHits = this.pierceCount;
    let lastHitDist = maxDist;

    for (let i = 0; i < Math.min(hitEnemies.length, maxHits); i++) {
      const { enemy, dist } = hitEnemies[i];
      if (enemy.isBoss && this.scene.hitBoss) {
        this.scene.hitBoss(this.damage, '#ff4444');
      } else if (enemy.takeDamage) {
        enemy.takeDamage(this.damage);
      }
      if (this.scene.damageNumbers) {
        this.scene.damageNumbers.show(enemy.x, enemy.y, this.damage, '#ff4444');
      }
      lastHitDist = dist;
    }

    // Beam end point
    const beamLength = hitEnemies.length > 0 ? Math.min(lastHitDist + 15, maxDist) : maxDist;
    const endX = drone.x + cosA * beamLength;
    const endY = drone.y + sinA * beamLength;

    // Store beam for visual rendering
    this._activeBeams.push({
      sx: drone.x, sy: drone.y,
      ex: endX, ey: endY,
      startTime: time,
    });

    this.scene.sound.play('sfx_laserZap', { volume: 0.15 });

    // Impact flash at hit points
    hitEnemies.slice(0, maxHits).forEach(({ enemy }) => {
      const flash = this.scene.add.circle(enemy.x, enemy.y, 4, 0xff4444, 0.8).setDepth(55);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2,
        duration: 120,
        onComplete: () => flash.destroy(),
      });
    });
  }

  setupCollision(enemies) {
    this.enemyGroup = enemies;
    // Laser damage is instant/line-based, no physics overlap needed
  }

  updateStats(stats) {
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.range = stats.range;
    this.pierceCount = stats.pierceCount;
  }
}
