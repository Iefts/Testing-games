import { WebSocketServer } from 'ws';
import os from 'os';
import { createRoom, createPlayer, initWorld, tick, buildStateSnapshot, applyUpgradeToPlayer } from './ServerGameLoop.js';

const PORT = 3000;
const TICK_RATE = 60;
const BROADCAST_RATE = 60;
const TICK_MS = 1000 / TICK_RATE;
const BROADCAST_MS = 1000 / BROADCAST_RATE;
const MAX_PLAYERS = 2;

const room = createRoom();
const clients = new Map(); // ws -> { id, ready }

let gameInterval = null;
let lastTick = Date.now();
let lastBroadcast = 0;

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  if (room.state === 'playing') {
    ws.send(JSON.stringify({ type: 'error', message: 'Game already in progress' }));
    ws.close();
    return;
  }

  if (clients.size >= MAX_PLAYERS) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room is full (max 2 players)' }));
    ws.close();
    return;
  }

  const playerId = `p${room.nextId++}`;
  clients.set(ws, { id: playerId, ready: false });

  // First connection becomes host
  if (!room.hostId) {
    room.hostId = playerId;
  }

  ws.send(JSON.stringify({ type: 'yourId', id: playerId, isHost: playerId === room.hostId }));
  broadcastLobby();

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      handleMessage(ws, msg);
    } catch (e) {
      // ignore bad messages
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      clients.delete(ws);
      room.players.delete(client.id);

      if (room.state === 'lobby') {
        // If host left, assign new host
        if (client.id === room.hostId) {
          const next = clients.entries().next().value;
          room.hostId = next ? next[1].id : null;
        }
        broadcastLobby();
      }

      // If no players left during game, reset
      if (clients.size === 0) {
        stopGame();
        Object.assign(room, createRoom());
      }
    }
  });
});

function handleMessage(ws, msg) {
  const client = clients.get(ws);
  if (!client) return;

  switch (msg.type) {
    case 'join': {
      const charId = msg.characterId || 'human';
      const player = createPlayer(room, client.id, charId);
      room.players.set(client.id, player);
      client.characterId = charId;
      broadcastLobby();
      break;
    }

    case 'changeCharacter': {
      const charId = msg.characterId || 'human';
      client.characterId = charId;
      const existing = room.players.get(client.id);
      if (existing) {
        const player = createPlayer(room, client.id, charId);
        room.players.set(client.id, player);
      }
      broadcastLobby();
      break;
    }

    case 'startGame': {
      if (client.id !== room.hostId) return;
      if (room.players.size < 1) return;
      startGame();
      break;
    }

    case 'input': {
      const player = room.players.get(client.id);
      if (player && player.alive) {
        player.input.x = clampInput(msg.x);
        player.input.y = clampInput(msg.y);
      }
      break;
    }

    case 'selectUpgrade': {
      const player = room.players.get(client.id);
      if (player && player.pendingLevelUp) {
        const upgradeId = msg.upgradeId;
        const isRare = msg.isRare || false;
        applyUpgradeToPlayer(room, player, upgradeId, isRare);
        broadcast(JSON.stringify({
          type: 'upgradeApplied',
          playerId: client.id,
          upgradeId,
          level: player.upgradeManager.getLevel(upgradeId),
          upgrades: player.upgradeManager.acquired,
        }));
      }
      break;
    }

    case 'emote': {
      const emoteId = msg.emoteId;
      if (typeof emoteId === 'number' && emoteId >= 0 && emoteId <= 5) {
        broadcast(JSON.stringify({
          type: 'emote',
          playerId: client.id,
          emoteId,
        }));
      }
      break;
    }
  }
}

function clampInput(val) {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  return Math.max(-1, Math.min(1, val));
}

function startGame() {
  room.state = 'playing';
  initWorld(room);

  broadcast(JSON.stringify({
    type: 'gameStart',
    trees: room.trees,
    pots: room.pots.map((p) => ({ id: p.id, x: p.x, y: p.y })),
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      characterId: p.characterId,
      x: p.x,
      y: p.y,
    })),
  }));

  lastTick = Date.now();
  lastBroadcast = Date.now();

  gameInterval = setInterval(() => {
    const now = Date.now();
    const dt = (now - lastTick) / 1000;
    lastTick = now;

    tick(room, dt, now);

    // Process level-up events (send to specific player)
    const events = room.events.filter((e) => e.type === 'levelUp');
    for (const event of events) {
      const ws = findWsByPlayerId(event.playerId);
      if (ws) {
        ws.send(JSON.stringify({
          type: 'levelUp',
          playerId: event.playerId,
          level: event.level,
          choices: event.choices,
        }));
      }
    }

    // Check game over
    const gameOver = room.events.find((e) => e.type === 'gameOver');
    if (gameOver) {
      const elapsed = room.timer.elapsed;
      const mins = Math.floor(elapsed / 60);
      const secs = Math.floor(elapsed % 60);
      broadcast(JSON.stringify({
        type: 'gameOver',
        victory: gameOver.victory,
        stats: {
          time: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
          kills: room.killCount,
        },
      }));
      stopGame();
      return;
    }

    // Send gameplay events immediately (damage, weapon fired, deaths)
    const gameplayEvents = room.events.filter((e) =>
      e.type !== 'levelUp' && e.type !== 'gameOver'
    );
    if (gameplayEvents.length > 0) {
      broadcast(JSON.stringify({ type: 'events', ev: gameplayEvents }));
    }

    // Broadcast state at BROADCAST_RATE
    if (now - lastBroadcast >= BROADCAST_MS) {
      const snapshot = buildStateSnapshot(room);
      broadcast(JSON.stringify(snapshot));
      lastBroadcast = now;
    }
  }, TICK_MS);
}

function stopGame() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
}

function findWsByPlayerId(playerId) {
  for (const [ws, client] of clients) {
    if (client.id === playerId) return ws;
  }
  return null;
}

function broadcast(data) {
  for (const [ws] of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  }
}

function broadcastLobby() {
  const players = [];
  for (const [ws, client] of clients) {
    players.push({
      id: client.id,
      characterId: client.characterId || 'human',
      isHost: client.id === room.hostId,
    });
  }
  broadcast(JSON.stringify({
    type: 'lobbyState',
    players,
    hostId: room.hostId,
  }));
}

// Print LAN IP
function getLanIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const lanIP = getLanIP();
console.log('========================================');
console.log(`  Survivor Co-op Server`);
console.log(`  WebSocket: ws://${lanIP}:${PORT}`);
console.log(`  Share this IP with Player 2: ${lanIP}`);
console.log(`  Max players: ${MAX_PLAYERS}`);
console.log('========================================');
