import Phaser from 'phaser';
import { CHARACTERS } from '../config/Characters.js';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(480, 28, 'SELECT CHARACTER', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Weapon sprite key mapping
    const weaponSpriteMap = {
      revolver: 'bullet',
      rapier: 'rapier',
      cardDeck: 'card_spade',
      bloodOrb: 'bloodOrb',
      snakeSword: 'snakeSword',
      laserDrones: 'drone',
    };

    const charIds = Object.keys(CHARACTERS);
    this.charIds = charIds;
    this.selectedIndex = 0;
    this.cards = [];
    this.cardElements = [];

    // Layout: compact cards in a horizontal row
    const cardW = 130;
    const cardH = 160;
    const gap = 12;
    const cols = charIds.length;
    const totalW = cols * cardW + (cols - 1) * gap;
    const startX = 480 - totalW / 2 + cardW / 2;
    const cardY = 180;

    charIds.forEach((id, i) => {
      const char = CHARACTERS[id];
      const cx = startX + i * (cardW + gap);
      const elements = {};

      // Card background
      elements.card = this.add.rectangle(cx, cardY, cardW, cardH, 0x222244, 0.9)
        .setStrokeStyle(2, 0x6666aa)
        .setInteractive({ useHandCursor: true });

      // Character sprite
      elements.sprite = this.add.sprite(cx - 14, cardY - 38, char.sprite).setScale(4);

      // Weapon sprite beside character
      const weaponKey = weaponSpriteMap[char.startingWeapon];
      if (weaponKey) {
        elements.weapon = this.add.sprite(cx + 28, cardY - 38, weaponKey).setScale(3);
        // Angle the rapier diagonally so it fits within the card
        if (char.startingWeapon === 'rapier' || char.startingWeapon === 'snakeSword') {
          elements.weapon.setRotation(Math.PI / 4);
          elements.weapon.setPosition(cx + 24, cardY - 28);
          elements.weapon.setScale(2.5);
        }
      }

      // Name
      elements.name = this.add.text(cx, cardY + 16, char.name, {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Stats
      elements.stats = this.add.text(cx, cardY + 36, `HP:${char.hp}  SPD:${char.speed}`, {
        fontSize: '10px',
        color: '#aaaacc',
      }).setOrigin(0.5);

      // Weapon name
      const weaponName = char.startingWeapon.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
      elements.weaponText = this.add.text(cx, cardY + 52, weaponName, {
        fontSize: '9px',
        color: '#8888bb',
      }).setOrigin(0.5);

      // Mouse interaction
      elements.card.on('pointerover', () => {
        this.selectIndex(i);
      });

      elements.card.on('pointerdown', () => {
        this.confirmSelection();
      });

      this.cards.push(elements.card);
      this.cardElements.push({ elements, char, id });
    });

    // Preview area — below the cards, sprite on left, text on right
    this.previewSprite = null;
    this.previewBg = this.add.rectangle(480, 390, 340, 130, 0x111133, 0.7)
      .setStrokeStyle(1, 0x444466);

    this.previewName = this.add.text(510, 355, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.previewStats = this.add.text(510, 410, '', {
      fontSize: '13px',
      color: '#aaaacc',
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(20);

    // Controls hint
    this.add.text(480, 500, 'A/D or ←/→ to browse   ENTER/SPACE to select', {
      fontSize: '12px',
      color: '#555577',
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(40, 500, '← BACK', {
      fontSize: '16px',
      color: '#aa6666',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ff8888'));
    backBtn.on('pointerout', () => backBtn.setColor('#aa6666'));
    backBtn.on('pointerdown', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Menu');
    });

    // Keyboard navigation
    this.input.keyboard.on('keydown-LEFT', () => this.navigate(-1));
    this.input.keyboard.on('keydown-A', () => this.navigate(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.navigate(1));
    this.input.keyboard.on('keydown-D', () => this.navigate(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard.on('keydown-ESC', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Menu');
    });

    // Select first character
    this.selectIndex(0);
  }

  navigate(dir) {
    this.sound.play('sfx_buttonClick', { volume: 0.2 });
    const next = Phaser.Math.Wrap(this.selectedIndex + dir, 0, this.charIds.length);
    this.selectIndex(next);
  }

  selectIndex(index) {
    this.selectedIndex = index;

    // Update card highlights
    this.cardElements.forEach(({ elements }, i) => {
      if (i === index) {
        elements.card.setStrokeStyle(3, 0xaaaaff);
        elements.card.setFillStyle(0x333366, 1);
      } else {
        elements.card.setStrokeStyle(2, 0x6666aa);
        elements.card.setFillStyle(0x222244, 0.9);
      }
    });

    // Update preview
    const { char } = this.cardElements[index];

    if (this.previewSprite) {
      this.previewSprite.destroy();
    }

    this.previewSprite = this.add.sprite(380, 390, char.spriteSheet, 0)
      .setScale(8)
      .setDepth(15);
    this.previewSprite.play(`${char.animPrefix}_walk`);

    this.previewName.setText(char.name);

    const weaponName = char.startingWeapon.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
    this.previewStats.setText(
      `HP: ${char.hp}    Speed: ${char.speed}\nWeapon: ${weaponName}`
    );
  }

  confirmSelection() {
    this.sound.play('sfx_buttonClick', { volume: 0.4 });
    this.registry.set('character', this.charIds[this.selectedIndex]);
    this.scene.start('LevelSelect');
  }
}
