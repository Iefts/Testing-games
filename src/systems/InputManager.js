import Phaser from 'phaser';

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
  }

  getMovementVector(playerX, playerY) {
    let x = 0;
    let y = 0;

    // Check keyboard first
    if (this.cursors.left.isDown || this.wasd.left.isDown) x -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) x += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) y -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) y += 1;

    // If no keyboard input, check pointer (mouse hold / touch)
    if (x === 0 && y === 0 && this.pointer.isDown) {
      const worldPoint = this.scene.cameras.main.getWorldPoint(
        this.pointer.x,
        this.pointer.y
      );
      const dx = worldPoint.x - playerX;
      const dy = worldPoint.y - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Dead zone of 8px to prevent jitter when pointer is on player
      if (dist > 8) {
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
