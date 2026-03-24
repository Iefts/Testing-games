import { ENEMIES } from '../src/config/Enemies.js';
import { CHARACTERS } from '../src/config/Characters.js';
import { UPGRADES } from '../src/config/Upgrades.js';
import { MAP_WIDTH, MAP_HEIGHT, GAME_DURATION } from '../src/config/GameConfig.js';
import { distance, clamp, angleBetween, xpForLevel } from '../src/shared/GameMath.js';
import { updateWeapon, updateFlames, updateTornados, updateBugSwarms, killEnemy } from './ServerWeapons.js';
import { ServerUpgradeManager } from './ServerUpgradeManager.js';

export function createRoom() {
  return {
    state: 'lobby',
    hostId: null,
    players: new Map(),
    enemies: new Map(),
    projectiles: new Map(),
    xpGems: new Map(),
    flames: new Map(),
    tornados: new Map(),
    pots: [],
    trees: [],
    healthPotions: new Map(),
    timer: { remaining: GAME_DURATION, elapsed: 0 },
    nextId: 1,
    killCount: 0,
    events: [],
    spawnAccumulator: 0,
  };
}

export function createPlayer(room, id, characterId) {
  const config = CHARACTERS[characterId] || CHARACTERS.human;
  const startingWeapon = getStartingWeapon(config);

  const player = {
    id,
    characterId,
    x: MAP_WIDTH / 2 + (room.players.size === 0 ? -30 : 30),
    y: MAP_HEIGHT / 2,
    hp: config.hp,
    maxHp: config.hp,
    speed: config.speed,
    invulnerable: false,
    invulnerableUntil: 0,
    xp: 0,
    level: 1,
    magnetRadius: 30,
    weapons: [startingWeapon],
    upgradeManager: new ServerUpgradeManager(characterId),
    alive: true,
    respawnTimer: 0,
    pendingLevelUp: false,
    input: { x: 0, y: 0 },
    flipX: false,
    anim: 'idle',
  };

  return player;
}

function getStartingWeapon(charConfig) {
  if (charConfig.startingWeapon === 'rapier') {
    return {
      type: 'rapier',
      fireRate: 900,
      damage: 15,
      range: 80,
      lastFired: 0,
    };
  }
  return {
    type: 'revolver',
    fireRate: 600,
    damage: 5,
    bulletSpeed: 300,
    range: 300,
    lastFired: 0,
  };
}

export function initWorld(room) {
  // Generate trees
  const treeCount = Math.floor(MAP_WIDTH * MAP_HEIGHT * 0.00002);
  const cx = MAP_WIDTH / 2;
  const cy = MAP_HEIGHT / 2;
  for (let i = 0; i < treeCount; i++) {
    const x = 40 + Math.random() * (MAP_WIDTH - 80);
    const y = 40 + Math.random() * (MAP_HEIGHT - 80);
    if (distance(x, y, cx, cy) < 160) continue;
    room.trees.push({ x, y });
  }

  // Generate pots
  const potCount = Math.floor(MAP_WIDTH * MAP_HEIGHT * 0.000015);
  for (let i = 0; i < potCount; i++) {
    const x = 40 + Math.random() * (MAP_WIDTH - 80);
    const y = 40 + Math.random() * (MAP_HEIGHT - 80);
    if (distance(x, y, cx, cy) < 160) continue;
    const id = room.nextId++;
    room.pots.push({ id, x, y, alive: true, respawnAt: 0 });
  }
}

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
        // Find alive player to respawn near
        const alive = [...room.players.values()].find((p) => p.alive && p.id !== id);
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

    // Animation state
    player.anim = (Math.abs(ix) > 0.1 || Math.abs(iy) > 0.1) ? 'walk' : 'idle';
    if (ix < -0.1) player.flipX = true;
    else if (ix > 0.1) player.flipX = false;

    // Tree collision (push out)
    for (const tree of room.trees) {
      const d = distance(player.x, player.y, tree.x, tree.y);
      if (d < 12) {
        const angle = angleBetween(tree.x, tree.y, player.x, player.y);
        player.x = tree.x + Math.cos(angle) * 12;
        player.y = tree.y + Math.sin(angle) * 12;
      }
    }

    // Invulnerability timer
    if (player.invulnerable && now >= player.invulnerableUntil) {
      player.invulnerable = false;
    }
  }

  // Enemy AI
  const alivePlayers = [...room.players.values()].filter((p) => p.alive);
  for (const [id, enemy] of room.enemies) {
    if (!enemy.alive) continue;
    // Find nearest alive player
    let nearest = null;
    let nearestDist = Infinity;
    for (const p of alivePlayers) {
      const d = distance(enemy.x, enemy.y, p.x, p.y);
      if (d < nearestDist) { nearest = p; nearestDist = d; }
    }
    if (nearest) {
      const angle = angleBetween(enemy.x, enemy.y, nearest.x, nearest.y);
      enemy.x += Math.cos(angle) * enemy.speed * dt;
      enemy.y += Math.sin(angle) * enemy.speed * dt;
    }
  }

  // Weapon updates
  for (const [id, player] of room.players) {
    if (!player.alive || player.pendingLevelUp) continue;
    for (const weapon of player.weapons) {
      updateWeapon(player, weapon, now, room);
    }
  }

  // Special weapon entity updates
  updateFlames(room, dt, now);
  updateTornados(room, dt, now);
  updateBugSwarms(room, dt, now);

  // Projectile movement + collision
  for (const [projId, proj] of room.projectiles) {
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.lifetime -= dt * 1000;
    if (proj.lifetime <= 0) {
      room.projectiles.delete(projId);
      continue;
    }

    // Check enemy collisions
    for (const [eid, enemy] of room.enemies) {
      if (!enemy.alive) continue;
      if (proj.pierce && proj.hitEnemies.has(eid)) continue;
      if (distance(proj.x, proj.y, enemy.x, enemy.y) < 12) {
        enemy.hp -= proj.damage;
        room.events.push({ type: 'damage', targetId: eid, amount: proj.damage, color: proj.type === 'bullet' ? '#ffcc44' : '#cccccc' });
        if (proj.pierce) {
          proj.hitEnemies.add(eid);
        } else {
          room.projectiles.delete(projId);
        }
        if (enemy.hp <= 0) {
          killEnemy(room, eid, enemy);
        }
        if (!proj.pierce) break;
      }
    }

    // Check pot collisions
    for (const pot of room.pots) {
      if (!pot.alive) continue;
      if (distance(proj.x, proj.y, pot.x, pot.y) < 10) {
        breakPot(room, pot, now);
        if (!proj.pierce) {
          room.projectiles.delete(projId);
          break;
        }
      }
    }
  }

  // Enemy vs player collision
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

  // Check if all players dead
  const anyAlive = [...room.players.values()].some((p) => p.alive);
  if (!anyAlive) {
    room.state = 'game_over';
    room.events.push({ type: 'gameOver', victory: false });
    return;
  }

  // XP gem collection (shared XP)
  for (const [gemId, gem] of room.xpGems) {
    let collected = false;
    for (const [pid, player] of room.players) {
      if (!player.alive) continue;
      const d = distance(gem.x, gem.y, player.x, player.y);
      if (d < player.magnetRadius) {
        // Move gem toward player
        const angle = angleBetween(gem.x, gem.y, player.x, player.y);
        const speed = 200;
        gem.x += Math.cos(angle) * speed * dt;
        gem.y += Math.sin(angle) * speed * dt;
      }
      if (d < 8) {
        collected = true;
        // Shared XP: give to ALL players
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
  const dist = 400 + Math.random() * 200;
  const x = clamp(target.x + Math.cos(angle) * dist, 16, MAP_WIDTH - 16);
  const y = clamp(target.y + Math.sin(angle) * dist, 16, MAP_HEIGHT - 16);

  const healthMultiplier = 1 + elapsedMinutes * 0.15;
  const hp = Math.floor(config.baseHp * healthMultiplier);
  const id = room.nextId++;
  room.enemies.set(id, {
    id,
    type: 'greenSlime',
    x, y,
    hp,
    maxHp: hp,
    speed: config.speed,
    damage: config.damage,
    xpValue: config.xpValue,
    alive: true,
  });
}

function checkLevelUp(room, player) {
  const xpNeeded = xpForLevel(player.level);
  if (player.xp >= xpNeeded && !player.pendingLevelUp) {
    player.xp -= xpNeeded;
    player.level++;
    player.pendingLevelUp = true;

    const choices = player.upgradeManager.getRandomUpgrades(3);
    if (choices.length === 0) {
      player.pendingLevelUp = false;
      return;
    }

    room.events.push({
      type: 'levelUp',
      playerId: player.id,
      level: player.level,
      choices,
    });
  }
}

export function applyUpgradeToPlayer(room, player, upgradeId, isRare) {
  const times = isRare ? 2 : 1;
  for (let i = 0; i < times; i++) {
    applySingleUpgrade(room, player, upgradeId);
  }
  player.pendingLevelUp = false;
}

function applySingleUpgrade(room, player, upgradeId) {
  const newLevel = player.upgradeManager.applyUpgrade(upgradeId);
  const stats = player.upgradeManager.getStats(upgradeId);
  if (!stats) return;

  const charConfig = CHARACTERS[player.characterId];

  // Starting weapon upgrades
  if (upgradeId === 'revolverUp' || upgradeId === 'rapierUp') {
    const startWeapon = player.weapons[0];
    Object.assign(startWeapon, stats);
    return;
  }

  // Passive upgrades
  if (upgradeId === 'magnetRange') {
    player.magnetRadius = stats.magnetRadius;
    return;
  }

  // Find existing weapon of this type
  const upgrade = UPGRADES[upgradeId];
  const existing = player.weapons.find((w) => w.upgradeId === upgradeId);
  if (existing) {
    Object.assign(existing, stats);
  } else {
    // Create new weapon
    const weapon = {
      type: getWeaponType(upgradeId),
      upgradeId,
      lastFired: 0,
      ...stats,
    };
    player.weapons.push(weapon);
  }
}

function getWeaponType(upgradeId) {
  const map = {
    damageAura: 'damageAura',
    unicornRider: 'unicornRider',
    piercingDart: 'piercingDart',
    spearRain: 'spearRain',
    flameTrail: 'flameTrail',
    tornado: 'tornado',
    bugs: 'bugSwarm',
  };
  return map[upgradeId] || upgradeId;
}

function breakPot(room, pot, now) {
  pot.alive = false;
  pot.respawnAt = now + 30000 + Math.random() * 30000;
  room.events.push({ type: 'potBreak', potId: pot.id, x: pot.x, y: pot.y });

  // 15% chance XP gem
  if (Math.random() < 0.15) {
    const gemId = room.nextId++;
    room.xpGems.set(gemId, { id: gemId, x: pot.x, y: pot.y, xpValue: 10 });
  }

  // 3% chance health potion
  if (Math.random() < 0.03) {
    const potionId = room.nextId++;
    room.healthPotions.set(potionId, { id: potionId, x: pot.x, y: pot.y });
  }
}

export function buildStateSnapshot(room) {
  const players = [];
  for (const [id, p] of room.players) {
    players.push({
      id: p.id,
      ch: p.characterId,
      x: Math.round(p.x),
      y: Math.round(p.y),
      hp: p.hp,
      mhp: p.maxHp,
      flipX: p.flipX,
      anim: p.anim,
      inv: p.invulnerable,
      alive: p.alive,
      xp: p.xp,
      level: p.level,
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
  for (const [id, g] of room.xpGems) {
    gems.push([id, Math.round(g.x), Math.round(g.y)]);
  }

  const potions = [];
  for (const [id, h] of room.healthPotions) {
    potions.push([id, Math.round(h.x), Math.round(h.y)]);
  }

  const flames = [];
  for (const [id, f] of room.flames) {
    flames.push([id, Math.round(f.x), Math.round(f.y)]);
  }

  const tornados = [];
  for (const [id, t] of room.tornados) {
    tornados.push([id, Math.round(t.x), Math.round(t.y)]);
  }

  const swarms = [];
  for (const [pid, player] of room.players) {
    for (const weapon of player.weapons) {
      if (weapon.type === 'bugSwarm' && weapon.swarms) {
        for (const s of weapon.swarms) {
          swarms.push([Math.round(s.x), Math.round(s.y)]);
        }
      }
    }
  }

  const pots = room.pots.filter((p) => p.alive).map((p) => [p.id, Math.round(p.x), Math.round(p.y)]);

  return {
    type: 'state',
    p: players,
    e: enemies,
    pr: projectiles,
    g: gems,
    h: potions,
    fl: flames,
    tn: tornados,
    sw: swarms,
    pt: pots,
    tm: Math.round(room.timer.remaining),
    k: room.killCount,
  };
}
