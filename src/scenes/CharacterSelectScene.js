import Phaser from 'phaser';
import { CHARACTERS } from '../config/Characters.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { COSMETICS, getCosmeticsForCharacter } from '../config/Cosmetics.js';
import { PASS_REWARDS } from '../config/PassRewards.js';

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
      const isUnlocked = SaveSystem.isCharacterUnlocked(id);

      // Card background
      const bgColor = isUnlocked ? 0x222244 : 0x1a1a22;
      elements.card = this.add.rectangle(cx, cardY, cardW, cardH, bgColor, 0.9)
        .setStrokeStyle(2, isUnlocked ? 0x6666aa : 0x333344);

      if (isUnlocked) {
        // Character sprite
        elements.sprite = this.add.sprite(cx - 14, cardY - 38, char.sprite).setScale(4);

        // Weapon sprite beside character
        const weaponKey = weaponSpriteMap[char.startingWeapon];
        if (weaponKey) {
          elements.weapon = this.add.sprite(cx + 28, cardY - 38, weaponKey).setScale(3);
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

        // Cosmetic indicator
        const equipped = SaveSystem.getEquippedCosmetic(id);
        if (equipped) {
          const cos = COSMETICS[equipped];
          if (cos) {
            this.add.text(cx, cardY + 66, cos.name, {
              fontSize: '8px',
              color: '#ffaa44',
            }).setOrigin(0.5);
          }
        }

        // Mouse interaction
        elements.card.setInteractive({ useHandCursor: true });
        elements.card.on('pointerover', () => {
          this.selectIndex(i);
        });
        elements.card.on('pointerdown', () => {
          this.confirmSelection();
        });
      } else {
        // Locked state
        this.add.sprite(cx, cardY - 20, 'icon_lock').setScale(4);

        // Find unlock level
        const unlockLevel = this.getUnlockLevel('character', id);
        this.add.text(cx, cardY + 16, char.name, {
          fontSize: '13px',
          color: '#555566',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(cx, cardY + 36, `Unlocks at Lv.${unlockLevel}`, {
          fontSize: '10px',
          color: '#666677',
        }).setOrigin(0.5);
      }

      this.cards.push(elements.card);
      this.cardElements.push({ elements, char, id, isUnlocked });
    });

    // Preview area
    this.previewSprite = null;
    this.previewBg = this.add.rectangle(480, 380, 400, 130, 0x111133, 0.7)
      .setStrokeStyle(1, 0x444466);

    this.previewName = this.add.text(510, 345, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.previewStats = this.add.text(510, 400, '', {
      fontSize: '13px',
      color: '#aaaacc',
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(20);

    // Cosmetic toggle area
    this.cosmeticText = this.add.text(680, 345, '', {
      fontSize: '11px',
      color: '#ffaa44',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(20);

    this.cosmeticToggle = this.add.text(680, 365, '', {
      fontSize: '11px',
      color: '#8888bb',
      lineSpacing: 4,
    }).setOrigin(0, 0).setDepth(20);

    this.cosmeticButtons = [];

    // Controls hint
    this.add.text(480, 495, 'A/D or arrows to browse   ENTER/SPACE to select   C to cycle cosmetics', {
      fontSize: '10px',
      color: '#555577',
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(40, 500, '< BACK', {
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
    this.input.keyboard.on('keydown-C', () => this.cycleCosmetic());
    this.input.keyboard.on('keydown-ESC', () => {
      this.sound.play('sfx_buttonClick', { volume: 0.4 });
      this.scene.start('Menu');
    });

    // Select first unlocked character
    const firstUnlocked = this.cardElements.findIndex(e => e.isUnlocked);
    this.selectIndex(firstUnlocked >= 0 ? firstUnlocked : 0);
  }

  getUnlockLevel(type, id) {
    for (const [level, reward] of Object.entries(PASS_REWARDS)) {
      if (type === 'character' && reward.type === 'character' && reward.characterId === id) return level;
      if (type === 'level' && reward.type === 'level' && reward.levelId === id) return level;
    }
    return '?';
  }

  navigate(dir) {
    this.sound.play('sfx_buttonClick', { volume: 0.2 });
    const next = Phaser.Math.Wrap(this.selectedIndex + dir, 0, this.charIds.length);
    this.selectIndex(next);
  }

  selectIndex(index) {
    this.selectedIndex = index;

    // Update card highlights
    this.cardElements.forEach(({ elements, isUnlocked }, i) => {
      if (i === index && isUnlocked) {
        elements.card.setStrokeStyle(3, 0xaaaaff);
        elements.card.setFillStyle(0x333366, 1);
      } else {
        elements.card.setStrokeStyle(2, isUnlocked ? 0x6666aa : 0x333344);
        elements.card.setFillStyle(isUnlocked ? 0x222244 : 0x1a1a22, 0.9);
      }
    });

    const { char, id, isUnlocked } = this.cardElements[index];

    // Update preview
    if (this.previewSprite) {
      this.previewSprite.destroy();
    }

    if (isUnlocked) {
      // Check for equipped cosmetic
      const equippedId = SaveSystem.getEquippedCosmetic(id);
      const cosmetic = equippedId ? COSMETICS[equippedId] : null;
      const sheetKey = (cosmetic && cosmetic.type === 'palette') ? cosmetic.sheetKey : char.spriteSheet;
      const animPrefix = (cosmetic && cosmetic.type === 'palette') ? cosmetic.animPrefix : char.animPrefix;

      this.previewSprite = this.add.sprite(360, 380, sheetKey, 0)
        .setScale(8)
        .setDepth(15);

      // Check if animation exists, fall back to base if not
      if (this.anims.exists(`${animPrefix}_walk`)) {
        this.previewSprite.play(`${animPrefix}_walk`);
      } else {
        this.previewSprite.play(`${char.animPrefix}_walk`);
      }

      this.previewName.setText(char.name);
      const weaponName = char.startingWeapon.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
      this.previewStats.setText(`HP: ${char.hp}    Speed: ${char.speed}\nWeapon: ${weaponName}`);

      // Update cosmetic info
      this.updateCosmeticDisplay(id);
    } else {
      this.previewSprite = null;
      this.previewName.setText(char.name + ' (LOCKED)');
      this.previewStats.setText(`Unlocks at Lv.${this.getUnlockLevel('character', id)}`);
      this.cosmeticText.setText('');
      this.cosmeticToggle.setText('');
    }
  }

  updateCosmeticDisplay(characterId) {
    const cosmetics = getCosmeticsForCharacter(characterId);
    const unlocked = cosmetics.filter(c => SaveSystem.isCosmeticUnlocked(c.id));
    const equipped = SaveSystem.getEquippedCosmetic(characterId);

    // Clean up old buttons
    this.cosmeticButtons.forEach(b => b.destroy());
    this.cosmeticButtons = [];

    if (unlocked.length === 0) {
      this.cosmeticText.setText('No cosmetics');
      this.cosmeticToggle.setText('');
      return;
    }

    this.cosmeticText.setText('Cosmetics:');

    let y = 365;
    unlocked.forEach(cos => {
      const isEquipped = equipped === cos.id;
      const label = isEquipped ? `[ON] ${cos.name}` : `[OFF] ${cos.name}`;
      const color = isEquipped ? '#ffaa44' : '#666688';

      const btn = this.add.text(680, y, label, {
        fontSize: '10px',
        color,
      }).setOrigin(0, 0).setDepth(20).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        if (isEquipped) {
          SaveSystem.equipCosmetic(characterId, null);
        } else {
          SaveSystem.equipCosmetic(characterId, cos.id);
        }
        this.sound.play('sfx_buttonClick', { volume: 0.3 });
        this.selectIndex(this.selectedIndex); // Refresh
      });

      this.cosmeticButtons.push(btn);
      y += 18;
    });
  }

  cycleCosmetic() {
    const { id, isUnlocked } = this.cardElements[this.selectedIndex];
    if (!isUnlocked) return;

    const cosmetics = getCosmeticsForCharacter(id);
    const unlocked = cosmetics.filter(c => SaveSystem.isCosmeticUnlocked(c.id));
    if (unlocked.length === 0) return;

    const current = SaveSystem.getEquippedCosmetic(id);
    const currentIdx = unlocked.findIndex(c => c.id === current);

    if (currentIdx === -1) {
      // Nothing equipped, equip first
      SaveSystem.equipCosmetic(id, unlocked[0].id);
    } else if (currentIdx === unlocked.length - 1) {
      // Last one, unequip
      SaveSystem.equipCosmetic(id, null);
    } else {
      // Next one
      SaveSystem.equipCosmetic(id, unlocked[currentIdx + 1].id);
    }

    this.sound.play('sfx_buttonClick', { volume: 0.3 });
    this.selectIndex(this.selectedIndex);
  }

  confirmSelection() {
    const { isUnlocked } = this.cardElements[this.selectedIndex];
    if (!isUnlocked) {
      // Play error sound or flash
      this.cameras.main.shake(50, 0.002);
      return;
    }

    this.sound.play('sfx_buttonClick', { volume: 0.4 });
    this.registry.set('character', this.charIds[this.selectedIndex]);
    this.scene.start('LevelSelect');
  }
}
