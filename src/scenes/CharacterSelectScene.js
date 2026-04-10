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
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // Background particles
    this.particles = [];
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const size = Phaser.Math.Between(1, 2);
      const alpha = 0.05 + Math.random() * 0.15;
      const color = Phaser.Math.RND.pick([0x334477, 0x443366, 0x223355]);
      const p = this.add.rectangle(x, y, size, size, color, alpha);
      p._vy = -0.05 - Math.random() * 0.1;
      p._vx = (Math.random() - 0.5) * 0.15;
      p._baseAlpha = alpha;
      this.particles.push(p);
    }

    // Title with accent
    this.add.rectangle(480, 14, 280, 2, 0x4455aa, 0.3);
    this.add.text(480, 28, 'SELECT CHARACTER', {
      fontSize: '22px',
      color: '#eeeeff',
      fontStyle: 'bold',
      stroke: '#0a0a1a',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.rectangle(480, 44, 200, 1, 0x333366, 0.3);

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

      // Card shadow
      elements.shadow = this.add.rectangle(cx + 2, cardY + 2, cardW, cardH, 0x000000, 0.25);

      // Card background
      const bgColor = isUnlocked ? 0x151533 : 0x0e0e1a;
      elements.card = this.add.rectangle(cx, cardY, cardW, cardH, bgColor, 0.95)
        .setStrokeStyle(2, isUnlocked ? 0x4455aa : 0x222233);

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
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5);

        // Stats
        elements.stats = this.add.text(cx, cardY + 34, `HP:${char.hp}  SPD:${char.speed}`, {
          fontSize: '9px',
          color: '#8899bb',
        }).setOrigin(0.5);

        // Weapon name
        const weaponName = char.startingWeapon.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
        elements.weaponText = this.add.text(cx, cardY + 50, weaponName, {
          fontSize: '8px',
          color: '#6677aa',
        }).setOrigin(0.5);

        // Cosmetic indicator
        const equipped = SaveSystem.getEquippedCosmetic(id);
        if (equipped) {
          const cos = COSMETICS[equipped];
          if (cos) {
            this.add.text(cx, cardY + 66, cos.name, {
              fontSize: '7px',
              color: '#cc8833',
              fontStyle: 'bold',
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
          fontSize: '12px',
          color: '#444455',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(cx, cardY + 36, `Unlocks at Lv.${unlockLevel}`, {
          fontSize: '9px',
          color: '#555566',
        }).setOrigin(0.5);
      }

      this.cards.push(elements.card);
      this.cardElements.push({ elements, char, id, isUnlocked });
    });

    // Preview area
    this.previewSprite = null;

    // Preview panel shadow
    this.add.rectangle(482, 382, 400, 130, 0x000000, 0.25);
    // Preview panel
    this.previewBg = this.add.rectangle(480, 380, 400, 130, 0x0d0d22, 0.85)
      .setStrokeStyle(2, 0x333366);
    // Preview panel header accent
    this.add.rectangle(480, 318, 200, 1, 0x444477, 0.3);

    this.previewName = this.add.text(510, 345, '', {
      fontSize: '18px',
      color: '#eeeeff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(20);

    this.previewStats = this.add.text(510, 400, '', {
      fontSize: '12px',
      color: '#8899bb',
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(20);

    // Cosmetic toggle area
    this.cosmeticText = this.add.text(680, 345, '', {
      fontSize: '11px',
      color: '#cc8833',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(20);

    this.cosmeticToggle = this.add.text(680, 365, '', {
      fontSize: '11px',
      color: '#6677aa',
      lineSpacing: 4,
    }).setOrigin(0, 0).setDepth(20);

    this.cosmeticButtons = [];

    // Controls hint
    this.add.text(480, 495, 'A/D or arrows to browse   ENTER/SPACE to select   C to cycle cosmetics', {
      fontSize: '10px',
      color: '#333355',
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(40, 500, '< BACK', {
      fontSize: '14px',
      color: '#886677',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#cc8899'));
    backBtn.on('pointerout', () => backBtn.setColor('#8866777'));
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
        elements.card.setStrokeStyle(3, 0x7788cc);
        elements.card.setFillStyle(0x222244, 1);
        if (elements.shadow) elements.shadow.setAlpha(0.4);
      } else {
        elements.card.setStrokeStyle(2, isUnlocked ? 0x4455aa : 0x222233);
        elements.card.setFillStyle(isUnlocked ? 0x151533 : 0x0e0e1a, 0.95);
        if (elements.shadow) elements.shadow.setAlpha(0.25);
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
      const color = isEquipped ? '#cc8833' : '#556688';

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
      SaveSystem.equipCosmetic(id, unlocked[0].id);
    } else if (currentIdx === unlocked.length - 1) {
      SaveSystem.equipCosmetic(id, null);
    } else {
      SaveSystem.equipCosmetic(id, unlocked[currentIdx + 1].id);
    }

    this.sound.play('sfx_buttonClick', { volume: 0.3 });
    this.selectIndex(this.selectedIndex);
  }

  confirmSelection() {
    const { isUnlocked } = this.cardElements[this.selectedIndex];
    if (!isUnlocked) {
      this.cameras.main.shake(50, 0.002);
      return;
    }

    this.sound.play('sfx_buttonClick', { volume: 0.4 });
    this.registry.set('character', this.charIds[this.selectedIndex]);
    this.scene.start('LevelSelect');
  }

  update(time) {
    for (const p of this.particles) {
      p.x += p._vx;
      p.y += p._vy;
      if (p.y < -5) p.y = 545;
      if (p.x < -5) p.x = 965;
      if (p.x > 965) p.x = -5;
      p.alpha = p._baseAlpha + Math.sin(time * 0.001 + p.x) * 0.08;
    }
  }
}
