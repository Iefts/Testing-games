import Peer from 'peerjs';
import { createRoom, createPlayer, initWorld, tick, buildStateSnapshot, applyUpgradeToPlayer } from './HostGameLoop.js';

const TICK_RATE = 60;
const BROADCAST_RATE = 60;
const TICK_MS = 1000 / TICK_RATE;
const BROADCAST_MS = 1000 / BROADCAST_RATE;
const MAX_PLAYERS = 4;

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I or O to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export class PeerManager {
  constructor() {
    this.peer = null;
    this.myId = null;
    this.isHost = false;
    this.roomCode = null;
    this.connected = false;
    this.latestState = null;
    this.eventQueue = [];

    // Host state
    this.room = null;
    this.clients = new Map(); // peerId -> { conn, id, characterId }
    this.gameInterval = null;
    this.lastTick = 0;
    this.lastBroadcast = 0;

    // Client state
    this.hostConn = null;

    // Callbacks set by scenes
    this.onLobbyUpdate = null;
    this.onGameStart = null;
    this.onLevelUp = null;
    this.onGameOver = null;
    this.onUpgradeApplied = null;
    this.onDisconnect = null;
    this.onError = null;
  }

  // --- HOST ---

  host() {
    return new Promise((resolve, reject) => {
      this.isHost = true;
      this.roomCode = generateRoomCode();

      // Use room code as prefix for the peer ID to make it findable
      const peerId = `rls-${this.roomCode}`;

      this.peer = new Peer(peerId, {
        debug: 0,
      });

      const timeout = setTimeout(() => {
        reject(new Error('Timed out connecting to signaling server'));
      }, 10000);

      this.peer.on('open', (id) => {
        clearTimeout(timeout);
        this.myId = 'p1';
        this.connected = true;

        // Create room
        this.room = createRoom();
        this.room.hostId = this.myId;

        // Host joins as player
        const player = createPlayer(this.room, this.myId, 'human');
        this.room.players.set(this.myId, player);

        // Listen for incoming connections
        this.peer.on('connection', (conn) => this._onClientConnect(conn));
        this.peer.on('error', (err) => {
          if (err.type === 'unavailable-id') {
            // Room code collision — regenerate
            this.peer.destroy();
            this.roomCode = generateRoomCode();
            this.host().then(resolve).catch(reject);
          } else if (this.onError) {
            this.onError(err);
          }
        });

        resolve();
      });

      this.peer.on('error', (err) => {
        clearTimeout(timeout);
        if (!this.connected) {
          reject(err);
        }
      });
    });
  }

  _onClientConnect(conn) {
    if (this.room.state === 'playing') {
      conn.on('open', () => {
        conn.send({ type: 'error', message: 'Game already in progress' });
        setTimeout(() => conn.close(), 100);
      });
      return;
    }

    if (this.clients.size + 1 >= MAX_PLAYERS) {
      conn.on('open', () => {
        conn.send({ type: 'error', message: `Room is full (max ${MAX_PLAYERS})` });
        setTimeout(() => conn.close(), 100);
      });
      return;
    }

    conn.on('open', () => {
      const playerId = `p${this.room.nextId++}`;
      this.clients.set(conn.peer, { conn, id: playerId, characterId: 'human' });

      conn.send({ type: 'yourId', id: playerId, isHost: false });
      this._broadcastLobby();

      conn.on('data', (msg) => {
        this._handleClientMessage(conn.peer, msg);
      });

      conn.on('close', () => {
        const client = this.clients.get(conn.peer);
        if (client) {
          this.room.players.delete(client.id);
          this.clients.delete(conn.peer);
          if (this.room.state === 'lobby') {
            this._broadcastLobby();
          }
        }
      });
    });
  }

  _handleClientMessage(peerId, msg) {
    const client = this.clients.get(peerId);
    if (!client) return;

    switch (msg.type) {
      case 'join': {
        const charId = msg.characterId || 'human';
        client.characterId = charId;
        const player = createPlayer(this.room, client.id, charId);
        this.room.players.set(client.id, player);
        this._broadcastLobby();
        break;
      }

      case 'changeCharacter': {
        const charId = msg.characterId || 'human';
        client.characterId = charId;
        const existing = this.room.players.get(client.id);
        if (existing) {
          const player = createPlayer(this.room, client.id, charId);
          this.room.players.set(client.id, player);
        }
        this._broadcastLobby();
        break;
      }

      case 'input': {
        const player = this.room.players.get(client.id);
        if (player && player.alive) {
          player.input.x = clampInput(msg.x);
          player.input.y = clampInput(msg.y);
        }
        break;
      }

      case 'selectUpgrade': {
        const player = this.room.players.get(client.id);
        if (player && player.pendingLevelUp) {
          applyUpgradeToPlayer(this.room, player, msg.upgradeId, msg.isRare || false);
          this._broadcast({
            type: 'upgradeApplied',
            playerId: client.id,
            upgradeId: msg.upgradeId,
            level: player.upgradeManager.getLevel(msg.upgradeId),
            upgrades: player.upgradeManager.acquired,
          });
        }
        break;
      }

      case 'emote': {
        if (typeof msg.emoteId === 'number' && msg.emoteId >= 0 && msg.emoteId <= 5) {
          this._broadcast({ type: 'emote', playerId: client.id, emoteId: msg.emoteId });
          // Also deliver to host
          this.eventQueue.push({ type: 'emote', playerId: client.id, emoteId: msg.emoteId });
        }
        break;
      }
    }
  }

  _broadcastLobby() {
    const players = [
      { id: this.myId, characterId: this.room.players.get(this.myId)?.characterId || 'human', isHost: true },
    ];
    for (const [peerId, client] of this.clients) {
      players.push({ id: client.id, characterId: client.characterId, isHost: false });
    }
    this._broadcast({ type: 'lobbyState', players, hostId: this.myId });
    // Also deliver to host locally
    if (this.onLobbyUpdate) this.onLobbyUpdate({ players, hostId: this.myId });
  }

  _broadcast(msg) {
    for (const [peerId, client] of this.clients) {
      if (client.conn.open) {
        client.conn.send(msg);
      }
    }
  }

  _sendToPlayer(playerId, msg) {
    if (playerId === this.myId) {
      // Deliver locally
      this.handleMessage(msg);
      return;
    }
    for (const [peerId, client] of this.clients) {
      if (client.id === playerId && client.conn.open) {
        client.conn.send(msg);
        return;
      }
    }
  }

  startHostGame() {
    if (!this.isHost || this.room.players.size < 1) return;

    this.room.state = 'playing';
    initWorld(this.room);

    const gameStartMsg = {
      type: 'gameStart',
      trees: this.room.trees,
      pots: this.room.pots.map(p => ({ id: p.id, x: p.x, y: p.y })),
      players: [...this.room.players.values()].map(p => ({
        id: p.id, characterId: p.characterId, x: p.x, y: p.y,
      })),
    };

    this._broadcast(gameStartMsg);
    // Also deliver to host
    if (this.onGameStart) this.onGameStart(gameStartMsg);

    this.lastTick = Date.now();
    this.lastBroadcast = Date.now();

    this.gameInterval = setInterval(() => {
      const now = Date.now();
      const dt = (now - this.lastTick) / 1000;
      this.lastTick = now;

      tick(this.room, dt, now);

      // Process level-up events
      const levelUps = this.room.events.filter(e => e.type === 'levelUp');
      for (const event of levelUps) {
        const msg = {
          type: 'levelUp',
          playerId: event.playerId,
          level: event.level,
          choices: event.choices,
        };
        this._sendToPlayer(event.playerId, msg);
        // If it's the host's level-up, deliver locally
        if (event.playerId === this.myId && this.onLevelUp) {
          this.onLevelUp(msg);
        }
      }

      // Check game over
      const gameOver = this.room.events.find(e => e.type === 'gameOver');
      if (gameOver) {
        const elapsed = this.room.timer.elapsed;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        const msg = {
          type: 'gameOver',
          victory: gameOver.victory,
          stats: {
            time: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
            kills: this.room.killCount,
          },
        };
        this._broadcast(msg);
        if (this.onGameOver) this.onGameOver(msg);
        this._stopGame();
        return;
      }

      // Gameplay events (damage, weapon fired, deaths)
      const gameplayEvents = this.room.events.filter(e =>
        e.type !== 'levelUp' && e.type !== 'gameOver'
      );
      if (gameplayEvents.length > 0) {
        this._broadcast({ type: 'events', ev: gameplayEvents });
        // Also deliver to host
        this.eventQueue.push(...gameplayEvents);
      }

      // Broadcast state
      if (now - this.lastBroadcast >= BROADCAST_MS) {
        const snapshot = buildStateSnapshot(this.room);
        this._broadcast(snapshot);
        this.latestState = snapshot;
        this.lastBroadcast = now;
      }
    }, TICK_MS);
  }

  _stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  // --- CLIENT (joining) ---

  join(roomCode) {
    return new Promise((resolve, reject) => {
      this.isHost = false;
      this.roomCode = roomCode.toUpperCase();

      this.peer = new Peer(undefined, {
        debug: 0,
      });

      const timeout = setTimeout(() => {
        reject(new Error('Timed out'));
      }, 10000);

      this.peer.on('open', () => {
        const hostPeerId = `rls-${this.roomCode}`;
        const conn = this.peer.connect(hostPeerId, { reliable: true });

        const connTimeout = setTimeout(() => {
          reject(new Error('Could not connect to host'));
        }, 8000);

        conn.on('open', () => {
          clearTimeout(timeout);
          clearTimeout(connTimeout);
          this.hostConn = conn;
          this.connected = true;

          conn.on('data', (msg) => {
            this.handleMessage(msg);
          });

          conn.on('close', () => {
            this.connected = false;
            if (this.onDisconnect) this.onDisconnect();
          });

          resolve();
        });

        conn.on('error', (err) => {
          clearTimeout(timeout);
          clearTimeout(connTimeout);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        clearTimeout(timeout);
        if (!this.connected) {
          reject(err);
        }
        if (this.onError) this.onError(err);
      });
    });
  }

  // --- SHARED MESSAGE HANDLING ---

  handleMessage(msg) {
    switch (msg.type) {
      case 'yourId':
        this.myId = msg.id;
        this.isHost = msg.isHost || false;
        break;

      case 'lobbyState':
        if (this.onLobbyUpdate) this.onLobbyUpdate(msg);
        break;

      case 'gameStart':
        if (this.onGameStart) this.onGameStart(msg);
        break;

      case 'state':
        this.latestState = msg;
        break;

      case 'events':
        if (msg.ev) this.eventQueue.push(...msg.ev);
        break;

      case 'emote':
        this.eventQueue.push(msg);
        break;

      case 'levelUp':
        if (this.onLevelUp) this.onLevelUp(msg);
        break;

      case 'upgradeApplied':
        if (this.onUpgradeApplied) this.onUpgradeApplied(msg);
        break;

      case 'gameOver':
        if (this.onGameOver) this.onGameOver(msg);
        break;

      case 'error':
        if (this.onError) this.onError(msg.message);
        break;
    }
  }

  drainEvents() {
    const events = this.eventQueue;
    this.eventQueue = [];
    return events;
  }

  // --- SEND METHODS ---

  send(msg) {
    if (this.isHost) {
      // Host handles messages locally
      this._handleHostLocalMessage(msg);
    } else if (this.hostConn && this.hostConn.open) {
      this.hostConn.send(msg);
    }
  }

  _handleHostLocalMessage(msg) {
    switch (msg.type) {
      case 'join': {
        const charId = msg.characterId || 'human';
        const existing = this.room.players.get(this.myId);
        if (existing) {
          const player = createPlayer(this.room, this.myId, charId);
          this.room.players.set(this.myId, player);
        }
        this._broadcastLobby();
        break;
      }
      case 'changeCharacter': {
        const charId = msg.characterId || 'human';
        const existing = this.room.players.get(this.myId);
        if (existing) {
          const player = createPlayer(this.room, this.myId, charId);
          this.room.players.set(this.myId, player);
        }
        this._broadcastLobby();
        break;
      }
      case 'input': {
        const player = this.room.players.get(this.myId);
        if (player && player.alive) {
          player.input.x = clampInput(msg.x);
          player.input.y = clampInput(msg.y);
        }
        break;
      }
      case 'selectUpgrade': {
        const player = this.room.players.get(this.myId);
        if (player && player.pendingLevelUp) {
          applyUpgradeToPlayer(this.room, player, msg.upgradeId, msg.isRare || false);
          this._broadcast({
            type: 'upgradeApplied',
            playerId: this.myId,
            upgradeId: msg.upgradeId,
            level: player.upgradeManager.getLevel(msg.upgradeId),
            upgrades: player.upgradeManager.acquired,
          });
          if (this.onUpgradeApplied) {
            this.onUpgradeApplied({
              playerId: this.myId,
              upgradeId: msg.upgradeId,
            });
          }
        }
        break;
      }
      case 'emote': {
        if (typeof msg.emoteId === 'number') {
          this._broadcast({ type: 'emote', playerId: this.myId, emoteId: msg.emoteId });
          this.eventQueue.push({ type: 'emote', playerId: this.myId, emoteId: msg.emoteId });
        }
        break;
      }
    }
  }

  sendJoin(characterId) {
    this.send({ type: 'join', characterId });
  }

  sendChangeCharacter(characterId) {
    this.send({ type: 'changeCharacter', characterId });
  }

  sendStartGame() {
    if (this.isHost) {
      this.startHostGame();
    }
  }

  sendInput(x, y) {
    this.send({ type: 'input', x, y });
  }

  sendSelectUpgrade(upgradeId, isRare) {
    this.send({ type: 'selectUpgrade', upgradeId, isRare });
  }

  disconnect() {
    this._stopGame();
    if (this.hostConn) {
      this.hostConn.close();
      this.hostConn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connected = false;
    this.myId = null;
    this.latestState = null;
    this.eventQueue = [];
    this.clients.clear();
    this.room = null;
  }
}

function clampInput(val) {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  return Math.max(-1, Math.min(1, val));
}
