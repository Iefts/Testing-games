import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Assets will be loaded here as we add them
  }

  create() {
    this.scene.start('Game');
  }
}
