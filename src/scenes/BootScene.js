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

    // Generate sounds
    generateSounds(this);

    this.scene.start('Menu');
  }
}
