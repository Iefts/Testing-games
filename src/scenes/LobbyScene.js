import Phaser from 'phaser';
import { CHARACTERS } from '../config/Characters.js';
import { NetworkManager } from '../systems/NetworkManager.js';

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super('Lobby');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.network = new NetworkManager();
    this.game.registry.set('network', this.network);

    this.selectedCharacter = 'human';
    this.lobbyPlayers = [];
    this.lobbyElements = [];
    this.joined = false;

    // Title
    this.add.text(480, 40, 'MULTIPLAYER', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Host button
    this.hostBtn = this.createButton(340, 130, 'HOST GAME', '#44cc44', () => {
      this.connectTo('localhost');
    });

    // Join section
    this.add.text(480, 200, 'OR JOIN:', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // IP input field (using DOM element)
    this.ipInput = this.add.text(380, 235, '192.168.1.', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#333355',
      padding: { x: 12, y: 8 },
      fixedWidth: 200,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Keyboard input for IP
    this.input.keyboard.on('keydown', (event) => {
      if (!this.joined) {
        const current = this.ipInput.text;
        if (event.key === 'Backspace') {
          this.ipInput.setText(current.slice(0, -1));
        } else if (event.key.length === 1 && (event.key.match(/[0-9.]/) || event.key === ':')) {
          this.ipInput.setText(current + event.key);
        } else if (event.key === 'Enter') {
          this.connectTo(this.ipInput.text.trim());
        }
      }
    });

    // Join button
    this.joinBtn = this.createButton(540, 235, 'JOIN', '#44aaff', () => {
      this.connectTo(this.ipInput.text.trim());
    });

    // Character selection (shown after connecting)
    this.charSelectGroup = [];
    this.statusText = this.add.text(480, 310, '', {
      fontSize: '16px',
      color: '#ffdd44',
    }).setOrigin(0.5);

    // Players list
    this.playersText = this.add.text(480, 380, '', {
      fontSize: '14px',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);

    // Start button (host only, hidden initially)
    this.startBtn = this.createButton(480, 470, 'START GAME', '#44cc44', () => {
      this.network.sendStartGame();
    });
    this.startBtn.setVisible(false);

    // Back button
    this.createButton(80, 500, 'BACK', '#cc4444', () => {
      this.network.disconnect();
      this.scene.start('Menu');
    });

    // Network callbacks
    this.network.onLobbyUpdate = (msg) => this.updateLobby(msg);
    this.network.onGameStart = (msg) => this.startMultiplayerGame(msg);
    this.network.onError = (err) => {
      this.statusText.setText('Connection failed! Check IP and try again.');
      this.statusText.setColor('#ff4444');
    };
    this.network.onDisconnect = () => {
      if (this.scene.isActive('Lobby')) {
        this.statusText.setText('Disconnected from server.');
        this.statusText.setColor('#ff4444');
        this.joined = false;
      }
    };
  }

  async connectTo(host) {
    this.statusText.setText('Connecting...');
    this.statusText.setColor('#ffdd44');

    try {
      await this.network.connect(host);
      this.joined = true;
      this.statusText.setText(`Connected! Your ID: ${this.network.myId}`);
      this.statusText.setColor('#44cc44');

      // Auto-join with selected character
      this.network.sendJoin(this.selectedCharacter);

      // Show character selection
      this.showCharacterSelect();
    } catch (e) {
      this.statusText.setText('Failed to connect. Is the server running?');
      this.statusText.setColor('#ff4444');
    }
  }

  showCharacterSelect() {
    // Clear old
    this.charSelectGroup.forEach((el) => el.destroy());
    this.charSelectGroup = [];

    const chars = Object.values(CHARACTERS);
    const startX = 480 - (chars.length - 1) * 80;

    chars.forEach((char, i) => {
      const x = startX + i * 160;
      const y = 310;

      const isSelected = char.id === this.selectedCharacter;
      const border = this.add.rectangle(x, y, 60, 60,
        isSelected ? 0x44cc44 : 0x333355
      ).setStrokeStyle(2, isSelected ? 0x66ff66 : 0x666688)
        .setInteractive({ useHandCursor: true });

      const icon = this.add.sprite(x, y, char.spriteSheet, 0).setScale(3);
      const label = this.add.text(x, y + 42, char.name, {
        fontSize: '12px',
        color: '#ffffff',
      }).setOrigin(0.5);

      border.on('pointerdown', () => {
        this.selectedCharacter = char.id;
        this.network.sendChangeCharacter(char.id);
        this.showCharacterSelect(); // refresh
      });

      this.charSelectGroup.push(border, icon, label);
    });
  }

  updateLobby(msg) {
    this.lobbyPlayers = msg.players;
    const lines = msg.players.map((p) => {
      const host = p.isHost ? ' (HOST)' : '';
      const you = p.id === this.network.myId ? ' (YOU)' : '';
      const charName = CHARACTERS[p.characterId]?.name || p.characterId;
      return `${p.id}${host}${you} - ${charName}`;
    });
    this.playersText.setText('Players:\n' + lines.join('\n'));

    // Show start button for host when at least 1 player
    this.startBtn.setVisible(this.network.isHost && msg.players.length >= 1);
  }

  startMultiplayerGame(msg) {
    this.registry.set('gameStartData', msg);
    this.scene.start('MultiplayerGame');
  }

  createButton(x, y, text, color, onClick) {
    const btn = this.add.text(x, y, text, {
      fontSize: '20px',
      color: color,
      fontStyle: 'bold',
      backgroundColor: '#333355',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setBackgroundColor('#444466'));
    btn.on('pointerout', () => btn.setBackgroundColor('#333355'));
    btn.on('pointerdown', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      onClick();
    });
    return btn;
  }
}
