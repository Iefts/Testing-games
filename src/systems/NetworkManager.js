import { roomCodeToIP } from '../utils/RoomCode.js';

export class NetworkManager {
  constructor() {
    this.ws = null;
    this.myId = null;
    this.isHost = false;
    this.roomCode = null;
    this.connected = false;
    this.latestState = null;
    this.eventQueue = [];

    // Callbacks set by scenes
    this.onLobbyUpdate = null;
    this.onGameStart = null;
    this.onLevelUp = null;
    this.onGameOver = null;
    this.onUpgradeApplied = null;
    this.onDisconnect = null;
    this.onError = null;
  }

  connect(host, port = 3000) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`ws://${host}:${port}`);
      } catch (e) {
        reject(e);
        return;
      }

      this.ws.onopen = () => {
        this.connected = true;
        resolve();
      };

      this.ws.onerror = (err) => {
        if (!this.connected) {
          reject(new Error('Connection failed'));
        }
        if (this.onError) this.onError(err);
      };

      this.ws.onclose = () => {
        this.connected = false;
        if (this.onDisconnect) this.onDisconnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          // ignore
        }
      };
    });
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'yourId':
        this.myId = msg.id;
        this.isHost = msg.isHost;
        this.roomCode = msg.roomCode || null;
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
        if (msg.ev) {
          this.eventQueue.push(...msg.ev);
        }
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

  send(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  sendJoin(characterId) {
    this.send({ type: 'join', characterId });
  }

  sendChangeCharacter(characterId) {
    this.send({ type: 'changeCharacter', characterId });
  }

  sendStartGame() {
    this.send({ type: 'startGame' });
  }

  connectWithCode(code, port = 3000) {
    const ip = roomCodeToIP(code);
    if (!ip) return Promise.reject(new Error('Invalid room code'));
    return this.connect(ip, port);
  }

  sendInput(x, y) {
    this.send({ type: 'input', x, y });
  }

  sendSelectUpgrade(upgradeId, isRare) {
    this.send({ type: 'selectUpgrade', upgradeId, isRare });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.myId = null;
    this.latestState = null;
    this.eventQueue = [];
  }
}
