import Phaser from 'phaser';

export class VirtualJoystick {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.vector = { x: 0, y: 0 };
    this.maxRadius = 60;

    this.enabled = !scene.sys.game.device.os.desktop;

    if (!this.enabled) return;

    // Outer ring (base)
    this.baseOuter = scene.add.circle(0, 0, this.maxRadius + 4, 0xffffff, 0.08)
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(false);

    // Base circle with dashed-line look
    this.base = scene.add.circle(0, 0, this.maxRadius, 0xffffff, 0.12)
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(false)
      .setStrokeStyle(2, 0xffffff, 0.2);

    // Directional crosshair lines
    this.crossH = scene.add.rectangle(0, 0, this.maxRadius * 1.6, 1, 0xffffff, 0.08)
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(false);

    this.crossV = scene.add.rectangle(0, 0, 1, this.maxRadius * 1.6, 0xffffff, 0.08)
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(false);

    // Thumb outer glow
    this.thumbGlow = scene.add.circle(0, 0, 28, 0xffffff, 0.15)
      .setScrollFactor(0)
      .setDepth(151)
      .setVisible(false);

    // Thumb (inner)
    this.thumb = scene.add.circle(0, 0, 22, 0xffffff, 0.4)
      .setScrollFactor(0)
      .setDepth(152)
      .setVisible(false)
      .setStrokeStyle(2, 0xffffff, 0.5);

    // Center dot
    this.thumbDot = scene.add.circle(0, 0, 4, 0xffffff, 0.6)
      .setScrollFactor(0)
      .setDepth(153)
      .setVisible(false);

    this.pointerId = null;

    scene.input.on('pointerdown', (pointer, currentlyOver) => {
      if (this.pointerId !== null) return;
      if (currentlyOver && currentlyOver.length > 0) return;

      this.pointerId = pointer.id;
      this.active = true;
      this.originX = pointer.x;
      this.originY = pointer.y;

      this.showAt(pointer.x, pointer.y);
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

        const thumbX = this.originX + nx * clampedDist;
        const thumbY = this.originY + ny * clampedDist;

        this.thumb.setPosition(thumbX, thumbY);
        this.thumbGlow.setPosition(thumbX, thumbY);
        this.thumbDot.setPosition(thumbX, thumbY);

        this.vector.x = nx * (clampedDist / this.maxRadius);
        this.vector.y = ny * (clampedDist / this.maxRadius);

        // Adjust thumb opacity based on distance
        const intensity = clampedDist / this.maxRadius;
        this.thumb.setAlpha(0.3 + intensity * 0.3);
        this.thumbGlow.setAlpha(0.1 + intensity * 0.15);
      }
    });

    scene.input.on('pointerup', (pointer) => {
      if (pointer.id !== this.pointerId) return;

      this.active = false;
      this.pointerId = null;
      this.vector.x = 0;
      this.vector.y = 0;

      this.hideAll();
    });
  }

  showAt(x, y) {
    this.baseOuter.setPosition(x, y).setVisible(true);
    this.base.setPosition(x, y).setVisible(true);
    this.crossH.setPosition(x, y).setVisible(true);
    this.crossV.setPosition(x, y).setVisible(true);
    this.thumb.setPosition(x, y).setVisible(true);
    this.thumbGlow.setPosition(x, y).setVisible(true);
    this.thumbDot.setPosition(x, y).setVisible(true);
  }

  hideAll() {
    this.baseOuter.setVisible(false);
    this.base.setVisible(false);
    this.crossH.setVisible(false);
    this.crossV.setVisible(false);
    this.thumb.setVisible(false);
    this.thumbGlow.setVisible(false);
    this.thumbDot.setVisible(false);
  }

  getVector() {
    if (!this.enabled || !this.active) return { x: 0, y: 0 };
    return this.vector;
  }
}
