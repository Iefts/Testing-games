import Phaser from 'phaser';

export class BugSwarm {
  constructor(scene, player, stats) {
    this.scene = scene;
    this.player = player;
    this.swarmCount = stats.swarmCount;
    this.bugsPerSwarm = stats.bugsPerSwarm;
    this.damage = stats.damage;
    this.speed = stats.speed;

    this.swarms = []; // array of swarm objects
    this.damageTickRate = 400; // ms between damage ticks per swarm
  }

  updateStats(stats) {
    this.swarmCount = stats.swarmCount;
    this.bugsPerSwarm = stats.bugsPerSwarm;
    this.damage = stats.damage;
    this.speed = stats.speed;

    // Add new swarms if swarmCount increased
    while (this.swarms.length < this.swarmCount) {
      this.createSwarm();
    }
    // Update existing swarms' bug counts
    this.swarms.forEach((swarm) => {
      this.adjustBugCount(swarm);
    });
  }

  update(time, enemies) {
    // Ensure we have the right number of swarms
    while (this.swarms.length < this.swarmCount) {
      this.createSwarm();
    }

    // Collect active enemies
    const activeEnemies = enemies.getChildren().filter((e) => e.active);

    // Assign unique targets — no two swarms target the same enemy
    const assignedTargets = new Set();

    this.swarms.forEach((swarm) => {
      // Check if current target is still valid
      if (swarm.target && swarm.target.active && !assignedTargets.has(swarm.target)) {
        assignedTargets.add(swarm.target);
      } else {
        swarm.target = null;
      }
    });

    // Reassign swarms without targets
    this.swarms.forEach((swarm) => {
      if (swarm.target) return;

      // Find nearest unassigned enemy to the player
      let best = null;
      let bestDist = Infinity;
      for (const enemy of activeEnemies) {
        if (assignedTargets.has(enemy)) continue;
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          enemy.x, enemy.y
        );
        if (dist < bestDist) {
          best = enemy;
          bestDist = dist;
        }
      }

      if (best) {
        swarm.target = best;
        assignedTargets.add(best);
      }
    });

    // Move bugs toward their targets
    this.swarms.forEach((swarm) => {
      if (!swarm.target || !swarm.target.active) {
        // Idle: bugs orbit around player
        this.orbitPlayer(swarm, time);
        return;
      }

      const target = swarm.target;

      swarm.bugs.forEach((bug, i) => {
        if (!bug.active) return;

        // Each bug has a slight offset from the target for swarm feel
        const offsetAngle = (time * 0.003 + i * (Math.PI * 2 / swarm.bugs.length));
        const offsetDist = 6 + Math.sin(time * 0.005 + i) * 3;
        const destX = target.x + Math.cos(offsetAngle) * offsetDist;
        const destY = target.y + Math.sin(offsetAngle) * offsetDist;

        const angle = Phaser.Math.Angle.Between(bug.x, bug.y, destX, destY);
        const dist = Phaser.Math.Distance.Between(bug.x, bug.y, destX, destY);

        // Move faster when far, slow down near target
        const spd = Math.min(this.speed, dist * 3);
        bug.setVelocity(
          Math.cos(angle) * spd,
          Math.sin(angle) * spd
        );
      });

      // Damage tick
      const now = time;
      if (now - swarm.lastDamageTick >= this.damageTickRate) {
        // Check if any bug is close enough to the target
        const anyClose = swarm.bugs.some((bug) => {
          if (!bug.active) return false;
          return Phaser.Math.Distance.Between(bug.x, bug.y, target.x, target.y) < 16;
        });
        if (anyClose && target.active) {
          target.takeDamage(this.damage);
          swarm.lastDamageTick = now;
        }
      }
    });
  }

  orbitPlayer(swarm, time) {
    swarm.bugs.forEach((bug, i) => {
      if (!bug.active) return;
      const angle = time * 0.002 + i * (Math.PI * 2 / swarm.bugs.length) + swarm.orbitOffset;
      const radius = 30 + Math.sin(time * 0.003 + i) * 5;
      const destX = this.player.x + Math.cos(angle) * radius;
      const destY = this.player.y + Math.sin(angle) * radius;

      const moveAngle = Phaser.Math.Angle.Between(bug.x, bug.y, destX, destY);
      const dist = Phaser.Math.Distance.Between(bug.x, bug.y, destX, destY);
      const spd = Math.min(this.speed, dist * 4);
      bug.setVelocity(
        Math.cos(moveAngle) * spd,
        Math.sin(moveAngle) * spd
      );
    });
  }

  createSwarm() {
    const swarm = {
      bugs: [],
      target: null,
      lastDamageTick: 0,
      orbitOffset: Math.random() * Math.PI * 2,
    };

    for (let i = 0; i < this.bugsPerSwarm; i++) {
      const offsetX = Phaser.Math.Between(-15, 15);
      const offsetY = Phaser.Math.Between(-15, 15);
      const bugKey = Math.random() < 0.5 ? 'bug_light' : 'bug_dark';
      const bug = this.scene.physics.add.sprite(
        this.player.x + offsetX,
        this.player.y + offsetY,
        bugKey
      );
      bug.body.setAllowGravity(false);
      bug.setDepth(4);
      swarm.bugs.push(bug);
    }

    this.swarms.push(swarm);
  }

  adjustBugCount(swarm) {
    while (swarm.bugs.length < this.bugsPerSwarm) {
      const offsetX = Phaser.Math.Between(-15, 15);
      const offsetY = Phaser.Math.Between(-15, 15);
      const bugKey = Math.random() < 0.5 ? 'bug_light' : 'bug_dark';
      const bug = this.scene.physics.add.sprite(
        this.player.x + offsetX,
        this.player.y + offsetY,
        bugKey
      );
      bug.body.setAllowGravity(false);
      bug.setDepth(4);
      swarm.bugs.push(bug);
    }
  }

  setupCollision(enemies) {
    // Damage is handled manually in update() via distance checks
    // No physics overlap needed
  }
}
