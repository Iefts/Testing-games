import Phaser from 'phaser';
import { VirtualJoystick } from '../ui/VirtualJoystick.js';

export class InputManager {
  constructor(scene) {
    this.scene = scene;

    // Keyboard input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Pointer state
    this.pointer = scene.input.activePointer;

    // Virtual joystick for mobile
    this.joystick = new VirtualJoystick(scene);
  }

  getMovementVector(playerX, playerY) {
    // Priority 1: Virtual joystick (touch)
    const joyVec = this.joystick.getVector();
    if (joyVec.x !== 0 || joyVec.y !== 0) {
      return joyVec;
    }

    let x = 0;
    let y = 0;

    // Priority 2: Keyboard
    if (this.cursors.left.isDown || this.wasd.left.isDown) x -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) x += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) y -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) y += 1;

    // Priority 3: Mouse/touch hold-to-move (only on desktop)
    if (x === 0 && y === 0 && this.pointer.isDown && !this.joystick.enabled) {
      const worldPoint = this.scene.cameras.main.getWorldPoint(
        this.pointer.x,
        this.pointer.y
      );
      const dx = worldPoint.x - playerX;
      const dy = worldPoint.y - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 16) {
        x = dx / dist;
        y = dy / dist;
      }
    }

    // Normalize diagonal movement for keyboard
    if (x !== 0 && y !== 0) {
      const len = Math.sqrt(x * x + y * y);
      x /= len;
      y /= len;
    }

    return { x, y };
  }
}
