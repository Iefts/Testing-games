import { distance, angleBetween } from '../src/shared/GameMath.js';

export function findNearestEnemy(player, enemies, range) {
  let nearest = null;
  let nearestDist = range;
  for (const [id, enemy] of enemies) {
    if (!enemy.alive) continue;
    const dist = distance(player.x, player.y, enemy.x, enemy.y);
    if (dist < nearestDist) {
      nearest = enemy;
      nearestDist = dist;
    }
  }
  return nearest;
}

export function findNClosestEnemies(player, enemies, count) {
  const sorted = [];
  for (const [id, enemy] of enemies) {
    if (!enemy.alive) continue;
    sorted.push({ enemy, dist: distance(player.x, player.y, enemy.x, enemy.y) });
  }
  sorted.sort((a, b) => a.dist - b.dist);
  return sorted.slice(0, count).map((s) => s.enemy);
}

export function updateWeapon(player, weapon, now, room) {
  if (now < weapon.lastFired + weapon.fireRate) return;

  switch (weapon.type) {
    case 'revolver': {
      const target = findNearestEnemy(player, room.enemies, weapon.range);
      if (!target) return;
      weapon.lastFired = now;
      const angle = angleBetween(player.x, player.y, target.x, target.y);
      const projId = room.nextId++;
      room.projectiles.set(projId, {
        id: projId,
        type: 'bullet',
        ownerId: player.id,
        x: player.x, y: player.y,
        vx: Math.cos(angle) * weapon.bulletSpeed,
        vy: Math.sin(angle) * weapon.bulletSpeed,
        damage: weapon.damage,
        lifetime: (weapon.range / weapon.bulletSpeed) * 1000,
        pierce: false,
        hitEnemies: new Set(),
        rotation: angle,
      });
      room.events.push({ type: 'weaponFired', weaponType: 'revolver', playerId: player.id, angle });
      break;
    }

    case 'rapier': {
      const target = findNearestEnemy(player, room.enemies, weapon.range);
      if (!target) return;
      weapon.lastFired = now;
      const angle = angleBetween(player.x, player.y, target.x, target.y);
      const thrustRange = weapon.range * 0.3;
      for (const [eid, enemy] of room.enemies) {
        if (!enemy.alive) continue;
        const dist = distance(player.x, player.y, enemy.x, enemy.y);
        if (dist <= thrustRange + 12) {
          const eAngle = angleBetween(player.x, player.y, enemy.x, enemy.y);
          const diff = Math.abs(((angle - eAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          if (diff < Math.PI / 3) {
            enemy.hp -= weapon.damage;
            room.events.push({ type: 'damage', targetId: eid, amount: weapon.damage, color: '#dddddd' });
            if (enemy.hp <= 0) {
              killEnemy(room, eid, enemy);
            }
          }
        }
      }
      room.events.push({ type: 'weaponFired', weaponType: 'rapier', playerId: player.id, angle });
      break;
    }

    case 'piercingDart': {
      const target = findNearestEnemy(player, room.enemies, weapon.range);
      if (!target) return;
      weapon.lastFired = now;
      const angle = angleBetween(player.x, player.y, target.x, target.y);
      const projId = room.nextId++;
      room.projectiles.set(projId, {
        id: projId,
        type: 'dart',
        ownerId: player.id,
        x: player.x, y: player.y,
        vx: Math.cos(angle) * weapon.speed,
        vy: Math.sin(angle) * weapon.speed,
        damage: weapon.damage,
        lifetime: (weapon.range / weapon.speed) * 1000,
        pierce: true,
        hitEnemies: new Set(),
        rotation: angle,
      });
      room.events.push({ type: 'weaponFired', weaponType: 'piercingDart', playerId: player.id, angle });
      break;
    }

    case 'damageAura': {
      weapon.lastFired = now;
      for (const [eid, enemy] of room.enemies) {
        if (!enemy.alive) continue;
        if (distance(player.x, player.y, enemy.x, enemy.y) <= weapon.radius) {
          enemy.hp -= weapon.damage;
          room.events.push({ type: 'damage', targetId: eid, amount: weapon.damage, color: '#44aaff' });
          if (enemy.hp <= 0) {
            killEnemy(room, eid, enemy);
          }
        }
      }
      break;
    }

    case 'spearRain': {
      weapon.lastFired = now;
      const targets = findNClosestEnemies(player, room.enemies, weapon.spearCount);
      targets.forEach((target) => {
        if (!target.alive) return;
        target.hp -= weapon.damage;
        room.events.push({ type: 'spearImpact', x: target.x, y: target.y, damage: weapon.damage });
        room.events.push({ type: 'damage', targetId: target.id, amount: weapon.damage, color: '#cc8844' });
        if (target.hp <= 0) {
          killEnemy(room, target.id, target);
        }
      });
      break;
    }

    case 'unicornRider': {
      weapon.lastFired = now;
      // Sweep across from left or right through player position
      const fromLeft = Math.random() < 0.5;
      const projId = room.nextId++;
      const startX = fromLeft ? player.x - 500 : player.x + 500;
      const vx = fromLeft ? 300 : -300;
      room.projectiles.set(projId, {
        id: projId,
        type: 'unicorn',
        ownerId: player.id,
        x: startX,
        y: player.y,
        vx: vx,
        vy: 0,
        damage: weapon.damage,
        lifetime: 3500,
        pierce: true,
        hitEnemies: new Set(),
        rotation: fromLeft ? 0 : Math.PI,
      });
      room.events.push({ type: 'weaponFired', weaponType: 'unicornRider', playerId: player.id, angle: fromLeft ? 0 : Math.PI });
      break;
    }

    case 'flameTrail': {
      // Drop flame at player position if moved enough
      if (!weapon.lastX) { weapon.lastX = player.x; weapon.lastY = player.y; }
      const moved = distance(weapon.lastX, weapon.lastY, player.x, player.y);
      if (moved < 16) return;
      weapon.lastFired = now;
      weapon.lastX = player.x;
      weapon.lastY = player.y;
      const flameId = room.nextId++;
      room.flames.set(flameId, {
        id: flameId,
        x: player.x,
        y: player.y,
        damage: weapon.damage,
        lifetime: weapon.duration,
        hitCooldowns: new Map(), // enemyId -> lastHitTime
      });
      break;
    }

    case 'tornado': {
      weapon.lastFired = now;
      const tornadoId = room.nextId++;
      const angle = Math.random() * Math.PI * 2;
      room.tornados.set(tornadoId, {
        id: tornadoId,
        x: player.x + Math.cos(angle) * 40,
        y: player.y + Math.sin(angle) * 40,
        vx: Math.cos(angle) * weapon.speed,
        vy: Math.sin(angle) * weapon.speed,
        damage: weapon.damage,
        lifetime: weapon.duration,
        hitCooldowns: new Map(),
        wanderTimer: 0,
      });
      break;
    }

    case 'bugSwarm': {
      // Bug swarms are persistent — handled in updateBugSwarms
      break;
    }
  }
}

export function updateFlames(room, dt, now) {
  for (const [id, flame] of room.flames) {
    flame.lifetime -= dt * 1000;
    if (flame.lifetime <= 0) {
      room.flames.delete(id);
      continue;
    }
    for (const [eid, enemy] of room.enemies) {
      if (!enemy.alive) continue;
      if (distance(flame.x, flame.y, enemy.x, enemy.y) > 16) continue;
      const lastHit = flame.hitCooldowns.get(eid) || 0;
      if (now - lastHit < 500) continue;
      flame.hitCooldowns.set(eid, now);
      enemy.hp -= flame.damage;
      room.events.push({ type: 'damage', targetId: eid, amount: flame.damage, color: '#ff6600' });
      if (enemy.hp <= 0) {
        killEnemy(room, eid, enemy);
      }
    }
  }
}

export function updateTornados(room, dt, now) {
  for (const [id, tornado] of room.tornados) {
    tornado.lifetime -= dt * 1000;
    if (tornado.lifetime <= 0) {
      room.tornados.delete(id);
      continue;
    }
    // Wander: change direction periodically
    tornado.wanderTimer -= dt * 1000;
    if (tornado.wanderTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.sqrt(tornado.vx * tornado.vx + tornado.vy * tornado.vy);
      tornado.vx = Math.cos(angle) * speed;
      tornado.vy = Math.sin(angle) * speed;
      tornado.wanderTimer = 800 + Math.random() * 600;
    }
    tornado.x += tornado.vx * dt;
    tornado.y += tornado.vy * dt;

    for (const [eid, enemy] of room.enemies) {
      if (!enemy.alive) continue;
      if (distance(tornado.x, tornado.y, enemy.x, enemy.y) > 20) continue;
      const lastHit = tornado.hitCooldowns.get(eid) || 0;
      if (now - lastHit < 500) continue;
      tornado.hitCooldowns.set(eid, now);
      enemy.hp -= tornado.damage;
      room.events.push({ type: 'damage', targetId: eid, amount: tornado.damage, color: '#bbbbbb' });
      if (enemy.hp <= 0) {
        killEnemy(room, eid, enemy);
      }
    }
  }
}

export function updateBugSwarms(room, dt, now) {
  for (const [playerId, player] of room.players) {
    if (!player.alive) continue;
    for (const weapon of player.weapons) {
      if (weapon.type !== 'bugSwarm') continue;

      // Initialize swarms if not done
      if (!weapon.swarms) {
        weapon.swarms = [];
      }

      // Ensure correct number of swarms
      while (weapon.swarms.length < weapon.swarmCount) {
        weapon.swarms.push({ x: player.x, y: player.y, targetId: null });
      }

      // Assign targets
      const usedTargets = new Set();
      for (const swarm of weapon.swarms) {
        // Find nearest unassigned enemy
        let best = null;
        let bestDist = Infinity;
        for (const [eid, enemy] of room.enemies) {
          if (!enemy.alive || usedTargets.has(eid)) continue;
          const d = distance(swarm.x, swarm.y, enemy.x, enemy.y);
          if (d < bestDist) { best = enemy; bestDist = d; }
        }
        if (best) {
          swarm.targetId = best.id;
          usedTargets.add(best.id);
          // Move toward target
          const angle = angleBetween(swarm.x, swarm.y, best.x, best.y);
          swarm.x += Math.cos(angle) * weapon.speed * dt;
          swarm.y += Math.sin(angle) * weapon.speed * dt;
          // Damage on proximity
          if (bestDist < 16) {
            const lastHit = swarm.lastHit || 0;
            if (now - lastHit >= 400) {
              swarm.lastHit = now;
              best.hp -= weapon.damage;
              room.events.push({ type: 'damage', targetId: best.id, amount: weapon.damage, color: '#66dd44' });
              if (best.hp <= 0) {
                killEnemy(room, best.id, best);
              }
            }
          }
        } else {
          // Orbit player
          swarm.x += (player.x - swarm.x) * 0.05;
          swarm.y += (player.y - swarm.y) * 0.05;
        }
      }
    }
  }
}

export function killEnemy(room, id, enemy) {
  enemy.alive = false;
  room.killCount++;
  // Spawn XP gem
  const gemId = room.nextId++;
  room.xpGems.set(gemId, { id: gemId, x: enemy.x, y: enemy.y, xpValue: enemy.xpValue });
  room.events.push({ type: 'enemyDeath', x: enemy.x, y: enemy.y, enemyId: id });
  room.enemies.delete(id);
}
