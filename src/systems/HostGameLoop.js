/**
 * Browser-side game loop for the multiplayer host.
 * This is a port of server/ServerGameLoop.js + ServerWeapons.js + ServerUpgradeManager.js
 * that runs entirely in the browser (no Node.js dependencies).
 */

import { ENEMIES } from '../config/Enemies.js';
import { CHARACTERS } from '../config/Characters.js';
import { UPGRADES } from '../config/Upgrades.js';
import { MAP_WIDTH, MAP_HEIGHT, GAME_DURATION } from '../config/GameConfig.js';
import { distance, clamp, angleBetween, xpForLevel, shuffle } from '../shared/GameMath.js';

// ---- Upgrade Manager ----

class HostUpgradeManager {
  constructor(characterId) {
    this.characterId = characterId;
    this.acquired = {};
    Object.keys(UPGRADES).forEach(id => { this.acquired[id] = 0; });
  }

  getRandomUpgrades(count = 3) {
    const available = [];
    Object.keys(UPGRADES).forEach(id => {
      const upgrade = UPGRADES[id];
      if (upgrade.characterOnly && upgrade.characterOnly !== this.characterId) return;
      if (this.acquired[id] < upgrade.maxLevel) {
        available.push({
          id: upgrade.id, name: upgrade.name, description: upgrade.description,
          icon: upgrade.icon, maxLevel: upgrade.maxLevel,
          currentLevel: this.acquired[id], nextLevel: this.acquired[id] + 1,
        });
      }
    });
    const selected = shuffle(available).slice(0, count);
    selected.forEach(upgrade => {
      if (Math.random() < 0.04) {
        upgrade.isRare = true;
        upgrade.nextLevel = Math.min(upgrade.currentLevel + 2, UPGRADES[upgrade.id].maxLevel);
      }
    });
    return selected;
  }

  applyUpgrade(upgradeId) {
    const max = UPGRADES[upgradeId].maxLevel;
    if (this.acquired[upgradeId] < max) this.acquired[upgradeId]++;
    return this.acquired[upgradeId];
  }

  getLevel(upgradeId) { return this.acquired[upgradeId] || 0; }

  getStats(upgradeId) {
    const level = this.acquired[upgradeId];
    if (level <= 0) return null;
    return UPGRADES[upgradeId].statsPerLevel[level - 1];
  }
}

// ---- Room / Player ----

export function createRoom() {
  return {
    state: 'lobby', hostId: null,
    players: new Map(), enemies: new Map(), projectiles: new Map(),
    xpGems: new Map(), flames: new Map(), tornados: new Map(),
    pots: [], trees: [], healthPotions: new Map(),
    timer: { remaining: GAME_DURATION, elapsed: 0 },
    nextId: 1, killCount: 0, events: [], spawnAccumulator: 0,
  };
}

export function createPlayer(room, id, characterId) {
  const config = CHARACTERS[characterId] || CHARACTERS.human;
  const startingWeapon = getStartingWeapon(config);
  return {
    id, characterId,
    x: MAP_WIDTH / 2 + [-40, 40, -40, 40][room.players.size % 4],
    y: MAP_HEIGHT / 2 + [-20, -20, 20, 20][room.players.size % 4],
    hp: config.hp, maxHp: config.hp, speed: config.speed,
    invulnerable: false, invulnerableUntil: 0,
    xp: 0, level: 1, magnetRadius: 30,
    weapons: [startingWeapon],
    upgradeManager: new HostUpgradeManager(characterId),
    alive: true, respawnTimer: 0, pendingLevelUp: false,
    input: { x: 0, y: 0 }, flipX: false, anim: 'idle',
  };
}

function getStartingWeapon(charConfig) {
  switch (charConfig.startingWeapon) {
    case 'rapier':
      return { type: 'rapier', fireRate: 900, damage: 15, range: 80, lastFired: 0 };
    case 'cardDeck':
      return { type: 'cardDeck', fireRate: 800, damage: 6, speed: 220, range: 140, lastFired: 0 };
    case 'bloodOrb':
      return { type: 'bloodOrb', fireRate: 900, damage: 8, bulletSpeed: 180, range: 140, lifeStealPercent: 0.15, killHealPercent: 0.05, lastFired: 0 };
    case 'snakeSword':
      return { type: 'snakeSword', slashRate: 650, slashDamage: 10, poisonRate: 1000, poisonDamage: 5, poisonSpeed: 170, range: 150, lastSlash: 0, lastPoison: 0, lastFired: 0 };
    case 'laserDrones':
      return { type: 'laserDrones', fireRate: 2000, damage: 20, range: 170, pierceCount: 1, lastFired: 0, lastDrone: 0 };
    default:
      return { type: 'revolver', fireRate: 600, damage: 5, bulletSpeed: 300, range: 300, lastFired: 0 };
  }
}

// ---- World Init ----

export function initWorld(room) {
  const cx = MAP_WIDTH / 2;
  const cy = MAP_HEIGHT / 2;
  const treeCount = Math.floor(MAP_WIDTH * MAP_HEIGHT * 0.00002);
  for (let i = 0; i < treeCount; i++) {
    const x = 40 + Math.random() * (MAP_WIDTH - 80);
    const y = 40 + Math.random() * (MAP_HEIGHT - 80);
    if (distance(x, y, cx, cy) < 160) continue;
    room.trees.push({ x, y });
  }
  const potCount = Math.floor(MAP_WIDTH * MAP_HEIGHT * 0.000015);
  for (let i = 0; i < potCount; i++) {
    const x = 40 + Math.random() * (MAP_WIDTH - 80);
    const y = 40 + Math.random() * (MAP_HEIGHT - 80);
    if (distance(x, y, cx, cy) < 160) continue;
    room.pots.push({ id: room.nextId++, x, y, alive: true, respawnAt: 0 });
  }
}

// ---- Weapons ----

function findNearestEnemy(player, enemies, range) {
  let nearest = null;
  let nearestDist = range;
  for (const [id, enemy] of enemies) {
    if (!enemy.alive) continue;
    const dist2 = distance(player.x, player.y, enemy.x, enemy.y);
    if (dist2 < nearestDist) { nearest = enemy; nearestDist = dist2; }
  }
  return nearest;
}

function findNClosestEnemies(player, enemies, count) {
  const sorted = [];
  for (const [id, enemy] of enemies) {
    if (!enemy.alive) continue;
    sorted.push({ enemy, dist: distance(player.x, player.y, enemy.x, enemy.y) });
  }
  sorted.sort((a, b) => a.dist - b.dist);
  return sorted.slice(0, count).map(s => s.enemy);
}

function killEnemy(room, id, enemy) {
  enemy.alive = false;
  room.killCount++;
  const gemId = room.nextId++;
  room.xpGems.set(gemId, { id: gemId, x: enemy.x, y: enemy.y, xpValue: enemy.xpValue });
  room.events.push({ type: 'enemyDeath', x: enemy.x, y: enemy.y, enemyId: id });
  room.enemies.delete(id);
}

function updateWeapon(player, weapon, now, room) {
  if (now < weapon.lastFired + weapon.fireRate) return;

  switch (weapon.type) {
    case 'revolver': {
      const target = findNearestEnemy(player, room.enemies, weapon.range);
      if (!target) return;
      weapon.lastFired = now;
      const angle = angleBetween(player.x, player.y, target.x, target.y);
      const projId = room.nextId++;
      room.projectiles.set(projId, {
        id: projId, type: 'bullet', ownerId: player.id,
        x: player.x, y: player.y,
        vx: Math.cos(angle) * weapon.bulletSpeed, vy: Math.sin(angle) * weapon.bulletSpeed,
        damage: weapon.damage, lifetime: (weapon.range / weapon.bulletSpeed) * 1000,
        pierce: false, hitEnemies: new Set(), rotation: angle,
      });
      room.events.push({ type: 'weaponFired', weaponType: 'revolver', playerId: player.id, angle });
      break;
    }
    case 'rapier': {
      const target = findNearestEnemy(player, room.enemies, weapon.range);
      if (!target) return;
      weapon.lastFired = now;
      const angle = angleBetween(player.x, player.y, target.x, target.y);
      for (const [eid, enemy] of room.enemies) {
        if (!enemy.alive) continue;
        if (distance(player.x, player.y, enemy.x, enemy.y) <= weapon.range) {
          const eAngle = angleBetween(player.x, player.y, enemy.x, enemy.y);
          const diff = Math.abs(((angle - eAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          if (diff < Math.PI / 3) {
            enemy.hp -= weapon.damage;
            room.events.push({ type: 'damage', targetId: eid, amount: weapon.damage, color: '#dddddd' });
            if (enemy.hp <= 0) killEnemy(room, eid, enemy);
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
        id: projId, type: 'dart', ownerId: player.id,
        x: player.x, y: player.y,
        vx: Math.cos(angle) * weapon.speed, vy: Math.sin(angle) * weapon.speed,
        damage: weapon.damage, lifetime: (weapon.range / weapon.speed) * 1000,
        pierce: true, hitEnemies: new Set(), rotation: angle,
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
          if (enemy.hp <= 0) killEnemy(room, eid, enemy);
        }
      }
      break;
    }
    case 'spearRain': {
      weapon.lastFired = now;
      const targets = findNClosestEnemies(player, room.enemies, weapon.spearCount);
      targets.forEach(target => {
        if (!target.alive) return;
        target.hp -= weapon.damage;
        room.events.push({ type: 'spearImpact', x: target.x, y: target.y, damage: weapon.damage });
        room.events.push({ type: 'damage', targetId: target.id, amount: weapon.damage, color: '#cc8844' });
        if (target.hp <= 0) killEnemy(room, target.id, target);
      });
      break;
    }
    case 'unicornRider': {
      weapon.lastFired = now;
      const fromLeft = Math.random() < 0.5;
      const projId = room.nextId++;
      room.projectiles.set(projId, {
        id: projId, type: 'unicorn', ownerId: player.id,
        x: fromLeft ? player.x - 500 : player.x + 500, y: player.y,
        vx: fromLeft ? 300 : -300, vy: 0,
        damage: weapon.damage, lifetime: 3500,
        pierce: true, hitEnemies: new Set(), rotation: fromLeft ? 0 : Math.PI,
      });
      room.events.push({ type: 'weaponFired', weaponType: 'unicornRider', playerId: player.id, angle: fromLeft ? 0 : Math.PI });
      break;
    }
    case 'flameTrail': {
      if (!weapon.lastX) { weapon.lastX = player.x; weapon.lastY = player.y; }
      const moved = distance(weapon.lastX, weapon.lastY, player.x, player.y);
      if (moved < 16) return;
      weapon.lastFired = now;
      weapon.lastX = player.x; weapon.lastY = player.y;
      room.flames.set(room.nextId, {
        id: room.nextId, x: player.x, y: player.y,
        damage: weapon.damage, lifetime: weapon.duration, hitCooldowns: new Map(),
      });
      room.nextId++;
      break;
    }
    case 'tornado': {
      if (!weapon._tornadoId || !room.tornados.has(weapon._tornadoId)) {
        weapon.lastFired = now;
        const tornadoId = room.nextId++;
        weapon._tornadoId = tornadoId;
        const a = Math.random() * Math.PI * 2;
        room.tornados.set(tornadoId, {
          id: tornadoId, ownerId: player.id,
          x: player.x + Math.cos(a) * 40, y: player.y + Math.sin(a) * 40,
          vx: Math.cos(a) * weapon.speed, vy: Math.sin(a) * weapon.speed,
          damage: weapon.damage, permanent: true, hitCooldowns: new Map(), wanderTimer: 0,
        });
      } else {
        const tornado = room.tornados.get(weapon._tornadoId);
        if (tornado) tornado.damage = weapon.damage;
      }
      break;
    }
    case 'cardDeck': {
      const target = findNearestEnemy(player, room.enemies, weapon.range);
      if (!target) return;
      weapon.lastFired = now;
      const angle = angleBetween(player.x, player.y, target.x, target.y);
      const projId = room.nextId++;
      room.projectiles.set(projId, {
        id: projId, type: 'card', ownerId: player.id,
        x: player.x, y: player.y,
        vx: Math.cos(angle) * weapon.speed, vy: Math.sin(angle) * weapon.speed,
        damage: weapon.damage, lifetime: (weapon.range / weapon.speed) * 1000,
        pierce: false, hitEnemies: new Set(), rotation: angle,
      });
      room.events.push({ type: 'weaponFired', weaponType: 'cardDeck', playerId: player.id, angle });
      break;
    }
    case 'bloodOrb': {
      const target = findNearestEnemy(player, room.enemies, weapon.range);
      if (!target) return;
      weapon.lastFired = now;
      const angle = angleBetween(player.x, player.y, target.x, target.y);
      const projId = room.nextId++;
      room.projectiles.set(projId, {
        id: projId, type: 'bloodOrb', ownerId: player.id,
        x: player.x, y: player.y,
        vx: Math.cos(angle) * weapon.bulletSpeed, vy: Math.sin(angle) * weapon.bulletSpeed,
        damage: weapon.damage, lifetime: (weapon.range / weapon.bulletSpeed) * 1000,
        pierce: false, hitEnemies: new Set(), rotation: angle,
        lifeStealPercent: weapon.lifeStealPercent, killHealPercent: weapon.killHealPercent,
      });
      room.events.push({ type: 'weaponFired', weaponType: 'bloodOrb', playerId: player.id, angle });
      break;
    }
    case 'snakeSword': {
      const nearest = findNearestEnemy(player, room.enemies, weapon.range);
      if (!nearest) return;
      const dist2 = distance(player.x, player.y, nearest.x, nearest.y);
      if (dist2 <= 60) {
        if (now < weapon.lastSlash + weapon.slashRate) return;
        weapon.lastSlash = now; weapon.lastFired = now;
        const angle = angleBetween(player.x, player.y, nearest.x, nearest.y);
        for (const [eid, enemy] of room.enemies) {
          if (!enemy.alive) continue;
          if (distance(player.x, player.y, enemy.x, enemy.y) > 65) continue;
          const eAngle = angleBetween(player.x, player.y, enemy.x, enemy.y);
          const diff = Math.abs(((angle - eAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          if (diff < Math.PI / 3) {
            enemy.hp -= weapon.slashDamage;
            room.events.push({ type: 'damage', targetId: eid, amount: weapon.slashDamage, color: '#cccccc' });
            if (enemy.hp <= 0) killEnemy(room, eid, enemy);
          }
        }
        room.events.push({ type: 'weaponFired', weaponType: 'snakeSword', playerId: player.id, angle });
      } else {
        if (now < weapon.lastPoison + weapon.poisonRate) return;
        weapon.lastPoison = now; weapon.lastFired = now;
        const angle = angleBetween(player.x, player.y, nearest.x, nearest.y);
        const projId = room.nextId++;
        room.projectiles.set(projId, {
          id: projId, type: 'poison', ownerId: player.id,
          x: player.x, y: player.y,
          vx: Math.cos(angle) * weapon.poisonSpeed, vy: Math.sin(angle) * weapon.poisonSpeed,
          damage: weapon.poisonDamage, lifetime: (weapon.range / weapon.poisonSpeed) * 1000,
          pierce: false, hitEnemies: new Set(), rotation: angle,
        });
        room.events.push({ type: 'weaponFired', weaponType: 'snakeSword', playerId: player.id, angle });
      }
      break;
    }
    case 'laserDrones': {
      const target = findNearestEnemy(player, room.enemies, weapon.range);
      if (!target) return;
      weapon.lastFired = now;
      const angle = angleBetween(player.x, player.y, target.x, target.y);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const hitEnemies = [];
      for (const [eid, enemy] of room.enemies) {
        if (!enemy.alive) continue;
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const proj = dx * cosA + dy * sinA;
        if (proj < 0 || proj > weapon.range) continue;
        const perp = Math.abs(dx * sinA - dy * cosA);
        if (perp <= 10) hitEnemies.push({ eid, enemy, dist: proj });
      }
      hitEnemies.sort((a, b) => a.dist - b.dist);
      for (let i = 0; i < Math.min(hitEnemies.length, weapon.pierceCount); i++) {
        const { eid, enemy } = hitEnemies[i];
        enemy.hp -= weapon.damage;
        room.events.push({ type: 'damage', targetId: eid, amount: weapon.damage, color: '#ff4444' });
        if (enemy.hp <= 0) killEnemy(room, eid, enemy);
      }
      room.events.push({ type: 'weaponFired', weaponType: 'laserDrones', playerId: player.id, angle });
      break;
    }
    case 'bugSwarm': break; // handled in updateBugSwarms
  }
}

function updateFlames(room, dt, now) {
  for (const [id, flame] of room.flames) {
    flame.lifetime -= dt * 1000;
    if (flame.lifetime <= 0) { room.flames.delete(id); continue; }
    for (const [eid, enemy] of room.enemies) {
      if (!enemy.alive) continue;
      if (distance(flame.x, flame.y, enemy.x, enemy.y) > 16) continue;
      const lastHit = flame.hitCooldowns.get(eid) || 0;
      if (now - lastHit < 500) continue;
      flame.hitCooldowns.set(eid, now);
      enemy.hp -= flame.damage;
      room.events.push({ type: 'damage', targetId: eid, amount: flame.damage, color: '#ff6600' });
      if (enemy.hp <= 0) killEnemy(room, eid, enemy);
    }
  }
}

function updateTornados(room, dt, now) {
  for (const [id, tornado] of room.tornados) {
    if (!tornado.permanent) {
      tornado.lifetime -= dt * 1000;
      if (tornado.lifetime <= 0) { room.tornados.delete(id); continue; }
    }
    if (tornado.permanent && tornado.ownerId) {
      const owner = room.players.get(tornado.ownerId);
      if (owner && owner.alive && distance(tornado.x, tornado.y, owner.x, owner.y) > 300) {
        tornado.x = owner.x + (Math.random() - 0.5) * 120;
        tornado.y = owner.y + (Math.random() - 0.5) * 120;
      }
    }
    tornado.wanderTimer -= dt * 1000;
    if (tornado.wanderTimer <= 0) {
      const a = Math.random() * Math.PI * 2;
      const speed = Math.sqrt(tornado.vx * tornado.vx + tornado.vy * tornado.vy);
      tornado.vx = Math.cos(a) * speed;
      tornado.vy = Math.sin(a) * speed;
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
      if (enemy.hp <= 0) killEnemy(room, eid, enemy);
    }
  }
}

function updateBugSwarms(room, dt, now) {
  for (const [playerId, player] of room.players) {
    if (!player.alive) continue;
    for (const weapon of player.weapons) {
      if (weapon.type !== 'bugSwarm') continue;
      if (!weapon.swarms) weapon.swarms = [];
      while (weapon.swarms.length < weapon.swarmCount) {
        weapon.swarms.push({ x: player.x, y: player.y, targetId: null });
      }
      const usedTargets = new Set();
      for (const swarm of weapon.swarms) {
        let best = null; let bestDist = Infinity;
        for (const [eid, enemy] of room.enemies) {
          if (!enemy.alive || usedTargets.has(eid)) continue;
          const d = distance(swarm.x, swarm.y, enemy.x, enemy.y);
          if (d < bestDist) { best = enemy; bestDist = d; }
        }
        if (best) {
          swarm.targetId = best.id;
          usedTargets.add(best.id);
          const a = angleBetween(swarm.x, swarm.y, best.x, best.y);
          swarm.x += Math.cos(a) * weapon.speed * dt;
          swarm.y += Math.sin(a) * weapon.speed * dt;
          if (bestDist < 16) {
            const lastHit = swarm.lastHit || 0;
            if (now - lastHit >= 400) {
              swarm.lastHit = now;
              best.hp -= weapon.damage;
              room.events.push({ type: 'damage', targetId: best.id, amount: weapon.damage, color: '#66dd44' });
              if (best.hp <= 0) killEnemy(room, best.id, best);
            }
          }
        } else {
          swarm.x += (player.x - swarm.x) * 0.05;
          swarm.y += (player.y - swarm.y) * 0.05;
        }
      }
    }
  }
}

// ---- Main Tick ----

export function tick(room, dt, now) {
  if (room.state !== 'playing') return;
  room.events = [];

  // Timer
  room.timer.elapsed += dt;
  room.timer.remaining -= dt;
  if (room.timer.remaining <= 0) {
    room.state = 'game_over';
    room.events.push({ type: 'gameOver', victory: true });
    return;
  }

  // Player movement + respawn
  for (const [id, player] of room.players) {
    if (!player.alive) {
      player.respawnTimer -= dt;
      if (player.respawnTimer <= 0) {
        const alive = [...room.players.values()].find(p => p.alive && p.id !== id);
        if (alive) {
          player.x = alive.x + (Math.random() - 0.5) * 40;
          player.y = alive.y + (Math.random() - 0.5) * 40;
          player.hp = Math.floor(player.maxHp / 2);
          player.alive = true;
          player.invulnerable = true;
          player.invulnerableUntil = now + 2000;
          room.events.push({ type: 'playerRespawn', playerId: id });
        }
      }
      continue;
    }
    const { x: ix, y: iy } = player.input;
    player.x += ix * player.speed * dt;
    player.y += iy * player.speed * dt;
    player.x = clamp(player.x, 16, MAP_WIDTH - 16);
    player.y = clamp(player.y, 16, MAP_HEIGHT - 16);
    player.anim = (Math.abs(ix) > 0.1 || Math.abs(iy) > 0.1) ? 'walk' : 'idle';
    if (ix < -0.1) player.flipX = true;
    else if (ix > 0.1) player.flipX = false;
    for (const tree of room.trees) {
      const d = distance(player.x, player.y, tree.x, tree.y);
      if (d < 12) {
        const a = angleBetween(tree.x, tree.y, player.x, player.y);
        player.x = tree.x + Math.cos(a) * 12;
        player.y = tree.y + Math.sin(a) * 12;
      }
    }
    if (player.invulnerable && now >= player.invulnerableUntil) player.invulnerable = false;
  }

  // Passive heal
  if (!room._lastHealTick) room._lastHealTick = 0;
  if (now - room._lastHealTick >= 2000) {
    room._lastHealTick = now;
    for (const [id, player] of room.players) {
      if (!player.alive || player.characterId === 'bloodMage') continue;
      if (player.hp < player.maxHp) player.hp = Math.min(player.hp + 1, player.maxHp);
    }
  }

  // Enemy AI
  const alivePlayers = [...room.players.values()].filter(p => p.alive);
  for (const [id, enemy] of room.enemies) {
    if (!enemy.alive) continue;
    let nearest = null; let nearestDist = Infinity;
    for (const p of alivePlayers) {
      const d = distance(enemy.x, enemy.y, p.x, p.y);
      if (d < nearestDist) { nearest = p; nearestDist = d; }
    }
    if (nearest) {
      const a = angleBetween(enemy.x, enemy.y, nearest.x, nearest.y);
      enemy.x += Math.cos(a) * enemy.speed * dt;
      enemy.y += Math.sin(a) * enemy.speed * dt;
    }
  }

  // Weapons
  for (const [id, player] of room.players) {
    if (!player.alive || player.pendingLevelUp) continue;
    for (const weapon of player.weapons) updateWeapon(player, weapon, now, room);
  }
  updateFlames(room, dt, now);
  updateTornados(room, dt, now);
  updateBugSwarms(room, dt, now);

  // Projectile movement + collision
  for (const [projId, proj] of room.projectiles) {
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.lifetime -= dt * 1000;
    if (proj.lifetime <= 0) { room.projectiles.delete(projId); continue; }
    for (const [eid, enemy] of room.enemies) {
      if (!enemy.alive) continue;
      if (proj.pierce && proj.hitEnemies.has(eid)) continue;
      if (distance(proj.x, proj.y, enemy.x, enemy.y) < 12) {
        enemy.hp -= proj.damage;
        const color = proj.type === 'bullet' ? '#ffcc44' : proj.type === 'bloodOrb' ? '#cc2244' : proj.type === 'poison' ? '#44ff44' : '#cccccc';
        room.events.push({ type: 'damage', targetId: eid, amount: proj.damage, color });
        if (proj.type === 'bloodOrb' && proj.lifeStealPercent) {
          const owner = room.players.get(proj.ownerId);
          if (owner && owner.alive) owner.hp = Math.min(owner.maxHp, owner.hp + Math.ceil(proj.damage * proj.lifeStealPercent));
        }
        if (proj.pierce) { proj.hitEnemies.add(eid); } else { room.projectiles.delete(projId); }
        if (enemy.hp <= 0) {
          if (proj.type === 'bloodOrb' && proj.killHealPercent) {
            const owner = room.players.get(proj.ownerId);
            if (owner && owner.alive) owner.hp = Math.min(owner.maxHp, owner.hp + Math.ceil(owner.maxHp * proj.killHealPercent));
          }
          killEnemy(room, eid, enemy);
        }
        if (!proj.pierce) break;
      }
    }
    if (!room.projectiles.has(projId)) continue;
    for (const pot of room.pots) {
      if (!pot.alive) continue;
      if (distance(proj.x, proj.y, pot.x, pot.y) < 10) {
        breakPot(room, pot, now);
        if (!proj.pierce) { room.projectiles.delete(projId); break; }
      }
    }
  }

  // Enemy vs player
  for (const [eid, enemy] of room.enemies) {
    if (!enemy.alive) continue;
    for (const [pid, player] of room.players) {
      if (!player.alive || player.invulnerable) continue;
      if (distance(enemy.x, enemy.y, player.x, player.y) < 14) {
        player.hp -= enemy.damage;
        player.invulnerable = true;
        player.invulnerableUntil = now + 500;
        room.events.push({ type: 'playerHit', playerId: pid, amount: enemy.damage });
        if (player.hp <= 0) {
          player.alive = false;
          player.respawnTimer = 10;
          room.events.push({ type: 'playerDeath', playerId: pid });
        }
      }
    }
  }

  // All dead?
  if (![...room.players.values()].some(p => p.alive)) {
    room.state = 'game_over';
    room.events.push({ type: 'gameOver', victory: false });
    return;
  }

  // XP gem collection
  for (const [gemId, gem] of room.xpGems) {
    for (const [pid, player] of room.players) {
      if (!player.alive) continue;
      const d = distance(gem.x, gem.y, player.x, player.y);
      if (d < player.magnetRadius) {
        const a = angleBetween(gem.x, gem.y, player.x, player.y);
        gem.x += Math.cos(a) * 200 * dt;
        gem.y += Math.sin(a) * 200 * dt;
      }
      if (d < 8) {
        for (const [_, p] of room.players) {
          p.xp += gem.xpValue;
          checkLevelUp(room, p);
        }
        room.xpGems.delete(gemId);
        room.events.push({ type: 'gemCollected', gemId });
        break;
      }
    }
  }

  // Health potion collection
  for (const [potionId, potion] of room.healthPotions) {
    for (const [pid, player] of room.players) {
      if (!player.alive) continue;
      if (distance(potion.x, potion.y, player.x, player.y) < 12) {
        const healAmount = Math.floor(player.maxHp * 0.5);
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        room.healthPotions.delete(potionId);
        room.events.push({ type: 'healthPickup', playerId: pid, amount: healAmount });
        break;
      }
    }
  }

  // Player walks over pots
  for (const pot of room.pots) {
    if (!pot.alive) continue;
    for (const [pid, player] of room.players) {
      if (!player.alive) continue;
      if (distance(player.x, player.y, pot.x, pot.y) < 12) {
        breakPot(room, pot, now);
        break;
      }
    }
  }

  // Pot respawning
  for (const pot of room.pots) {
    if (!pot.alive && pot.respawnAt > 0 && now >= pot.respawnAt) {
      pot.x = 40 + Math.random() * (MAP_WIDTH - 80);
      pot.y = 40 + Math.random() * (MAP_HEIGHT - 80);
      pot.alive = true;
      pot.respawnAt = 0;
    }
  }

  // Enemy spawning
  updateSpawning(room, dt, now, alivePlayers);
}

function updateSpawning(room, dt, now, alivePlayers) {
  if (alivePlayers.length === 0) return;
  room.spawnAccumulator += dt * 1000;
  const elapsedMinutes = room.timer.elapsed / 60;
  const currentRate = 1000 / (1 + elapsedMinutes * 0.3);
  if (room.spawnAccumulator < currentRate) return;
  room.spawnAccumulator = 0;
  if (room.enemies.size >= 200) return;

  const config = ENEMIES.greenSlime;
  const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  const angle = Math.random() * Math.PI * 2;
  const dist2 = 400 + Math.random() * 200;
  const x = clamp(target.x + Math.cos(angle) * dist2, 16, MAP_WIDTH - 16);
  const y = clamp(target.y + Math.sin(angle) * dist2, 16, MAP_HEIGHT - 16);
  const healthMultiplier = 1 + elapsedMinutes * 0.15;
  const hp = Math.floor(config.baseHp * healthMultiplier);
  const id = room.nextId++;
  room.enemies.set(id, {
    id, type: 'greenSlime', x, y, hp, maxHp: hp,
    speed: config.speed, damage: config.damage, xpValue: config.xpValue, alive: true,
  });
}

function checkLevelUp(room, player) {
  const xpNeeded = xpForLevel(player.level);
  if (player.xp >= xpNeeded && !player.pendingLevelUp) {
    player.xp -= xpNeeded;
    player.level++;
    player.pendingLevelUp = true;
    const choices = player.upgradeManager.getRandomUpgrades(3);
    if (choices.length === 0) { player.pendingLevelUp = false; return; }
    room.events.push({ type: 'levelUp', playerId: player.id, level: player.level, choices });
  }
}

function breakPot(room, pot, now) {
  pot.alive = false;
  pot.respawnAt = now + 30000 + Math.random() * 30000;
  room.events.push({ type: 'potBreak', potId: pot.id, x: pot.x, y: pot.y });
  if (Math.random() < 0.15) {
    const gemId = room.nextId++;
    room.xpGems.set(gemId, { id: gemId, x: pot.x, y: pot.y, xpValue: 10 });
  }
  if (Math.random() < 0.03) {
    const potionId = room.nextId++;
    room.healthPotions.set(potionId, { id: potionId, x: pot.x, y: pot.y });
  }
}

export function applyUpgradeToPlayer(room, player, upgradeId, isRare) {
  const times = isRare ? 2 : 1;
  for (let i = 0; i < times; i++) applySingleUpgrade(room, player, upgradeId);
  player.pendingLevelUp = false;
}

function applySingleUpgrade(room, player, upgradeId) {
  const newLevel = player.upgradeManager.applyUpgrade(upgradeId);
  const stats = player.upgradeManager.getStats(upgradeId);
  if (!stats) return;

  if (['revolverUp', 'rapierUp', 'cardDeckUp', 'bloodOrbUp', 'snakeSwordUp', 'laserDronesUp'].includes(upgradeId)) {
    Object.assign(player.weapons[0], stats);
    return;
  }
  if (upgradeId === 'magnetRange') { player.magnetRadius = stats.magnetRadius; return; }
  if (upgradeId === 'speedBoost') {
    player.speed = (CHARACTERS[player.characterId]?.speed || 80) + stats.speedBonus;
    return;
  }

  const existing = player.weapons.find(w => w.upgradeId === upgradeId);
  if (existing) {
    Object.assign(existing, stats);
  } else {
    const weaponTypeMap = {
      damageAura: 'damageAura', unicornRider: 'unicornRider', piercingDart: 'piercingDart',
      spearRain: 'spearRain', flameTrail: 'flameTrail', tornado: 'tornado', bugs: 'bugSwarm',
    };
    player.weapons.push({ type: weaponTypeMap[upgradeId] || upgradeId, upgradeId, lastFired: 0, ...stats });
  }
}

export function buildStateSnapshot(room) {
  const players = [];
  for (const [id, p] of room.players) {
    players.push({
      id: p.id, ch: p.characterId,
      x: Math.round(p.x), y: Math.round(p.y),
      sp: p.speed,
      hp: p.hp, mhp: p.maxHp, flipX: p.flipX, anim: p.anim,
      inv: p.invulnerable, alive: p.alive, xp: p.xp, level: p.level,
      rt: p.alive ? 0 : Math.ceil(p.respawnTimer),
      upgrades: p.upgradeManager.acquired,
    });
  }
  const enemies = [];
  for (const [id, e] of room.enemies) {
    if (!e.alive) continue;
    enemies.push([id, Math.round(e.x), Math.round(e.y), Math.round((e.hp / e.maxHp) * 100)]);
  }
  const projectiles = [];
  for (const [id, p] of room.projectiles) {
    projectiles.push([id, p.type, Math.round(p.x), Math.round(p.y), p.rotation]);
  }
  const gems = [];
  for (const [id, g] of room.xpGems) gems.push([id, Math.round(g.x), Math.round(g.y)]);
  const potions = [];
  for (const [id, h] of room.healthPotions) potions.push([id, Math.round(h.x), Math.round(h.y)]);
  const flames = [];
  for (const [id, f] of room.flames) flames.push([id, Math.round(f.x), Math.round(f.y)]);
  const tornados = [];
  for (const [id, t] of room.tornados) tornados.push([id, Math.round(t.x), Math.round(t.y)]);
  const pots = room.pots.filter(p => p.alive).map(p => [p.id, Math.round(p.x), Math.round(p.y)]);

  return {
    type: 'state', p: players, e: enemies, pr: projectiles,
    g: gems, h: potions, fl: flames, tn: tornados, pt: pots,
    tm: Math.round(room.timer.remaining), k: room.killCount,
  };
}
