import Phaser from 'phaser';

export class VirtualJoystick {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.vector = { x: 0, y: 0 };
    this.maxRadius = 60;

    this.enabled = !scene.sys.game.device.os.desktop;

    if (!this.enabled) return;

    this.base = scene.add.circle(0, 0, this.maxRadius, 0xffffff, 0.2)
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(false);

    this.thumb = scene.add.circle(0, 0, 24, 0xffffff, 0.5)
      .setScrollFactor(0)
      .setDepth(151)
      .setVisible(false);

    this.pointerId = null;

    scene.input.on('pointerdown', (pointer, currentlyOver) => {
      if (this.pointerId !== null) return;
      // Don't start a joystick drag if the touch landed on a UI element
      // (emote button, etc.) — let that interaction take over.
      if (currentlyOver && currentlyOver.length > 0) return;

      this.pointerId = pointer.id;
      this.active = true;
      this.originX = pointer.x;
      this.originY = pointer.y;

      this.base.setPosition(pointer.x, pointer.y).setVisible(true);
      this.thumb.setPosition(pointer.x, pointer.y).setVisible(true);
    });

    scene.input.on('pointermove', (pointer) => {
      if (pointer.id !== this.pointerId || !this.active) return;

      const dx = pointer.x - this.originX;
      const dy = pointer.y - this.originY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        const clampedDist = Math.min(dist, this.maxRadius);
        const nx = dx / dist;
        const ny = dy / dist;

        this.thumb.setPosition(
          this.originX + nx * clampedDist,
          this.originY + ny * clampedDist
        );

        this.vector.x = nx * (clampedDist / this.maxRadius);
        this.vector.y = ny * (clampedDist / this.maxRadius);
      }
    });

    scene.input.on('pointerup', (pointer) => {
      if (pointer.id !== this.pointerId) return;

      this.active = false;
      this.pointerId = null;
      this.vector.x = 0;
      this.vector.y = 0;

      this.base.setVisible(false);
      this.thumb.setVisible(false);
    });
  }

  getVector() {
    if (!this.enabled || !this.active) return { x: 0, y: 0 };
    return this.vector;
  }
}
