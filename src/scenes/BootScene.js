import Phaser from 'phaser';
import { generateSprites } from '../utils/SpriteGenerator.js';
import { generateSounds } from '../utils/SoundGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.add.text(480, 270, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // StartArtwork is rendered as an HTML overlay to bypass pixelArt filtering
  }

  create() {
    generateSprites(this);

    // Set up spritesheet frames for player
    const tex = this.textures.get('player_sheet');
    tex.add(0, 0, 0, 0, 16, 16);   // idle
    tex.add(1, 0, 16, 0, 16, 16);  // walk1
    tex.add(2, 0, 32, 0, 16, 16);  // walk2
    tex.add(3, 0, 48, 0, 16, 16);  // walk3

    // Create animations
    this.anims.create({
      key: 'player_idle',
      frames: [{ key: 'player_sheet', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'player_walk',
      frames: [
        { key: 'player_sheet', frame: 1 },
        { key: 'player_sheet', frame: 0 },
        { key: 'player_sheet', frame: 2 },
        { key: 'player_sheet', frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Set up spritesheet frames for fencer
    const fencerTex = this.textures.get('fencer_sheet');
    fencerTex.add(0, 0, 0, 0, 16, 16);
    fencerTex.add(1, 0, 16, 0, 16, 16);
    fencerTex.add(2, 0, 32, 0, 16, 16);
    fencerTex.add(3, 0, 48, 0, 16, 16);

    this.anims.create({
      key: 'fencer_idle',
      frames: [{ key: 'fencer_sheet', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'fencer_walk',
      frames: [
        { key: 'fencer_sheet', frame: 1 },
        { key: 'fencer_sheet', frame: 0 },
        { key: 'fencer_sheet', frame: 2 },
        { key: 'fencer_sheet', frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Set up spritesheet frames for dealer
    const dealerTex = this.textures.get('dealer_sheet');
    dealerTex.add(0, 0, 0, 0, 16, 16);
    dealerTex.add(1, 0, 16, 0, 16, 16);
    dealerTex.add(2, 0, 32, 0, 16, 16);
    dealerTex.add(3, 0, 48, 0, 16, 16);

    this.anims.create({
      key: 'dealer_idle',
      frames: [{ key: 'dealer_sheet', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'dealer_walk',
      frames: [
        { key: 'dealer_sheet', frame: 1 },
        { key: 'dealer_sheet', frame: 0 },
        { key: 'dealer_sheet', frame: 2 },
        { key: 'dealer_sheet', frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Set up spritesheet frames for blood mage
    const bloodMageTex = this.textures.get('bloodMage_sheet');
    bloodMageTex.add(0, 0, 0, 0, 16, 16);
    bloodMageTex.add(1, 0, 16, 0, 16, 16);
    bloodMageTex.add(2, 0, 32, 0, 16, 16);
    bloodMageTex.add(3, 0, 48, 0, 16, 16);

    this.anims.create({
      key: 'bloodMage_idle',
      frames: [{ key: 'bloodMage_sheet', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'bloodMage_walk',
      frames: [
        { key: 'bloodMage_sheet', frame: 1 },
        { key: 'bloodMage_sheet', frame: 0 },
        { key: 'bloodMage_sheet', frame: 2 },
        { key: 'bloodMage_sheet', frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Set up spritesheet frames for snake swordsman
    const snakeTex = this.textures.get('snakeSwordsman_sheet');
    snakeTex.add(0, 0, 0, 0, 16, 16);
    snakeTex.add(1, 0, 16, 0, 16, 16);
    snakeTex.add(2, 0, 32, 0, 16, 16);
    snakeTex.add(3, 0, 48, 0, 16, 16);

    this.anims.create({
      key: 'snakeSwordsman_idle',
      frames: [{ key: 'snakeSwordsman_sheet', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'snakeSwordsman_walk',
      frames: [
        { key: 'snakeSwordsman_sheet', frame: 1 },
        { key: 'snakeSwordsman_sheet', frame: 0 },
        { key: 'snakeSwordsman_sheet', frame: 2 },
        { key: 'snakeSwordsman_sheet', frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Set up spritesheet frames for drone pilot
    const droneTex = this.textures.get('dronePilot_sheet');
    droneTex.add(0, 0, 0, 0, 16, 16);
    droneTex.add(1, 0, 16, 0, 16, 16);
    droneTex.add(2, 0, 32, 0, 16, 16);
    droneTex.add(3, 0, 48, 0, 16, 16);

    this.anims.create({
      key: 'dronePilot_idle',
      frames: [{ key: 'dronePilot_sheet', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'dronePilot_walk',
      frames: [
        { key: 'dronePilot_sheet', frame: 1 },
        { key: 'dronePilot_sheet', frame: 0 },
        { key: 'dronePilot_sheet', frame: 2 },
        { key: 'dronePilot_sheet', frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Generate sounds
    generateSounds(this);

    this.scene.start('Menu');
  }
}
