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

    // IP input field (Phaser text as visual display)
    this.ipInput = this.add.text(380, 235, '192.168.1.', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#333355',
      padding: { x: 12, y: 8 },
      fixedWidth: 200,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Hidden HTML input for mobile keyboard support
    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'text';
    this.hiddenInput.inputMode = 'url';
    this.hiddenInput.value = '192.168.1.';
    this.hiddenInput.autocomplete = 'off';
    this.hiddenInput.autocorrect = 'off';
    this.hiddenInput.autocapitalize = 'off';
    this.hiddenInput.spellcheck = false;
    Object.assign(this.hiddenInput.style, {
      position: 'fixed',
      top: '-1000px',
      left: '0',
      opacity: '0',
      fontSize: '16px',
      width: '1px',
      height: '1px',
      border: 'none',
      outline: 'none',
      background: 'transparent',
    });
    document.body.appendChild(this.hiddenInput);

    // Sync hidden input to Phaser text display
    this.hiddenInput.addEventListener('input', () => {
      const filtered = this.hiddenInput.value.replace(/[^0-9.:]/g, '');
      if (filtered !== this.hiddenInput.value) {
        this.hiddenInput.value = filtered;
      }
      this.updateInputDisplay();
    });

    this.hiddenInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.hiddenInput.blur();
        if (!this.joined) {
          this.connectTo(this.hiddenInput.value.trim());
        }
      }
    });

    // Tap IP field to focus hidden input (triggers mobile keyboard)
    this.ipInput.on('pointerdown', (pointer, localX, localY, event) => {
      if (event) event.stopPropagation();
      this.hiddenInput.focus();
    });

    // Focus/blur visual feedback
    this.hiddenInput.addEventListener('focus', () => {
      this.ipInput.setStyle({ backgroundColor: '#444477' });
    });
    this.hiddenInput.addEventListener('blur', () => {
      this.ipInput.setStyle({ backgroundColor: '#333355' });
      this.updateInputDisplay();
    });

    // Blinking cursor
    this.cursorVisible = true;
    this.cursorTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateInputDisplay();
      },
    });

    // Dismiss keyboard when tapping outside the input field
    this.input.on('pointerdown', (pointer) => {
      const bounds = this.ipInput.getBounds();
      if (!bounds.contains(pointer.x, pointer.y)) {
        this.hiddenInput.blur();
      }
    });

    // Prevent iOS scroll displacement when keyboard opens in landscape
    this.viewportHandler = () => window.scrollTo(0, 0);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.viewportHandler);
    }

    // Join button
    this.joinBtn = this.createButton(540, 235, 'JOIN', '#44aaff', () => {
      this.hiddenInput.blur();
      this.connectTo(this.hiddenInput.value.trim());
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

    // Cleanup DOM on scene exit
    this.events.on('shutdown', () => {
      if (this.hiddenInput && this.hiddenInput.parentNode) {
        this.hiddenInput.parentNode.removeChild(this.hiddenInput);
        this.hiddenInput = null;
      }
      if (this.cursorTimer) {
        this.cursorTimer.destroy();
        this.cursorTimer = null;
      }
      if (this.viewportHandler && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', this.viewportHandler);
      }
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

  updateInputDisplay() {
    if (!this.hiddenInput) return;
    const val = this.hiddenInput.value;
    const isFocused = document.activeElement === this.hiddenInput;
    const cursor = (isFocused && this.cursorVisible) ? '|' : '';
    this.ipInput.setText(val + cursor);
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
