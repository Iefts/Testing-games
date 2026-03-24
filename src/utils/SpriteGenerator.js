export function generateSprites(scene) {
  generatePlayer(scene);
  generateSlime(scene);
  generateBullet(scene);
  generateXPGem(scene);
  generateGrass(scene);
  generateTree(scene);
  generateDart(scene);
  generateUnicorn(scene);
  generateAura(scene);
  generateSpear(scene);
}

function generatePlayer(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4-frame spritesheet (64x16): idle, walk1, walk2, walk3
  // Cowboy/gunslinger design: hat, vest, holster, boots

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 16; // x offset for each frame

    // Leg positions vary per frame for walk cycle
    const legOffset = [0, -1, 0, 1][frame]; // leg sway

    // Cowboy hat (dark brown, wide brim)
    gfx.fillStyle(0x5c3a1e);
    gfx.fillRect(ox + 3, 0, 10, 2);  // brim
    gfx.fillStyle(0x6b4226);
    gfx.fillRect(ox + 5, 0, 6, 1);   // top of hat
    gfx.fillRect(ox + 5, 1, 6, 1);   // hat body
    // Hat band (red)
    gfx.fillStyle(0xcc3333);
    gfx.fillRect(ox + 5, 2, 6, 1);

    // Head (skin)
    gfx.fillStyle(0xf5c69a);
    gfx.fillRect(ox + 5, 3, 6, 3);
    // Eyes
    gfx.fillStyle(0x000000);
    gfx.fillRect(ox + 6, 4, 1, 1);
    gfx.fillRect(ox + 9, 4, 1, 1);
    // Stubble/chin shadow
    gfx.fillStyle(0xd4a574);
    gfx.fillRect(ox + 6, 5, 4, 1);

    // Vest (dark leather brown)
    gfx.fillStyle(0x5c3a1e);
    gfx.fillRect(ox + 5, 6, 6, 5);
    // Shirt underneath (off-white)
    gfx.fillStyle(0xddccaa);
    gfx.fillRect(ox + 6, 6, 4, 4);
    // Vest lapels
    gfx.fillStyle(0x4a2e16);
    gfx.fillRect(ox + 5, 6, 1, 4);
    gfx.fillRect(ox + 10, 6, 1, 4);

    // Belt (dark) with gold buckle
    gfx.fillStyle(0x333333);
    gfx.fillRect(ox + 5, 10, 6, 1);
    gfx.fillStyle(0xffd700);
    gfx.fillRect(ox + 7, 10, 2, 1);

    // Arms (skin + gloves)
    gfx.fillStyle(0xf5c69a);
    gfx.fillRect(ox + 3, 7, 2, 2);
    gfx.fillRect(ox + 11, 7, 2, 2);
    // Gloves (dark brown)
    gfx.fillStyle(0x4a2e16);
    gfx.fillRect(ox + 3, 9, 2, 2);
    gfx.fillRect(ox + 11, 9, 2, 2);

    // Legs (brown pants) with walk animation
    gfx.fillStyle(0x6b5030);
    // Left leg
    gfx.fillRect(ox + 5, 11, 2, 3 + legOffset);
    // Right leg
    gfx.fillRect(ox + 9, 11, 2, 3 - legOffset);

    // Boots (dark with spur detail)
    gfx.fillStyle(0x3a2010);
    gfx.fillRect(ox + 4, 14 + legOffset, 3, 2 - Math.abs(legOffset));
    gfx.fillRect(ox + 9, 14 - legOffset, 3, 2 - Math.abs(legOffset));
    // Spur (silver)
    gfx.fillStyle(0xcccccc);
    if (frame === 0 || frame === 2) {
      gfx.fillRect(ox + 4, 15, 1, 1);
      gfx.fillRect(ox + 11, 15, 1, 1);
    }

    // Holster on right hip
    gfx.fillStyle(0x4a2e16);
    gfx.fillRect(ox + 11, 10, 1, 2);
  }

  gfx.generateTexture('player_sheet', 64, 16);
  gfx.destroy();

  // Create spritesheet from generated texture
  scene.textures.get('player_sheet').add('__BASE', 0, 0, 0, 64, 16);

  // Also create a single-frame 'player' texture for menus
  const singleGfx = scene.make.graphics({ add: false });
  // Draw just frame 0 as the 'player' key for character select
  const rt = scene.make.renderTexture({ width: 16, height: 16, add: false });
  const tempSprite = scene.add.sprite(0, 0, 'player_sheet').setOrigin(0, 0).setCrop(0, 0, 16, 16);
  rt.draw(tempSprite, 0, 0);
  rt.saveTexture('player');
  tempSprite.destroy();
}

function generateSlime(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 green slime blob
  gfx.fillStyle(0x44cc44);
  gfx.fillRect(3, 8, 10, 6);
  gfx.fillRect(2, 10, 12, 4);
  gfx.fillRect(4, 6, 8, 2);
  // Highlight
  gfx.fillStyle(0x66ee66);
  gfx.fillRect(4, 7, 3, 2);
  // Eyes
  gfx.fillStyle(0x000000);
  gfx.fillRect(5, 9, 2, 2);
  gfx.fillRect(9, 9, 2, 2);
  // Eye whites
  gfx.fillStyle(0xffffff);
  gfx.fillRect(5, 9, 1, 1);
  gfx.fillRect(9, 9, 1, 1);
  // Shadow underneath
  gfx.fillStyle(0x228822);
  gfx.fillRect(3, 14, 10, 1);
  gfx.generateTexture('slime', 16, 16);
  gfx.destroy();
}

function generateBullet(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4x4 yellow bullet
  gfx.fillStyle(0xffdd44);
  gfx.fillRect(1, 0, 2, 4);
  gfx.fillStyle(0xffaa00);
  gfx.fillRect(0, 1, 4, 2);
  gfx.generateTexture('bullet', 4, 4);
  gfx.destroy();
}

function generateXPGem(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 6x6 blue gem
  gfx.fillStyle(0x44aaff);
  gfx.fillRect(2, 0, 2, 1);
  gfx.fillRect(1, 1, 4, 1);
  gfx.fillRect(0, 2, 6, 2);
  gfx.fillRect(1, 4, 4, 1);
  gfx.fillRect(2, 5, 2, 1);
  // Highlight
  gfx.fillStyle(0xaaddff);
  gfx.fillRect(1, 2, 2, 1);
  gfx.generateTexture('xpGem', 6, 6);
  gfx.destroy();
}

function generateGrass(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 grass tile
  gfx.fillStyle(0x4a8c3f);
  gfx.fillRect(0, 0, 16, 16);
  // Random darker patches
  gfx.fillStyle(0x3d7a33);
  gfx.fillRect(2, 3, 2, 2);
  gfx.fillRect(10, 7, 3, 2);
  gfx.fillRect(6, 12, 2, 2);
  gfx.fillRect(13, 1, 2, 2);
  // Random lighter patches
  gfx.fillStyle(0x5a9c4f);
  gfx.fillRect(7, 2, 2, 1);
  gfx.fillRect(0, 9, 2, 1);
  gfx.fillRect(12, 13, 2, 1);
  gfx.fillRect(4, 7, 1, 1);
  gfx.generateTexture('grass', 16, 16);
  gfx.destroy();
}

function generateTree(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x24 tree
  // Trunk
  gfx.fillStyle(0x6b4226);
  gfx.fillRect(6, 14, 4, 10);
  // Trunk detail
  gfx.fillStyle(0x553318);
  gfx.fillRect(7, 16, 1, 4);
  // Leaves - layered circles
  gfx.fillStyle(0x2d6b1e);
  gfx.fillRect(2, 6, 12, 8);
  gfx.fillRect(1, 8, 14, 4);
  gfx.fillRect(4, 4, 8, 2);
  // Lighter leaves
  gfx.fillStyle(0x3d8b2e);
  gfx.fillRect(3, 5, 4, 4);
  gfx.fillRect(8, 7, 4, 3);
  // Top highlight
  gfx.fillStyle(0x4a9c3f);
  gfx.fillRect(5, 4, 3, 2);
  gfx.generateTexture('tree', 16, 24);
  gfx.destroy();
}

function generateDart(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 8x3 thin dart
  gfx.fillStyle(0xcccccc);
  gfx.fillRect(0, 1, 6, 1);
  // Tip
  gfx.fillStyle(0xff4444);
  gfx.fillRect(6, 0, 2, 3);
  gfx.fillStyle(0xdd2222);
  gfx.fillRect(7, 1, 1, 1);
  gfx.generateTexture('dart', 8, 3);
  gfx.destroy();
}

function generateUnicorn(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 32x24 unicorn with rider
  // Horse body (white)
  gfx.fillStyle(0xffffff);
  gfx.fillRect(8, 10, 16, 8);
  gfx.fillRect(6, 12, 2, 4);
  gfx.fillRect(24, 12, 2, 4);
  // Legs
  gfx.fillStyle(0xeeeeee);
  gfx.fillRect(10, 18, 2, 5);
  gfx.fillRect(14, 18, 2, 5);
  gfx.fillRect(19, 18, 2, 5);
  gfx.fillRect(23, 18, 2, 5);
  // Head
  gfx.fillStyle(0xffffff);
  gfx.fillRect(2, 8, 6, 5);
  // Horn (golden)
  gfx.fillStyle(0xffd700);
  gfx.fillRect(3, 4, 2, 4);
  gfx.fillRect(4, 2, 1, 2);
  // Eye
  gfx.fillStyle(0x000000);
  gfx.fillRect(3, 9, 1, 1);
  // Mane (purple)
  gfx.fillStyle(0xaa44ff);
  gfx.fillRect(6, 7, 3, 4);
  // Tail
  gfx.fillRect(25, 10, 4, 2);
  gfx.fillRect(27, 12, 3, 2);
  // Rider body
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(14, 4, 5, 6);
  // Rider head
  gfx.fillStyle(0xf5c69a);
  gfx.fillRect(15, 0, 3, 4);
  // Hooves
  gfx.fillStyle(0x888888);
  gfx.fillRect(10, 23, 2, 1);
  gfx.fillRect(14, 23, 2, 1);
  gfx.fillRect(19, 23, 2, 1);
  gfx.fillRect(23, 23, 2, 1);
  gfx.generateTexture('unicorn', 32, 24);
  gfx.destroy();
}

function generateAura(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 32x32 circular aura
  gfx.fillStyle(0x44aaff, 0.3);
  gfx.fillCircle(16, 16, 16);
  gfx.fillStyle(0x88ccff, 0.2);
  gfx.fillCircle(16, 16, 12);
  gfx.generateTexture('aura', 32, 32);
  gfx.destroy();
}

function generateSpear(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4x14 vertical spear pointing down
  // Shaft (brown wood)
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(1, 0, 2, 10);
  // Shaft detail
  gfx.fillStyle(0x6b4e10);
  gfx.fillRect(2, 1, 1, 8);
  // Spearhead (silver/steel)
  gfx.fillStyle(0xcccccc);
  gfx.fillRect(1, 10, 2, 2);
  gfx.fillRect(0, 11, 4, 2);
  // Tip
  gfx.fillStyle(0xeeeeee);
  gfx.fillRect(1, 13, 2, 1);
  gfx.generateTexture('spear', 4, 14);
  gfx.destroy();
}
